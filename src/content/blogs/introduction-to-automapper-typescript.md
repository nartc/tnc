---
title: A brief introduction to AutoMapper in TypeScript
date: 2019-11-16T17:06:55.354Z
tags: ["Programming", "Typescript", "AutoMapper"]
draft: false
cover: ../covers/automapper.jpg
langs: ["en"]
---

Hi everyone, it's been exactly a month (again) since my last blog 😄 and you're probably getting bored of me saying that. Last month, I published a blog explaining why I wanted to create an `AutoMapper` library in `TypeScript`. In today's blog, I am going to dive deeper into how it works in `TypeScript` by officially introducing my library for the first time: **@nartc/automapper**

Check it out on:

- [Github](https://github.com/nartc/mapper)
- [npm](https://www.npmjs.com/package/@nartc/automapper)

## The Problem

With `NodeJS` getting more and more popular, we start seeing a lot more Server-Side projects written in `NodeJS` and _problems with exposing the proper data_ slowly concerns many developers who are working on those projects. The concern shows clearer in particular with building **APIs** using [DDD](https://en.wikipedia.org/wiki/Domain-driven_design) (Domain Driven Design) with a lot of [DTOs](https://en.wikipedia.org/wiki/Data_transfer_object) / [VMs](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) (Data Transfer Object or View Model, these two terms can be used interchangeably). In other words, you do not want to expose your [Domain Model](https://en.wikipedia.org/wiki/Domain_model) outside of the [Persistence Layer](<https://en.wikipedia.org/wiki/Persistence_(computer_science)#Persistence_layers>) just in case the **Application Layer** in [Multitier Architecture](https://en.wikipedia.org/wiki/Multitier_architecture).

And in `JavaScript`, being a [Dynamic Programming Language](https://developer.mozilla.org/en-US/docs/Glossary/Dynamic_programming_language), the above problem "_can be done_" quite easily because there is nothing stopping you from assigning values to your heart content. However, doing so blindly or mindlessly can cost you your **maintainability** to your code-base which is extremely dangerous and well, costly. On the other hand, doing so repeatedly will be prone to errors and eventually all of these "_manual mappings_" will become **tech debts** that are really hard to _repay_, especially **Complex Mappings**.

## Use-case

Let's assume you are building a minimal **AirBnB clone** and you plan to have the following **Domain Models**:

1. Person
2. Listing
3. Booking

> Real scenario will have many more **Domain Models** like: `Notification`, `Message`, `Transaction` etc... to accommodate such platform. Here, I take out all the transaction-related to simplify this blog post.

and you want to your platform able to do the following:

1. Anyone can register to become a `Person` in your application.
   - A `Person` has two main `Role`: `User` and `Host`
   - Signed up `Person` will have their `Role` default to `User`
2. A `Person` with `User` role can:
   - Look at all `Listing`
   - Create a `Booking`
   - Save `Booking` to `pastBookings`
   - Save a `Listing` to `wishlist`
   - Save a `Listing` to `lastViews` list
3. A `Person` will become a `Host` after they create their first `Listing` and can:

   - Create more `Listing`
   - Respond to `Booking` request

From the above requirements, you can see that our **Domain Models** are having quite a complex **relationship** and **circular dependencies**

1. `Person` can have a list of `Listing` on `lastViews` and `wishlist`
2. `Person` can have a list of `Booking` on `pastBookings`
3. `Listing` must have a `Person` as `host`
4. `Booking` must have both `Person` as `user` and `host`, and also `Listing` as `listing`

> Let us all assume that we don't have to worry about **Domain Models** relationships like One-One, One-Many and Many-Many. We only focus on exposing our **Models** to the consumers.

Let's look at our **models** in code:

```typescript
// Person.ts

class Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

class Profile {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  address: Address;
}

enum Role {
  User = "user",
  Host = "host",
}

class Person {
  email: string;
  password: string;
  profile: Profile;
  role: Role;
  lastViews: Listing[];
  wishlist: Listing[];
  pastBookings: Booking[];
}
```

```typescript
// Listing.ts

class GeoLocation {
  lat: number;
  lng: number;
}

class Listing {
  name: string;
  description: string;
  price: number;
  location: GeoLocation;
  host: Person;
}
```

```typescript
// Booking.ts

class Booking {
  startDate: Date;
  endDate: Date;
  user: Person;
  host: Person;
  listing: Listing;
  total: number;
}
```

Take note that even though we wrote out **Models** with **Nested Schemas** but in reality, those relationships should be managed by `reference` (aka `foreign key`, aka `IDs`). To illustrate the point that data the consumers would get, we wrote it as **nested**.

As you can see, if we do not `transform` our **Domain Models** before returning to the consumers, we will then introduce **circular dependencies** in the data shape that the consumers would get. And the response could get substantially large with all the deep circular nesting. Moreover, we also create some "security issue" (like `password`) by exposing the **Domain Models** as they are: `Person` -> `Booking` -> `Person` -> `Booking` etc... To address this issue without any tools, we might come up with something like this:

```typescript
// DTOs.ts

class ProfileDto {
  name: string;
  bio: string;
  phone: string;
  formattedAddress: string; // street + city + state + zip

  constructor(profile: Profile) {
    this.name = profile.name;
    this.bio = profile.bio;
    this.phone = profile.phone;
    this.formattedAddress = profile.address.street + profile.address.city + ...;/
  }
}

class PersonDto {
  email: string;
  role: Role;
  profile: ProfileDto;
  lastViews: ListingDto[];
  wishlist: ListingDto[];
  pastBookings: BookingDto[];

  constructor(person: Person) {
    this.email = person.email;
    this.role = person.role;
    this.profile = new ProfileDto(person.profile);
    this.lastViews = person.lastViews.map(lv => new ListingDto(lv));
    this.wishlist = person.wishlist.map(wl => new ListingDto(wl));
    this.pastBookings = person.pastBookings.map(pb => new BookingDto(pb));
  }
}

// to break the circular dependency here, we will then need to introduce another smaller Dto for Person

class PersonInfoDto {
  email: string;
  profile: ProfileDto;

  constructor(person: Person) {
    this.email = person.email;
    this.profile = new ProfileDto(person.profile);
  }
}

class ListingDto {
  name: string;
  description: string;
  host: PersonInfoDto;

  constructor(listing: Listing) {
    this.name = listing.name;
    this.description = listing.description;
    this.host = new PersonInfoDto(listing.host);
  }
}

class BookingDto {
  host: PersonInfoDto;
  listing: ListingDto;
  startDate: Date;
  endDate: Date;
  total: number;

  constructor(booking: Booking) {
    this.host = new PersonInfoDto(booking.host);
    this.listing = new ListingDto(booking.listing);
    this.startDate = booking.startDate;
    this.endDate = booking.endDate;
    this.total = booking.total;
  }
}
```

**DTOs** are very specific and will differ from project to project. Decision making process for this dumbed-down version of this particular use-case:

1. For `Profile.address`, we only want to display a `formattedAddress` string.
2. For `Person.lastViews` and `Person.wishlist`, we would normally display like a list of cards with some minimal information. That's why `ListingDto` contains those information.

Next, you might have noticed the `constructor()` in each **DTOs**, we are essentially "map" the **Domain Models** to these **DTOs** manually by passing in the appropriate **Domain Model** in the `constructor()` of a matching **DTO**. This approach is safe and it works well. In fact, our company uses this _hand-written_ approach in one of our
[NestJS](https://nestjs.com) backend. However, this approach is not a good solution because:

1. Violates **DRY**. In a real scenario, you'd end up with many **DTOs** matching against a single **Domain Model**. The mapping is almost never _one-model-one-view-model_ and you probably have to re-type a lot of mapping, both simple and complex ones.
2. Error-prone. Because of the amount of re-typing, your code is more prone to human-errors.
3. One-way mapping. Without introducing even more code, you cannot have two-ways mapping `Domain <=> DTO`
4. Separation of Concern. Now this is a debatable one. One could argue that the mapping logic can (and should) stay within the **DTO** because that is where the transformation should occur. But, I'd try to make my **DTO** as clean and slim as possible by separating the Mapping logic out of the **DTO** itself.

<iframe
     src="https://codesandbox.io/embed/pedantic-tdd-c3ct1?fontsize=12&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="pedantic-tdd-c3ct1"
     allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
     sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
  ></iframe>

## AutoMapper can help

Let me recap, `@nartc/automapper` implementation of `AutoMapper` is an _Object to Object mapping solution by convention_. Before we get to how `@nartc/automapper` can help us, allow me to introduce to all of you that are not familiar with `AutoMapper` some terminologies so you can follow better:

1. `Mapper`: This is the main object that will help with the mapping. Usually in an `AutoMapper` implementation, `Mapper` is exposed as a singleton. In `@nartc/automapper`, there's a singleton `Mapper`. However, you can always instantiate another `Mapper` if you wish to manage your `Mapper` instance.
2. `Profile`: A `Domain Model` can have at least 1 `Profile`. A `Profile` is a class that extends `MappingProfileBase` and it represents a profile of **ONE Domain Models** and its matching **DTOs**.
3. `Mapping`: A `Mapping` is a blueprint between two **Models**, usually a **Domain Model** and a **DTO**. The `Mapper` can only proceed with the **map** operation if the `Mapping` exists.

Now, let's start with the **issues** one by one, not in any particular order:

1. **Separation of Concern**
   As the definition of `Profile` has stated, a `Profile` can house all the mapping logics for a specific **Domain Model**. We have 3 **Domain Models** so we'll have 3 **Profiles**

```typescript
class PersonProfile extends MappingProfileBase {
  constructor() {
    super(); // needed for this.profileName
  }

  configure(mapper: AutoMapper): void {
    throw new Error("Method not implemented.");
  }
}

class ListingProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(mapper: AutoMapper): void {
    throw new Error("Method not implemented.");
  }
}

class BookingProfile extends MappingProfileBase {
  constructor() {
    super();
  }

  configure(mapper: AutoMapper): void {
    throw new Error("Method not implemented.");
  }
}
```

Let's implement our `PersonProfile.configure()`:

```typescript
class PersonProfile extends MappingProfileBase {
  constructor() {
    super(); // needed for this.profileName
  }

  configure(mapper: AutoMapper): void {
    mapper
      .createMap(Profile, ProfileDto) // create the Mapping for Profile -> ProfileDto
      .forMember(
        d => d.name,
        opts => opts.mapFrom(s => s.firstName + " " + s.lastName)
      ) // map from Profile.firstName and Profile.lastName to ProfileDto.name. TypeScript will help out here
      .forMember(
        d => d.formattedAddress,
        opts =>
          opts.mapFrom(
            s => s.address.street + " " + s.address.city + " " + s.address.state
          )
      ) // d stands for destination, s stands for source
      .reverseMap(); // create the Mapping for ProfileDto -> Profile

    mapper.createMap(Person, PersonDto).reverseMap(); // create the Mapping for Person -> PersonDto and PersonDto -> Person
  }
}
```

Here, we say `PersonProfile extends MappingProfileBase` to initiate our contract between `PersonProfile` and `MappingProfileBase` which is used internally by `@nartc/automapper`. The `constructor` is needed to grab `PersonProfile` string and assign it to `this.profileName`. Each instance of `Mapper` will keep track of its `profiles` by `profileName`. Then we implement `configure()` method which receives the `Mapper` instance. Next, we proceed to start creating our first mappings by calling `createMap()` method which follows [Fluent Interface](https://en.wikipedia.org/wiki/Fluent_interface):

1. `createMap(Profile, ProfileDto)`: this creates the Mapping for `Profile -> ProfileDto`. This method also establishes mapping configurations for properties that are on both `Profile` and `ProfileDto`. Remember, **by convention**? So, `Profile.bio` will be mapped to `ProfileDto.bio` without you having to configure that.
2. What if we need to configure a property on the **Destination** (`ProfileDto` in this case)? `forMember()` is created for that purpose. Pass in a **Selector Function** to let `Mapper` know which property you want to configure explicitly and another function that receives the `ForMemberOptions` object which exposes different methods for you to configure the property being selected. Here, we want to configure `ProfileDto.name` explicitly and we want to take `Profile.firstName` value and `Profile.lastName` value to assign to `ProfileDto.name`. Therefore, we use `mapFrom()` which takes in yet another **Selector Function** to get the value for `ProfileDto.name`. `TypeScript` will help out here with safe-typings. You will actually get an error if you're trying to map a value that is different than a `string` to `ProfileDto.name` (which is a `string`).

![Error](https://p30.f1.n0.cdn.getcloudapp.com/items/NQueGbZ7/Image+2019-11-17+at+1.15.23+AM.png?v=590d3ef8d8db3eaec645c56e74ae0fa8)
 *TypeError when trying to map unmatched value type*

> `@nartc/automapper` follows as close to the original .NET AutoMapper API as possible.

3. We repeat the process for `formattedAddress`.
4. Call `reverseMap()` to create another Mapping for `ProfileDto -> Profile`. 
5. Create another Mapping for `Person -> PersonDto`
6. Call `reverseMap()` to create another Mapping for `PersonDto -> Person`

**Why is `createMap(Person, PersonDto)` so short/empty?** Again, remember **by convention**? This is one of the strong point of an `AutoMapper`. `@nartc/automapper` will try to map matching properties on both `Person` and `PersonDto` for primitives, nested models and list. Here, we set `PersonDto.profile` to `ProfileDto` and we have already setup a Mapping for `Profile -> ProfileDto`, `@nartc/automapper` will be able to map from `Person.profile` to `PersonDto.profile` without any configuration because `@nartc/automapper` will get the existing Mapping for `Profile -> ProfileDto` to map `profile` since a Mapping for any pair of **Models** is unique. 

The same goes for `Listing` and `Booking` so to simplify, I will not be putting code for those in this blog. You can find a full example here: [CodeSandbox](https://codesandbox.io/s/pedantic-tdd-c3ct1)

`@nartc/automapper` currently supports a wide range of features:

- [x] Basic Mapping between two classes
- [x] Basic Mapping for nested classes
- [x] Array/List Mapping
- [x] Flattening
- [x] ReverseMap
- [x] Value Converters
- [x] Value Resolvers
- [x] Async
- [x] Before/After Callback
- [x] Naming Conventions

so please check out [Github](https://github.com/nartc/mapper) to learn more.

## Flaws

Just want to get it out there, I work on this library knowing the limitations of `TypeScript` on its `reflection` capabilities. Hence, there are some flaws that are worth mentioning:

1. **Selector Function**: Currently, the way I grab the properties from these **Selector Function** is kind of flaky. I expect bugs in different scenarios when the library is used more. Even though I am pretty confident since I have unit test for `@nartc/automapper`.
2. **Reflection**: `@nartc/automapper` has a peer dependency on `reflect-metadata` and two dependencies which are `class-transformer` and `lodash.set`. `lodash.set` is pretty self-explanatory. So I will explain the other two:
    - **reflect-metadata**: This is used to be able to get metadata from decorators.
    - **class-transformer**: This library exposes a couple of nifty stuffs that `@nartc/automapper` can make use of. Namely, `plainToClass()`, `@Expose()` and `@Type()`.

> I have written about this in the previous blog on [Why I (want to) build an AutoMapper in TypeScript?](/blogs/automapper-typescript)

And to fix and/or improve flaws, I need more trials and more flaws. Please, if it fits your use-case, give `@nartc/automapper` a try. 

## Integration

Beside the core library `@nartc/automapper`, I have also written a wrapper to be used in `NestJS` which goes by `nestjsx-automapper` on `npm`. It is a part of `NestJSX` opinionated set of modules written specifically for `NestJS`. Check it out on [Github](https://github.com/nestjsx/automapper)

## Future

Currently, `@nartc/automapper` is waiting for more feedbacks and issues so it can be improved upon. Tutorial wise, I plan to record a video tutorial beside this blog post so stay tune for that. It feels much nicer on video, I promise. That said, if you decide to give the library a try, keep the feedbacks/issues coming. TIA!

## Credits

- [.NET AutoMapper](https://automapper.org/) for the inspiration
- [automapper-ts](https://github.com/loedeman/AutoMapper) for the starting point
- [Cleancode blog](https://cleancode.blog/an-automapper-for-php-the-powerful-and-simple-solution-for-mappings/) for the cover and for some ideas behind putting this blog together.

Thank you for reading. I'm looking forward to seeing you in the next blog 🚀
