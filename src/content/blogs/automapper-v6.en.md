---
title: What's new in AutoMapper v6?
date: 2020-03-20T17:06:55.354Z
tags: ["Programming", "Typescript", "AutoMapper"]
draft: false
cover: ../covers/missing_puzzle.jpg
langs: ["en", "vi"]
---

Hi everyone, long time no see 👋. Today, I am very excited to talk to you guys about **AutoMapper** (`@nartc/automapper`) version 6.
This is a release with an _almost complete_ rewritten core and some small changes to the public API, for the better.

> If you do not know about **AutoMapper**, you can find out more about it via this blog post [Introduction to AutoMapper TypeScript](/blogs/introduction-to-automapper-typescript) or [Github](https://github.com/nartc/mapper)

## Update 03/24/2020

I have updated the benchmark code and have ran all benchmarks 100 times instead of 10 times. You can check out the benchmark repo [here](https://github.com/nartc/ng-automapper-bench)

## What's new?

This v6 release does not contain many changes regarding the public API but performance, bundle-size, critical bug fixes, and a stab at **JavaScript** support were the main targets of this release. Let's explore
💪

## Performance

For libraries that deal with transforming data like **AutoMapper**, performance is not to take lightly. However before we dive into the performance of **AutoMapper**, I want to
emphasize the initial purpose of me creating this library which is to transform **Domain Model (database)** to **View Model (client/frontend)** via API calls. This is to point out that
the number of items going back and forth Network Calls should not be too many like hundreds of thousands or millions of objects going through a single network call. With that in mind,
**mapping** such big amount of objects at once is not realistic in my opinion. Although, I would love for **AutoMapper** to have better performance than not. Let's take a look at some simple statistics, shall we?

First, let's look at the models I am going to use for this benchmark:

```typescript
class Bio {
  job: string;
  age: number;
  birthday: Date;
}

class User {
  firstName: string;
  lastName: string;
  bio: Bio;
}
```

and the correspond view models `UserVm`:

```typescript
class BioVm {
  job: string;
  isAdult: boolean;
  birthday: string;
}

class UserVm {
  first: string;
  last: string;
  full: string;
  bio: BioVm;
}
```

along with the following configuration:

```typescript
Mapper.createMap(User, UserVm)
  .forMember(
    (d) => d.first,
    mapFrom((s) => s.firstName)
  )
  .forMember(
    (d) => d.last,
    mapFrom((s) => s.lastName)
  )
  .forMember(
    (d) => d.full,
    mapFrom((s) => s.firstName + " " + s.lastName)
  );
Mapper.createMap(Bio, BioVm)
  .forMember(
    (d) => d.isAdult,
    mapFrom((s) => s.age > 18)
  )
  .forMember(
    (d) => d.birthday,
    mapFrom((s) => s.birthday.toDateString())
  );
```

Executing **map** from `User` to `UserVm` with the above configuration for 1K, 10K, and 100K items yields the following result:

|                        | 1K items | 10K items | 100K items |
| ---------------------- | -------- | --------- | ---------- |
| `@nartc/automapper` v5 | ~9ms     | ~88ms     | ~959ms     |
| `@nartc/automapper` v6 | ~8ms     | ~81ms     | ~785ms     |

> Each benchmark was ran ~10~ 100 times for each category 1K, 10K, and 100K then the average was taken

As you can see, **AutoMapper** v6 is slightly faster than v5, about 10-25% faster. And what really changed in v6? **AutoMapper** v6 does have some optimizations applied to it, as follow:

- Loops Optimization: v6 uses `while` loops that `for let` (the original `for` loop with index variable) was used in important places like: **map** and **initializing mapping properties**.
  In areas where `for let` is still used, v6 has the property `length` cached to avoid additional `property lookup` for every iterations.
- Accessing Array Index: v6 moves a large part of the core's data structures from `Object` to `Array` to also avoid `property lookup`. About this technique, there are still areas in the code base where this can be applied further.

> You can learn more about **Accessing Array Index** from the talk [How we make Angular fast](https://www.youtube.com/watch?v=EqSRpkMRyY4) by Misko Hevery

With the permission from [Yann Renaudin](https://twitter.com/YannRenaudin), [morphism](https://github.com/nobrainr/morphism) author, I would like to share `morphism` benchmark with the same mapping configuration as above:

```typescript
const morphismSchema = {
  first: "firstName",
  last: "lastName",
  full: ({ firstName, lastName }) => firstName + " " + lastName,
  bio: {
    job: "bio.job",
    isAdult: ({ bio }) => bio.age > 18,
    birthday: ({ bio }) => bio.birthday.toDateString(),
  },
};
```

> Each benchmark was ran ~10~ 100 times for each category 1K, 10K, and 100K then the average was taken

|                                 | 1K items | 10K items | 100K items |
| ------------------------------- | -------- | --------- | ---------- |
| `morphism`                      | ~15ms    | ~144ms    | ~1436ms    |
| `morphism` with `create-mapper` | ~15ms    | ~145ms    | ~1464ms    |
| `@nartc/automapper` v6          | ~8ms     | ~81ms     | ~785ms     |

This is just a simple comparison solely on the **mapping** part of the two libraries. Utility wise, `morphism` is a fantastic library that supports mapping with **schema configuration** and this suits
perfectly with **Vanilla JavaScript** projects, which do not have `classes` to model the data in the projects. You can also store the **schema configuration** elsewhere (database, CDN) and reuse the **schema configuration** without having the schema inside of your source code.
If you find `morphism` interesting, please check it out at [Github](https://github.com/nobrainr/morphism). Thank you [Yann](https://twitter.com/YannRenaudin) for allowing me to take `morphism` to do a simple
benchmark for **AutoMapper**.

## Small Bundle

Overall, the bundle-size of v6 is sightly smaller than v5. All of the utility functions and some of the core parts were cleaned up pretty heavily.
![](../images/automapper-v6/master.png)
_AutoMapper v5 bundle-size_
![](../images/automapper-v6/next.png)
_AutoMapper v6 bundle-size_

> Bundle-size is provided by [Bundlephobia](https://bundlephobia.com)

On other note, let's take another look at the above **mapping configuration** with the difference between v5 and v6:

```typescript
// v5
Mapper.createMap(User, UserVm)
  .forMember(
    (d) => d.first,
    (opts) => opts.mapFrom((s) => s.firstName)
  )
  .forMember(
    (d) => d.last,
    (opts) => opts.mapFrom((s) => s.lastName)
  )
  .forMember(
    (d) => d.full,
    (opts) => opts.mapFrom((s) => s.firstName + " " + s.lastName)
  );

// v6
Mapper.createMap(User, UserVm)
  .forMember(
    (d) => d.first,
    mapFrom((s) => s.firstName)
  )
  .forMember(
    (d) => d.last,
    mapFrom((s) => s.lastName)
  )
  .forMember(
    (d) => d.full,
    mapFrom((s) => s.firstName + " " + s.lastName)
  );
```

Did you spot the difference? In v6, the second parameter of `forMember()` is **no longer** `ForMemberOptions`. `ForMemberOptions` is an interface that contains all **mapping operations** like:
`mapFrom()`, `mapWith()`, `ignore()`, `condition()`, `fromValue()`, and some others. In v6, these **mapping operations** are separated into their own `Pure Functions`. This allows for `tree-shaking` tools to do their job.

> `tree-shaking` is a step during Build/Bundle. It means to eliminating dead-code (unused code). Dead code, like `Functions` that are declared but are not used, will be removed from the final bundle which results in a much smaller bundle-size. Only pay for what you use kind of thing.

## Critical Bug

In the previous versions of **AutoMapper**, all of the **Mappings** and **Profiles** were stored in a form of `Object` (or `Dictionary`) with their `prototype.name` as `key`. And whatever comes will come, these
`Object` uses `prototype.name` as their `keys` so when a consumer uses the library in Production environment, plugins like `Uglify` or `Terser` will minify the source code, resulting in these **Mapping** and **Profile**
class name are also "uglified" which ultimately leads to duplicate `keys` forcing **AutoMapper** to throw exceptions left and right.

v6 changes how it stores these classes with the use of some Singleton **Storages**. These singletons use `WeakMap` to store the classes themselves as `key` instead of using `prototype.name`. This guarantees the uniqueness
of the `keys` even after the minification process.

```typescript
// To demonstrate my point about prototype.name
class Foo {}

console.log(Foo.name); // logs Foo
console.log(Foo.prototype.constructor.name); // logs Foo
```

## JavaScript Support

Before v6, support for **JavaScript** is essentially non-existent. **AutoMapper** has been working only with **TypeScript** projects. From v6, this will change as **AutoMapper** will provide a new API
to work with **JavaScript**. Before introducing this API, I would like to skim through how **AutoMapper** works so you guys can understand how it has only been supporting **TypeScript**

**AutoMapper** works on the concept of **Metadata** (data about data) of the Models. For example, the above `User` model has the following information: `firstName` is a `string`, `lastName` is a string, and `bio` is a `Bio`.
These are so-called **Metadata**. To get a hold of these information at runtime, **AutoMapper** uses a decorator `@AutoMap()`. Afterwards, `MetadataStorage` will step in and store these metadata, that `@AutoMap()` provides, for each unique Model.
In **Vanilla JavaScript** projects, it is quite complicated to setup your project to use `decorators`, and **AutoMapper** itself did not have any API to support **JavaScript**.

The API that v6 will provide is: `createMapMetadata()`. This API will simulate how `@AutoMap()` works so metadata can be stored. However, this early-versioned API will still require the consumers to provide some amount of boiler-plate code

```javascript
class User {}
class UserVm {}

class Bio {}
class BioVm {}
```

**JavaScript** does not have Type Declaration so `fields` do not have to be declared. But these empty classes are required to ensure the uniqueness of the Models.

```javascript
createMapMetadata(Bio, {
  job: String,
  age: Number,
  birthday: Date,
});
createMapMetadata(User, {
  firstName: String,
  lastName: String,
  bio: Bio,
});
createMapMetadata(BioVm, {
  job: String,
  isAdult: Boolean,
  birthday: String,
});
createMapMetadata(UserVm, {
  first: String,
  last: String,
  full: String,
  bio: BioVm,
});
```

Too boiler-platey right? Well, consumers do not have to provide information for each and every fields like above. Only fields that **ARE NOT** configured manually by `.forMember()` are required to be provided.
So with the configuration in the beginning of the blog, `isAdult` and `birthday` from `BioVm` do not have to be provided in `createMapMetadata`. Likewise, `first`, `last`, and `full` do not have to be provided for `UserVm`.

```javascript
createMapMetadata(Bio, {
  job: String,
  age: Number,
  birthday: Date,
});
createMapMetadata(User, {
  firstName: String,
  lastName: String,
  bio: Bio,
});

createMapMetadata(BioVm, {
  job: String,
});
createMapMetadata(UserVm, {
  bio: BioVm,
});
```

The similar is applied for when consumers configure reverse mapping for `UserVm -> User` (or `BioVm -> Bio`). Fields that **ARE** configured manually by `.forPath()` (if `reverseMap()` is used) and/or `.forMember()`
are not required to be provided in `createMapMetadata`.

## Can I try?

You can try out **AutoMapper** v6 by installing the next version of the library

```
npm i @nartc/automapper@next
```

## Migrate from v5

- Like mentioned above, the **mapping operations** are separate functions in v6. So you configuration needs to be changed:

```typescript
// before
Mapper.createMap(User, UserVm)
    .forMember(d => d.full, opts => opts.mapFrom(s => s.first + ' ' + s.last)
    .forMember(d => d.foo, opts => opts.ignore());

// after
Mapper.createMap(User, UserVm)
    .forMember(d => d.full, mapFrom(s => s.first + ' ' + s.last)
    .forMember(d => d.foo, ignore())
```

- `Mapper.initialize()` has been deprecated. Please use `Mapper.createMap()`, `Mapper.addProfile()`, and `Mapper.withGlobalSettings()` directly.
- All functions that receive `Profile` and `NamingConvention` as arguments are now expecting the `Class` instead of the instance.

```typescript
// before
Mapper.createMap(User, UserVm, {
  sourceMemberNamingConvention: new PascalCaseNamingConvention(),
});

// after
Mapper.createMap(User, UserVm, {
  sourceMemberNamingConvention: PascalCaseNamingConvention,
});
```

You can learn more from the [documentation](https://automapper.netlify.com/docs/next/introduction/why) for the next version.

## Conclusion

Again, I am very excited to share these changes with you in **AutoMapper** v6. Same as my previous blog posts about **AutoMapper**, I hope people will give **AutoMapper** a try should the library fits their use-cases.
Thank you for reading and I will see you in the next one. 👋
