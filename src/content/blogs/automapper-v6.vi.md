---
title: Có gì mới với AutoMapper v6?
date: 2020-03-20T17:06:55.354Z
tags: ["Programming", "Typescript", "AutoMapper"]
draft: false
cover: ../covers/missing_puzzle.jpg
langs: ["en", "vi"]
---

Xin chào mọi người, đã lâu không gặp 👋. Hôm nay, mình rất phấn khởi khi được giới thiệu về **AutoMapper** (`@nartc/automapper`) v6 đến với mọi người.
Đây là bản release với phần core gần như được _rewrite_ lại toàn bộ và public API có phần thay đổi chút ít, theo chiều hướng tích cực hơn.

> Nếu như các bạn chưa biết về **AutoMapper** thì có thể tìm hiểu bài blog này của mình [Introduction to AutoMapper TypeScript](/blogs/introduction-to-automapper-typescript) hoặc [Github](https://github.com/nartc/mapper)

## Cập nhật ngày 24-03-2020

Mình cập nhật lại benchmark và chạy lại tất cả benchmark 100 lần thay vì 10 lần. Các bạn có thể tìm hiểu repo benchmark tại [đây](https://github.com/nartc/ng-automapper-bench)

## Có gì mới

Bản release v6 lần này không có quá nhiều sự thay đổi về mặt public API nhưng tối ưu hơn, nhỏ gọn hơn, một số bản sửa lỗi, và cung cấp một API mới để support **JavaScript**. Nghe thật thú vị hen, khám phá cùng mình thôi 💪

## Hiệu năng

Với những thư viện thiên về thay đổi hoặc biến hoá data như **AutoMapper** thì vấn đề về hiệu năng đều khá quan trọng. Tuy nhiên trước khi đi quá sâu về vấn đề Hiệu năng,
mình muốn nhấn mạnh mục đích của **AutoMapper** khi mình quyết định viết thư viện này chính là để transform **Data Model (database)** sang **View Model (client/frontend)**
nên số lượng phần tử không nhất thiết phải lên đến hàng trăm ngàn phần tử thông qua **Network Call**. Với điều đó thì việc **map** một tập lên đến hàng triệu phần tử thì
khá là không thực tế 😊. Bây giờ thì chúng ta nhìn vào 1 chút thông số nhé.

Đầu tiên, đây là model `User` mà mình làm mẫu cho benchmark này:

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

và view model `UserVm` tương ứng:

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

với cấu hình như sau:

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

Thực thi **map** từ `User` sang `UserVm` với cấu hình trên lên 1K, 10K và 100K phần tử cho mình kết quả như sau:

|                        | 1K items | 10K items | 100K items |
| ---------------------- | -------- | --------- | ---------- |
| `@nartc/automapper` v5 | ~9ms     | ~88ms     | ~959ms     |
| `@nartc/automapper` v6 | ~8ms     | ~81ms     | ~785ms     |

> Mỗi benchmark được chạy ~10~ 100 lần cho mỗi 1K, 10K, và 100K phần tử rồi lấy trung bình 10 lần chạy.

Các bạn có thể thấy rằng v6 nhanh hơn v5 khoảng 15-25%. Và cái gì thực sự thay đổi ở v6? **AutoMapper** v6 đã áp dụng một số phương pháp sau để tăng hiệu năng:

- Loops Optimization: v6 sử dụng `while` thay thế cho `for let` (original `for` loop với biến index) ở một số chỗ quan trọng như: **map** và **initialize mapping properties**.
  Ở những khu vực `for` loop vẫn sử dụng thì biến `length` đã được cached để giảm thiểu `property lookup` ở mỗi vòng loop.
- Accessing Array Index: v6 chuyển phần lớn cấu trúc data mà phần `core` sử dụng từ dạng `Object` sang `Array` để giảm thiểu `property lookup`. Và vẫn còn nhiều chỗ để cải thiện ở vấn đề này trong **AutoMapper** v6.

> Tìm hiểu thêm về **Accessing Array Index** từ talk [How we make Angular fast](https://www.youtube.com/watch?v=EqSRpkMRyY4) của Misko Hevery

Với sự cho phép của [Yann Renaudin](https://twitter.com/YannRenaudin), là tác giả của thư viện [morphism](https://github.com/nobrainr/morphism), mình xin chia sẻ benchmark của `morphism` với cấu hình tương tự như trên:

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

> Mỗi benchmark được chạy ~10~ 100 lần cho mỗi 1K, 10K, và 100K phần tử rồi lấy trung bình 10 lần chạy.

|                                 | 1K items | 10K items | 100K items |
| ------------------------------- | -------- | --------- | ---------- |
| `morphism`                      | ~15ms    | ~144ms    | ~1436ms    |
| `morphism` with `create-mapper` | ~15ms    | ~145ms    | ~1464ms    |
| `@nartc/automapper` v6          | ~8ms     | ~81ms     | ~785ms     |

Đây chỉ là sự so sánh với 1 benchmark cực kỳ đơn giản và chỉ so sánh về khoản **map** từ một model sang một model khác mà thôi. Về tiện ích, `morphism` là một thư viện cực kỳ tuyệt vời
nếu các bạn có nhu cầu. `morphism` hỗ trợ **map** với `schema configuration` và điều này thì cực kỳ thích hợp với những dự án thuần **JavaScript**, không có nhiều `classes` để tượng trưng
cho cấu trúc dữ liệu ở trong code. Nếu bạn có hứng thú thì có thể tìm hiểu thêm về `morphism` tại [đây](https://github.com/nobrainr/morphism). Cám ơn [Yann](https://twitter.com/YannRenaudin) đã
cho phép mình lấy `morphism` làm benchmark cho **AutoMapper**.

## Nhỏ gọn

Nhìn chung, kích thước thư viện của v6 nhỏ hơn v5. Các hàm tiện ích (Utility Function) và phần `core` của thư viện đã được "dọn dẹp" khá nhiều.
![](../images/automapper-v6/master.png)
_Kích thước của AutoMapper v5_
![](../images/automapper-v6/next.png)
_Kích thước của AutoMapper v6_

> Kích thước bundle được cung cấp bởi [Bundlephobia](https://bundlephobia.com)

Mặt khác, hãy nhìn qua lại cấu hình **mapping** khi nãy với sự khác nhau giữa v5 và v6:

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

Các bạn có thấy sự khác biệt không? Ở v6, tham số thứ 2 của hàm `forMember()` không còn lại `ForMemberOptions` nữa.
`ForMemberOptions` là 1 `Function Interface` chứa tất cả các hàm **mapping operations** như: `mapFrom()`, `mapWith()`, `ignore()`, `condition()`, `fromValue()`, và một số hàm khác nữa.
Ở v6, tất cả các hàm **mapping operations** này đều được tách riêng ra thành những `Pure Function` riêng biệt. Điều này giúp cho **AutoMapper** v6 có thể `tree-shakable` được.

> `tree-shake` là thuật ngữ ở bước Bundle/Build code, dùng để chỉ đến việc những code không sử dụng đến (ví dụ như hàm được khai báo, nhưng không sử dụng đến trong code) thì sẽ được Builder/Bundler xoá sổ khỏi bundle cuối cùng. Kết quả là kích thước bundle cuối cùng có thể sẽ rất nhỏ, nhờ giảm đi được những code không dùng đến.

## Lỗi this lỗi that

Ở những version trước của **AutoMapper**, các **Mapping** và **Profile** được lưu trữ dưới dạng là `Object` và dùng biến `name` ở trên các `Class` này để làm `key` cho các item này. Và chuyện gì đến sẽ đến, cái gì cũng đúng cho đến khi nó sai🤦‍,
những `Object` này vì dùng `Class.name` nên khi người sử dụng thư viện (consumer) chạy code cho môi trường production, các plugins làm gọn code như **Uglify** hoặc **Terser** sẽ làm cho các `Class.name` này bị trùng.

**AutoMapper** v6 đã thay đổi cách lưu trữ những dữ liệu này với các **Storages**. Những storages này dùng `WeakMap` để lưu trữ chính `Class` làm `key` thay vì dùng `Class.name`. Điều này đảm bảo các `Class`
sẽ không bị trùng nhau cho dù đã được **minified**.

```typescript
// Để thấy được vấn đề với Class.name
class Foo {}

console.log(Foo.name); // logs Foo
console.log(Foo.prototype.constructor.name); // logs Foo
```

## Hỗ trợ JavaScript

Trước v6, hỗ trợ cho **JavaScript** hầu như là không tồn tại. **AutoMapper** chỉ hoạt động với những dự án **TypeScript** mà thôi. Ở v6, **AutoMapper** sẽ cung cấp một API để hỗ trợ cho **JavaScript**.
Trước khi giới thiệu qua API này, mình xin nói sơ qua về cách hoạt động của **AutoMapper** để mọi người hiểu rõ hơn về việc "chỉ hỗ trợ TypeScript".

**AutoMapper** hoạt động theo nguyên lý lưu trữ **Metadata** (data về data) của các Models. Ví dụ model `User` ở trên có: `firstName` là `string`, `lastName` là `string`, và `bio` là model `Bio`. Đây
được gọi là **Metadata** của class `User`. Để có được thông tin của những **metadata** này tại runtime, **AutoMapper** dùng decorator `@AutoMap()`. Sau đó, `MetadataStorage` sẽ đảm nhiệm việc lưu trữ
**metadata** mà `@AutoMap()` cung cấp. Ở những dự án **JavaScript** thì việc sử dụng `decorator` là khá phức tạp, và bản thân **AutoMapper** cũng không cung cấp một API nào để làm việc với **JavaScript**. Nhưng điều này sẽ thay đổi ở **AutoMapper** v6.

**AutoMapper** v6 sẽ cung cấp API có tên là: `createMapMetadata`. API này sẽ "giả lập" cách hoạt động của `@AutoMap()` để có thể lưu trữ được **metadata**. Tuy nhiên, API này vẫn yêu cầu consumers cung cấp
một số boiler-plate nhất định.

```javascript
class User {}
class UserVm {}

class Bio {}
class BioVm {}
```

**JavaScript** không có khai báo `fields` và `types` nên có thể để trống. Nhưng những `class` trống này bắt buộc phải có, vì lý do lưu trữ **Mapping** mình đề cập tới ở mục trên.

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

Khá dài dòng đúng không? Thực sự ra thì consumer không cần phải khai báo toàn bộ các `fields` như trên, mà chỉ cần khai báo các `fields` nào mà **SẼ KHÔNG** được cấu hình bằng `.forMember()`.
Theo như cấu hình **mapping** ở đầu bài blog, thì `isAdult` và `birthday` ở `BioVm` là không cần khai báo. Tương tự, `first`, `last`, và `full` ở `UserVm` cũng không cần khai báo. Code sẽ như thế này:

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

Điều tương tự sẽ được áp dụng khi consumer cấu hình từ `UserVm -> User` (`BioVm -> Bio`) thì những `fields` nào **SẼ ĐƯỢC** cấu hình bằng `.forPath()` (nếu dùng `reverseMap()`) hoặc `.forMember()` thì không cần khai báo ở `createMapMetadata()`

## Cài đặt

Các bạn có thể sử dụng qua bản `next` của **AutoMapper** bằng cách sau:

```
npm i @nartc/automapper@next
```

## Thay đổi từ v5

- Như mình đã đề cập ở trên, các hàm **mapping operations** đã được tách ra thành hàm riêng, cấu hình **mapping** có thay đổi như sau:

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

- `Mapper.initialize()` đã được khai tử. Các bạn nên dùng thẳng: `Mapper.createMap()`, `Mapper.addProfile()`, và `Mapper.withGlobalSettings()`
- Tất cả các tham số nhận `Profile` và `NamingConvention` đều sẽ nhận vào `Class` của `Profile` và `NamingConvention` đó thay vì 1 `instance`.

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

Các bạn có thể tìm hiểu thêm tại [đây](https://automapper.netlify.com/docs/next/introduction/why)

## Kết bài

Một lần nữa, mình cảm thấy rất phấn khởi khi được giới thiệu với các bạn về những thay đổi của **AutoMapper** v6. Cũng như những bài blog về **AutoMapper** mình từng viết, hy vọng
mọi người sẽ tham khảo qua và sử dụng thử nếu cảm thấy thích hợp với các use-cases của dự án của các bạn. Cám ơn mọi người đã đọc bài blog và hẹn gặp lại trong bài blog kế tiếp 👋
