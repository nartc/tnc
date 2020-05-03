---
title: Using root-provided Injectables in non-DI places
date: 2020-05-03T17:06:55.354Z
tags: ["Programming", "Angular"]
draft: false
cover: ../covers/dependency-injection.png
langs: ["en", "vi"]
---

Hi guys, welcome back to my blog 👋. Today, I want to share with you all about a trick that I've been using to access
`providedIn: 'root'` `Injectables` in places where **Dependency Injection** (DI) does not make sense in an **Angular**
application.

### Non-DI Places

What do I mean by _non-DI places_? In an **Angular** application, there are many different building blocks like: **Component**,
**Directives**, **Services**, and **Modules** etc. These building blocks are managed by **Angular** itself and can be accessed by
a built-in **Inversion of Control** (IoC) container aka **Dependency Injection**. Beside those, there are different places
that are **not** managed by **Angular**'s IoC. Namely, there are **Custom Reactive Form Validators** and **Custom RxJS Operators**

> and more, but I'll only touch on validators and operators.

Why? **Validators** and **Operators** are usually `pure functions` or `static functions` because they will be invoked by `Reactive Form` and `RxJS` respectively.
Because of that, we do not want to write these custom `validators` and `operators` with dependence to an `instance`, aka `this`. However without `this`,
DI becomes tricky because you cannot use the common DI pattern anymore, or **DI via constructor**.

```typescript
export class SomeService {
  constructor(private readonly otherService: OtherService) {}

  static someStaticFn() {
    // you can't access this.otherService in here
  }
}
```

### providedIn: 'root'

As some of you might have known, `providedIn: 'root'` is an extra option that you can pass in `@Injectable` decorator to let
**Angular** knows that you want to provide this `Injectable` in the _root_ **injector**. Using `providedIn: 'root'` will allow you
to have lazy-loaded singleton services.

### Use-case

Imagine you have a `LogService` that will handle API errors and log the errors to a 3rd-party logging service, like **ApplicationInsight**.
Let's take a look at the following pseudo-code

```typescript
@Injectable({ providedIn: "root" })
export class LogService {
  constructor(private readonly appInsight: ApplicationInsight) {}

  log(error: any) {
    this.appInsight.trackError(error);
  }
}
```

To use `LogService`:

```typescript
// somewhere in the codebase
this.httpClient.get(someUrl).pipe(
  catchError((err) => {
    console.log(err);
    this.logService.log(err);
    return throwError(err);
  })
);
```

The above works perfectly fine. But, you do not have ONE API call in the whole application. It is going to get very verbose
to apply that `catchError()` to every single API calls.

Then you remember you can create **Custom Operator** to encapsulate reusable logic. You go ahead and start putting together the following operator:

```typescript
export function logAndRethrowError<TInput = any>(): MonoTypeOperatorFunction<
  TInput
> {
  return catchError((err) => {
    console.log(err);
    // this.logService.log(err);
    return throwError(err);
  });
}
```

Now you realize that you need a `LogService` instance, you start refactoring the `operator` as follow:

```typescript
@Injectable({ providedIn: 'root' })
export class OperatorUtil {
    constructor(private readonly logService: LogService) {}

    logAndRethrowError<TInput = any>()L MonoTypeOperatorFunction<TInput> {
        return catchError(err => {
            console.log(err);
            this.logService.log(err);
            return throwError(err);
        });
    }
}
```

Everything looks good now and you can start using your custom operator:

```typescript
this.httpClient.get(someUrl).pipe(this.operatorUtil.logAndRethrowError());
```

> Of course, you would need to inject `OperatorUtil` in wherever you're calling `this.httpClient.get(...)`

The above approach works fine but there are a couple of things:

1. You would not want every new custom operators now need to be in `OperatorUtil` as instance methods
2. You would not like that You need to start injecting `OperatorUtil` everywhere you want to use those custom operators
3. You would want to stick with Pure Functions for custom operators.

### Solution

As you can see, without custom operators being instance methods, there is no way you can access the `this.logService` inside
of your custom operators. Is there a solution? Yes, there is.

> This solution applies to **Custom Validators** as **Custom Operators**. And this solution only works with `providedIn: 'root'` injectables.

The solution is to create a class called `RootInjector` (in fact, you can call it whatever you want) with some static properties and methods to
keep track of the root **Injector** that gets all the `providedIn: 'root'` providers.

```typescript
export class RootInjector {
  private static rootInjector: Injector;
  private static readonly $injectorReady = new BehaviorSubject(false);
  readonly injectorReady$ = this.$injectorReady.asObservable();

  static setInjector(injector: Injector) {
    if (this.rootInjector) {
      return;
    }

    this.rootInjector = injector;
    this.$injectorReady.next(true);
  }

  static get<T>(
    token: Type<T> | InjectionToken<T>,
    notFoundValue?: T,
    flags?: InjectFlags
  ): T {
    try {
      return this.rootInjector.get(token, notFoundValue, flags);
    } catch (e) {
      console.error(
        `Error getting ${token} from RootInjector. This is likely due to RootInjector is undefined. Please check RootInjector.rootInjector value.`
      );
      return null;
    }
  }
}
```

The above is `RootInjector` implementation. Now the question is "where to use it?" The answer is "main.ts". In `main.ts` (or your entry file), you'll always
call `bootstrapModule()` to start bootstraping your **Angular** application. `bootstrapModule()` returns a `Promise` with the `ModuleRef` as the resolved value.
And there is a property called `injector` on the `ModuleRef` that is exactly the root **injector** that we're interested in. To be more accurate, the `injector`
on `ModuleRef` is whatever module's injector we use to bootstrap. In most cases, it is `AppModule`. So you can guarantee that the Injectables which are provided in
this `injector` will be singletons throughout your application.

```typescript
platformBrowserDynamic.bootstrapModule(AppModule).then((ngModuleRef) => {
  RootInjector.setInjector(ngModuleRef.injector);
});
```

Now back to our `logAndRethrowError()` operator, we can leverage `RootInjector` to get the `LogService` singleton (since `LogService` is `providedIn: 'root'`)

```typescript
export function logAndRethrowError<TInput = any>(
  beforeRethrow?: (err?: any) => void
): MonoTypeOperatorFunction<TInput> {
  const logService = RootInjector.get(LogService);
  return catchError((err) => {
    console.log(err);
    logService.log(err);
    beforeRethrow?.(err);
    return throwError(err);
  });
}
```

> I added a `beforeRethrow` callback in case you want to execute additional logic before rethrow happens.

Then, we can change our `httpClient.get()` implementation a little bit to use `logAndRethrowError()`

```typescript
this.httpClient.get(someUrl).pipe(logAndRethrowError());
```

```typescript
// with callback
this.httpClient.get(someUrl).pipe(
  logAndRethrowError((err) => {
    this.toastService.error(err);
  })
);
```

### Summary

`RootInjector` is a nice and elegant way of keeping track of the root **injector** so that you can access the Injectables
anywhere throughout your application. Although, there are _gotchas_. `RootInjector` depends on the actual bootstrap process
of `AppModule` and if you try to access `RootInjector` before `AppModule` has been bootstrapped, exceptions will be thrown.
What are such occasions? `APP_INITIALIZER` and `Guards`/`Resolvers`/`ErrorHandler` that might halt the bootstrap process.

`RootInjector.injectorReady$` is a workaround for some cases where you want to use `RootInjector` in `AppComponent` to initialize
some data.

Hopefully, you learn something new today. Thanks for reading and I'll see you soon 🤞
