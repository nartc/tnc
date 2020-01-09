---
title: Why I (want to) build an AutoMapper in TypeScript?
date: 2019-10-16T17:06:55.354Z
tags: ["Programming", "Typescript", "AutoMapper"]
draft: false
cover: ../covers/missing_puzzle.jpg
langs: ["en"]
---

Hey, it's been around a month since my last blog post 😢. Work has been pretty busy lately for me. Talk about work, this week marks my 2 years as a **Developer** at [ArchitectNow](http://architectnow.net). Over the course of 2 years, I've learned so many cool technologies like: `.NET Core`, `Swagger/OpenAPI` and especially `AutoMapper`.

![automapper-csharp](../images/automapper-csharp.jpg)
_Original .NET AutoMapper_

`AutoMapper` is "A convention-based object-object mapper. 100% organic and gluten-free. Takes out all of the fuss of mapping one object to another." created by **Jimmy Bogard** ([Github](https://github.com/AutoMapper/AutoMapper)). It's a pretty simple description of what `AutoMapper` is, ain't it? Well, it does a lot for you. And it's an awesome tool given the very high capability of [Reflection](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/reflection) in `C#`.

## But why AutoMapper?

tldr; `AutoMapper` is a tool that provides `Object Mapping` by **convention**. If you construct your `View Models` consistently with your `Domain Models`, then you have established a **convention** and `AutoMapper` is a great tool for situations like this. It will take away all the _boring_ mapping. You can read the whole blog post here: [Automappers Design Philosophy](https://jimmybogard.com/automappers-design-philosophy/). I'll quote the last part of the blog here:

> AutoMapper works because it enforces a convention. It assumes that your destination types are a subset of the source type. It assumes that everything on your destination type is meant to be mapped. It assumes that the destination member names follow the exact name of the source type. It assumes that you want to flatten complex models into simple ones.

> All of these assumptions come from our original use case - view models for MVC, where all of those assumptions are in line with our view model design. With AutoMapper, we could enforce our view model design philosophy. This is the true power of conventions - laying down a set of enforceable design rules that help you streamline development along the way.

> By enforcing conventions, we let our developers focus on the value add activities, and less on the activities that provided zero or negative value, like designing bespoke view models or writing a thousand dumb unit tests.

> And this is why our usage of AutoMapper has stayed so steady over the years - because our design philosophy for view models hasn't changed. If you find yourself hating a tool, it's important to ask - for what problems was this tool designed to solve? And if those problems are different than yours, perhaps that tool isn't a good fit.

## AutoMapper is not _that_ well-known, and _hated_

I know of `AutoMapper` through work and I was (still am) very impressed with how convenient `AutoMapper` is. But I'm a tad surprised when no one really knows what `AutoMapper` is when I ask around. If people don't really know what `AutoMapper` is, it kind of defeats my purpose of creating it in `TypeScript` and will be really hard to promote it 😅. This [Reddit post](https://www.reddit.com/r/javascript/comments/4tg69t/question_typescript_auto_mapping/) also discusses about whether you want to use `AutoMapper` in your project. There is also a plethora of blog posts about _"Why No AutoMapper?"_ (I was googling for _Why AutoMapper?_ 😅). Here's one of them (and it's a good blog post to be honest with you) [Why I Don't Use AutoMapper](https://cezarypiatek.github.io/post/why-i-dont-use-automapper/).

## But I still want to use AutoMapper in TypeScript

Like I mentioned above (and also in some of the blog posts), `AutoMapper` in the `TypeScript` world isn't really a thing because of how limited the `Reflection Capability` in `TypeScript` is. It is not as good as `C#` because in the end, `TS` is compiled down to a dynamic language, `JS`, anyway. 

Let me dial back to why we use `AutoMapper` at work in the first place. At **ArchitectNow**, we utilize `Swagger/OpenAPI` heavily to document our APIs, and combined with tools like `NSwag` or `swagger-codegen`, we have an automation pipeline to generate `HTTP calls` for client-side applications: a web app or a mobile app. Basically, we have our `Domain Models` which are the shape of data that will go in the `Persistence Layer` (Database) of the application. On one hand, we also have _conventionally matching_ `View Models` that will be exposed to be used by the Clients via `Controllers` (API Endpoints). Without `AutoMapper`, we would have to "manually" map a lot of data back and forth on every single API calls. Everything's good on the `C#` side of things, because we have `AutoMapper`.

On the `NodeJS` side, we take a big interest in `NestJS`. If you don't know what `NestJS` is, you can learn about it [here](https://nestjs.com). tldr; `NestJS` is a `NodeJS` framework that takes on _Angular-like_ architecture which helps with building maintainable and scalable server-side applications. When building `NestJS` applications, we use the same approach as we build a `.NET Core` application. `Domain Models` <=> `View Models`. Unfortunately, there isn't a "good enough" `AutoMapper` library in the `TypeScript` world. There are some worth mentioning:

-   [automapper-ts](https://github.com/loedeman/AutoMapper)  by Bert Loedeman - This is the closest, in terms of syntax, to the original `AutoMapper`.
-   [@wufe/mapper](https://github.com/Wufe/mapper) by Simone Bembi - This is also a very nice library. 
-   [morphism](https://github.com/nobrainr/morphism) by Yann RENAUDIN - This is an interesting library. Not really `AutoMapper` but it might do the job.

...but all of them have some problems, for me. `automapper-ts` is a bit outdated and doesn't seem to be actively maintained. `@wufe/mapper` is also great but doesn't support as much as I like it to and it might be hard/long for features that I might want/look for in an `AutoMapper` tool to be supported. Last but not least, `morphism` is something that comes up in my search and it looks super interesting, its syntax does not adhere to `AutoMapper` syntax however.

With all of these in mind, I've decided to take a stab at creating my own `AutoMapper` in `TypeScript`, mainly inspired by `automapper-ts`.

## Problems with TypeScript

Again, `Reflection` is a big part in trying to solve the **auto** part of `AutoMapper`. Let's look at one example:

```typescript
class User {
  firstName: string;
  lastName: string;
}
```

the above `.ts` block will be compiled to `.js`:

```javascript
class User {}

// or in older ES
function User() {}
```

So now when you try to instantiate a `new User()` by writing the following:

```typescript
const user = new User();
console.log(user);

// User { firstName: undefined, lastName: undefined }; at least this was my expectation

// but in reality, you'll get: User {}
```

Uh...where's my `firstName` and `lastName`? Let's look at another code block before I explain why `firstName` and `lastName` are important:

```csharp
// SomeFileName.cs

// Same Domain model as in TypeScript
class User {
    public string FirstName {get; set;}
    public string LastName {get; set;}
    // ... some additional properties ...
}

// Some ViewModel class
class UserVm {
    public string FirstName {get; set;}
    public string LastName {get; set;}
    // ... some additional properties ...
}

...
// Create the Mapping between User and UserVm
CreateMap<User, UserVm>();
...

...
// Actual map from User to UserVm
var userVm = Mapper.Map<UserVm>(user);
...
```   

In the `C#` world,  `AutoMapper` will be able to map `User.FirstName` to `UserVm.FirstName` because of **Convention**. They share the same property name `FirstName`. On the contrary in `TS`, you cannot do that without having to do a bit more work. The `User` instance in `TS` doesn't contain any `properties` because we never **actually declared** them in our `User` class. Remember what I said about `Typings` will NOT be persisted earlier, this is exactly that problem.

You can _kinda_ fix the problem by writing the following:

```typescript
class User {
  constructor(public firstName: string, public lastName: string) {}
}
```

Now, the compiled `JS` code will look something like:

```javascript
class User {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
```

You can see that we now **actually declared** `firstName` and `lastName` on `this` instance when we `new()` up one. Hence, when you do the following:

```typescript
const user = new User();
console.log(user);
// logs User {firstName: undefined, lastName: undefined};
```

Great! I have `firstName` and `lastName` in my `User` instance. But why are those important? Because we have to `auto-map` them. Technically with `AutoMapper`, you never really do a map manually by: `userVm.firstName = user.firstName`, `AutoMapper` is supposed to do that for you. What we can do to help `AutoMapper` (actually, we **need** to) is to `create a Mapping between a Source and a Destination` (`User` as Source and `UserVm` as Destination in this case).

I expect my `automapper` to do the following when it starts mapping `User -> UserVm`:

-   Create a new instance of `UserVm` (1)
-   Loop through the `keys` on (1)
-   Grab the value for the same key on `User` object passed in.
-   Assign the "found" value on (1)

Something like this in code:

```typescript
const destination = new UserVm();

for (const key in Object.keys(destination)) {
  // do some null check for source[key]
  // if key exists on source, then
  destination[key] = source[key]
}

return destination;
```

Without `firstName` and `lastName` being "visible" on a new instance of `UserVm`, it is impossible to map in this case because `Object.keys(destination)` will return an empty `[]`. There was no key on `destination`. The `short-hand` syntax to declare class properties inside of `constructor` was my first iteration of the library. Shortly after, I tried to utilize `reflect-metadata` to declare the properties on the `class` "automatically". However, I kinda ran into the same problem which was no properties was there in the first place to grab. `Class Decorator` does not provide any information about its property and `Property Decorator` is kind of verbose but `Property Decorator` is like my only answer to this at the moment. Talk about `Property Decorator`, I suddenly remembered a library that kind of has that already, which is `class-transformer`. I turn to `class-transformer` for not having to reinvent the wheel (well, for being lazy 😅). This library provides three things that I need:

-   `@Expose` and `@Type` decorators. `@Expose` solves the problem with a property being visible on a new instance. `@Type` solves the same problem, but with nested model.
-   `plainToClass()` method. `plainToClass` works in sync with `Expose` and `Type` to give you an instance with all of its properties "exposed" to be able to map.

Hence, I've decided to include `class-transformer` as one of my library's dependency. Well, before you judge me, I did try to build `Expose`, `Type` and `plainToClass` by myself using `reflect-metadata`. However, the difference in bundle size between including `class-transformer` vs a half-baked internal implementation is **0.3kb**. Not really worth it NOT to include `class-transformer`. Plus, `class-transformer` provides a lot more than my implementation.

## Conclusion

There are a lot more problems that I've faced and am still facing while trying to build this **first** library. Namely, they are features that the original `AutoMapper` supports like: `Reverse Mapping`, `Type Converters` etc... which I will go through each one in more detail in the next blog. I also face problem with getting a value on an object with a path which I turn to `lodash.get` (because I'm lazy to implement it and I probably won't implement it to cover enough cases like `Lodash` does aka best excuse ever!). Keeping the syntax as close to `AutoMapper` as possible is also a pain point, Fluent API 💪. In the end, I am proud of myself for doing what I'm doing. Trust me, you're going to learn so much when you try to build a library, or a solution to your problem in general. Sharing my thoughts and my work with others is such a great way to reflect on what I've been doing and it brings me such joy to share my findings and knowledge with everybody out there. Thank you for reading and I'll see you in the next one which is going to be: **AutoMapper TypeScript in Action** (Link coming up). Finally, my library is actually live and is on `npm`, you can check the Github repo out [here](https://github.com/nartc/automapper-nartc). Please feel free to try it out, look through the source and leave me ANY feedbacks in the Issues section, I am happy to receive feedbacks, good or bad 💪. Thanks again and I'll see you soon. 👋  
