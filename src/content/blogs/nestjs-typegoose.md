---
title: NestJS + Typegoose
date: 2019-12-10T17:06:55.354Z
tags: ["Programming", "Typescript", "NestJS"]
draft: false
cover: ../covers/nestjs.jpg
langs: ["en"]
---

Today, I am going to share with you a workflow/technique (whatever you want to call it 🗿) that I've been using when I work with **NestJS** and **MongoDB**. This workflow leverages the power of **TypeScript** and an `npm` package called [Typegoose](https://github.com/typegoose/typegoose). This blog will be a quick one so let's jump in.

> I'd assume you're already familiar with **NestJS** and **MongoDB** (**Mongoose** ODM to be exact)

Start off by initializing a new **NestJS** application with `@nestjs/cli`
 
```bash
nest new nest-typegoose
cd nest-typegoose
```

Then, delete `app.controller.ts` and `app.service.ts`. Modify your `app.module.ts`:

```diff
import { Module } from '@nestjs/common';
- import { AppController } from './app.controller';
- import { AppService } from './app.service';

@Module({
  imports: [],
-  controllers: [AppController],
-  providers: [AppService],
})
export class AppModule {}
```

Next, let's install our `dependencies`

```bash
yarn add @nestjs/mongoose mongoose @typegoose/typegoose
yarn add --dev @types/mongoose
```

Alright, let's get started. First thing first, let's wire up our **Mongo connection** using `nestjs/mongoose`. Open up `app.module.ts`

```typescript{6-8}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nestjs-typegoose', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],
})
export class AppModule {}

```

> Again, I assume you're familiar with **MongoDB** and are able to spin up an instance of **MongoDB** running locally either installing **MongoDB** on your machine or using **Docker**. I'd recommend the latter.

Now, you can try running your server: 

```bash
yarn start:dev
```

you should see the following:

```shell script
10:14:05 PM - File change detected. Starting incremental compilation...


10:14:05 PM - Found 0 errors. Watching for file changes.
[Nest] 16093   - 12/10/2019, 10:14:05 PM   [NestFactory] Starting Nest application...
[Nest] 16093   - 12/10/2019, 10:14:06 PM   [InstanceLoader] AppModule dependencies initialized +23ms
[Nest] 16093   - 12/10/2019, 10:14:06 PM   [InstanceLoader] MongooseModule dependencies initialized +0ms
[Nest] 16093   - 12/10/2019, 10:14:06 PM   [InstanceLoader] MongooseCoreModule dependencies initialized +15ms
[Nest] 16093   - 12/10/2019, 10:14:06 PM   [NestApplication] Nest application successfully started +7ms
```

Let's create a couple of files:

```bash
mkdir src/shared # I like to have a "shared" directory. You can name it whatever you like
touch src/shared/base.model.ts # a base model file
touch src/shared/base.service.ts # a base service file. I'll explain more about this in a bit
```

Open up the `base.model.ts` then put in the following:

```typescript
import { Schema } from 'mongoose';
import { buildSchema, prop } from '@typegoose/typegoose';

export abstract class BaseModel {
  @prop()
  createdDate?: Date; // provided by timestamps
  @prop()
  updatedDate?: Date; // provided by timestamps
  id?: string; // is actually model._id getter
  // add more to a base model if you want.

  static get schema(): Schema {
    return buildSchema(this as any, {
      timestamps: true,
      toJSON: {
        getters: true,
        virtuals: true,
      },
    });
  }

  static get modelName(): string {
    return this.name;
  }
}
```

Let's go through the code to understand it:

1. Create an `abstract` class so it **cannot** be initialized (`new() up`) accidentally. `abstract` also annotates that this class is only meant to be extended.
2. `createdDate`, `updatedDate` and `id` are the three fields that **ALL** of my **Domain Models** (or **Data Model** or **Mongo Model**, it's up to you) will have. `createdDate` and `updatedDate` are provided automatically if you turn `timestamps` to `true`. `id` is actually a getter of `_id` so it's always there, but to be able to grab `id` when paired with `.lean()` or `.toJSON()`, you need to set the `toJSON: {...}` option as shown.
3. `@prop()` annotates the field that it's part of the `schema`. Learn more at [typegoose](https://github.com/typegoose/typegoose) 
4. `static get schema()`. The magic is here. With the latest release, `typegoose` actually makes their API more *Functional* in a way that they expose **functions** like `getModelForClass()` and `buildSchema()` separately instead of having them as `static functions` on the `Typegoose` class which makes this technique/pattern/workflow possible. Why do we need `buildSchema()`? Well, `MongooseModule` from `nestjs/mongoose` requires two things to create a certain `MongooseModel` for you: `Schema` and `name`. `buildSchema()` will help us get the `Schema`, the `name` can be anything. How it works is we call `buildSchema()` and pass in `this`. `this` in this case, inside of a `static` method, is the actual class itself which invokes `schema` getter, making it possible to put `get schema()` on the `abstract` class so we can **DRY** up a bit here. Before, we need to write methods to grab `schema` and `modelName` for each **Domain Model** class which is kinda *boiler-platey*
5. `static get modelName()`. Pretty simple here. We just return `this.name` and `this`, again in the context of a `static` method, points to the actual class so `this.name` returns the class name. However, if you're skeptical, you might want to return something else or just have a function that will do some magic to return some meaningful name for your `MongooseModel`. I tend to return `this.name` here because I use `this.name` on couple more places like `Swagger UI` to annotate the `Tags`.

Now we have our `BaseModel`, let's take care of `BaseService`. Open `base.service.ts` and paste in the following code (or you can type if you like). But before showing the code, I'd like to explain a bit.

Why `BaseService`? I used to be a fan of [Repository Pattern](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design#the-repository-pattern) and `base.service.ts` would have been `base.repository.ts` if I was still a fan. Don't get me wrong, I still like the pattern. However, working with an **ODM** like `mongoose`, I feel like the `MongooseModel` kind of acts like a `Repository` already. Hence, I tend to *get rid* of the **Repository Layer** to decrease the amount of abstractions I have throughout the application. Again, it depends on the characteristics of the application's requirements. I just want to get my point across and want to explain why I do things the way I do things. Now that we're clear on this, let's move on:

```typescript
import { InternalServerErrorException } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { MongoError } from 'mongodb';
import { DocumentQuery, Types, Query } from 'mongoose';
import { BaseModel } from './base.model';

type QueryList<T extends BaseModel> = DocumentQuery<
  Array<DocumentType<T>>,
  DocumentType<T>
>;
type QueryItem<T extends BaseModel> = DocumentQuery<
  DocumentType<T>,
  DocumentType<T>
>;

export abstract class BaseService<T extends BaseModel> {
  protected model: ReturnModelType<AnyParamConstructor<T>>;

  protected constructor(model: ReturnModelType<AnyParamConstructor<T>>) {
    this.model = model;
  }

  protected static throwMongoError(err: MongoError): void {
    throw new InternalServerErrorException(err, err.errmsg);
  }

  protected static toObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId(id);
    } catch (e) {
      this.throwMongoError(e);
    }
  }

  createModel(doc?: Partial<T>): T {
    return new this.model(doc);
  }

  findAll(filter = {}): QueryList<T> {
    return this.model.find(filter);
  }

  async findAllAsync(filter = {}): Promise<Array<DocumentType<T>>> {
    try {
      return await this.findAll(filter).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  findOne(filter = {}): QueryItem<T> {
    return this.model.findOne(filter);
  }

  async findOneAsync(filter = {}): Promise<DocumentType<T>> {
    try {
      return await this.findOne(filter).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  findById(id: string): QueryItem<T> {
    return this.model.findById(BaseService.toObjectId(id));
  }

  async findByIdAsync(id: string): Promise<DocumentType<T>> {
    try {
      return await this.findById(id).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  async create(item: T): Promise<DocumentType<T>> {
    try {
      return await this.model.create(item);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  delete(filter = {}): QueryItem<T> {
    return this.model.findOneAndDelete(filter);
  }

  async deleteAsync(filter = {}): Promise<DocumentType<T>> {
    try {
      return await this.delete(filter).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  deleteById(id: string): QueryItem<T> {
    return this.model.findByIdAndDelete(BaseService.toObjectId(id));
  }

  async deleteByIdAsync(id: string): Promise<DocumentType<T>> {
    try {
      return await this.deleteById(id).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  update(item: T): QueryItem<T> {
    return this.model.findByIdAndUpdate(BaseService.toObjectId(item.id), item, {
      new: true,
    });
  }

  async updateAsync(item: T): Promise<DocumentType<T>> {
    try {
      return await this.update(item).exec();
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  count(filter = {}): Query<number> {
    return this.model.count(filter);
  }

  async countAsync(filter = {}): Promise<number> {
    try {
      return await this.count(filter);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }
}
``` 

Whew, I know it's a lot of code. But what did we do here?

1. Again, another `abstract` class to make sure we do not `new()` this one up accidentally. This takes in a **Type Parameter** `T extends BaseModel`. This is where **TypeScript** comes in with its `Advanced Types`. Here, we explicitly say `T extends BaseModel` so that we can only pass actual **Domain Model** classes to this `BaseService`, just another *safety* thing that you could get with **TypeScript** to prevent passing **ANY** as the **Type Parameter**.
2. Declare a `protected` field called `model` with the type of `ReturnModelType<AnyParamConstructor<T>>`. Wow, such a mouthful. What `ReturnModelType<AnyParamConstructor<T>>` really is is just the type that `mongoose.model()` will return. **Wait, isn't there `Model<T>`?**, yes there is. But `Model<T>` expects `T` to be an `interface` that `extends mongoose.Document`. With `typegoose`, everything is `class` here so we can't really utilize the *simpler* way with `Model<T>`. Another notion is making the `model` `protected` means only the sub-class can have access to this field so we don't expose `someService.model` in any other layers of the application (like the **Controller Layer**)
3. Setup a `protected constructor`. Pretty straight forward here.
4. Setup a plethora of methods that wrap around `mongoose.Model`'s methods and return appropriate types. You've probably already noticed that we have **two** versions for each method. The first version returns a `DocumentQuery` which allows you to **chain** methods to further: `filter`, `project`, and some other stuffs like `populate` or `lean`. The 2nd version (`async` version) helps with situations where you don't care about any other **chainable** methods and just want to grab the data quickly. The `async` version will also have error handler where we throw an `InternalServerErrorException` with the `MongoError`. I will go back to this in the **bonus** section.

> You can abstract more methods if you want to but for me, these work for most cases.

Now that we have a `BaseModel` and a `BaseService` both of which we can use to extend our **Domain Model** classes and respective **Services**. Let's try creating one real quick here:

```bash
nest generate module product
nest generate service product --no-spec
nest generate controller product --no-spec

touch src/product/product.model.ts
```

Open `product.model.ts` and paste/type in the following:

```typescript
import { prop } from '@typegoose/typegoose';
import { BaseModel } from '../shared/base.model';

export class Product extends BaseModel {
  @prop()
  name: string;
  @prop()
  description: string;
  @prop()
  price: number;
}
```

We extend `BaseModel` and define 3 fields on our `Product`. These are arbitrary. Next, open `product.module.ts`:

```typescript{8-12}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { Product } from './product.model';
import { ProductService } from './product.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.modelName, schema: Product.schema },
    ]),
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
```

The important piece here is we call `MongooseModule.forFeature` and pass in an array of `models`. `MongooseModule.forFeature` will grab the current `mongoose.Connection` and add the models passed in then provide those models in **NestJS's IoC Container** (for **Dependency Injection**). Now you can see that the `schema` and `modelName` are important and the `BaseModel` helps quite a bit here.

Next, let's open `product.service.ts` and **type** the following:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { BaseService } from '../shared/base.service';
import { Product } from './product.model';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectModel(Product.modelName)
    private readonly productModel: ReturnModelType<typeof Product>,
  ) {
    super(productModel);
  }
}
```

And that's it. See why I bolded **type**. With the `BaseService` all setup, your `ProductService` now has all the methods available to use. However, most of the cases you would need to add additional methods that are a bit more *specialized* for specific business logic.

Finally, let's just inject `ProductService` in `product.controller.ts` and start hacking:

```typescript
import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
}
```

Even though this is a really minimal example but I hope it shows you how to utilize **TypeScript** and **Typegoose** to abstract some **base** to speed up your development processes. Moreover, you can even have a `BaseController` that will have a `protected baseService` that will cover your basic `CRUD` functionalities. That's it for me today, guys. Have fun and good luck 🍀

## Bonus

Remember the `throwMongoError` piece? Now I will show you how you can have a more uniformed way of handling `HttpException` (`InternalServerErrorException` is an instance of `HttpException`) using **NestJS Exception Filters**. Let's get started, shall we?

```bash
mkdir src/shared/filters
touch src/shared/filters/http-exception.filter.ts
touch src/shared/api-exception.model.ts
```

Open `api-exception.model.ts`:

```typescript
import { HttpStatus } from '@nestjs/common';

export class ApiException {
  statusCode?: number;
  message?: string;
  status?: string;
  error?: string;
  errors?: any;
  timestamp?: string;
  path?: string;
  stack?: string;

  constructor(
    message: string,
    error: string,
    stack: string,
    errors: any,
    path: string,
    statusCode: number,
  ) {
    this.message = message;
    this.error = error;
    this.stack = stack;
    this.errors = errors;
    this.path = path;
    this.timestamp = new Date().toISOString();
    this.statusCode = statusCode;
    this.status = HttpStatus[statusCode];
  }
}
```

We create an `ApiException` class (you can call it whatever you want) to model our **API Error**. Self-explanatory, right?

Then open `http-exception.filter.ts`:

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../api-exception.model';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse() as Response;
    const req = ctx.getRequest();
    const statusCode = error.getStatus();
    const stacktrace = error.stack;
    const errorName = error.response.name || error.response.error || error.name;
    const errors = error.response.errors || null;
    const path = req ? req.url : null;

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      if (typeof error.response !== 'string') {
        error.response.message =
          error.response.message ||
          'You do not have permission to access this resource';
      }
    }

    const exception = new ApiException(
      error.response.message,
      errorName,
      stacktrace,
      errors,
      path,
      statusCode,
    );
    res.status(statusCode).json(exception);
  }
}
```

So if you recall, we throw an `InternalServerErrorException` for `throwMongoError` which will be caught by this `HttpExceptionFilter` because we decorate it with `@Catch(HttpException)`. That's how `Exception Filter` works. You can `@Catch()` some very specific error classes if you desire to. `Exception Filter` allows you to have access to the `ExecutionContext` which lets you know that your application is a `HttpServer` which has access to `Request` and `Response` (from `express`). Then from those information, you can construct an uniformed error and call `res.status(Status).json()` to return a meaningful, uniformed error to the client. The client will always get the same shape of error which allows them to handle the error more efficiently and consistently.

To activate the `HttpExceptionFilter`, open `main.ts` and add the following line:

```typescript{7}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

Now, all of your `HttpException` thrown from **ANYWHERE** in the application will be filtered by `HttpExceptionFilter` and will be returned with an instance of `ApiException` 👍
