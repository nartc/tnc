---
title: Xây dựng Dynamic Dialog với Angular CDK
date: 2020-01-08T17:06:55.354Z
tags: ["Programming", "Angular", "Angular CDK"]
draft: false
cover: ../covers/colorful-tools.jpg
langs: ["en", "vi"]
---

**Angular CDK** là tên viết ngắn gọn cho **Angular Component Dev Kit (CDK)**. Theo như tên gọi, CDK cung cấp cho các bạn một bộ các công cụ dùng để build những  **Angular Components** giàu tính năng và chất lừ mà không cần phải tuân theo tiêu chuẩn của **Material Design** của **Google**. Mục đích của CDK là cho phép developers có thể triển khai *những patterns và behaviors phổ biến* trong ứng dụng **Angular** của mình. Có khá nhiều những gói thư viện, patterns, và behaviors khác nhau mà các bạn có thể khám phá bằng việc nghiên cứu [documentation](https://material.angular.io/cdk/categories) của CDK.

Gần đây, mình đang làm một dự án **Angular** mà trong dự án này, bọn mình có dùng cùng một lúc các **Bộ UI Component** như `NgBootstrap` và `PrimeNG`, cũng như một số thư viện lẻ tẻ khác. Mặc dù là việc dùng các thư viện này giúp bọn mình làm xong việc (và nhanh nữa), nhưng việc dùng vô tội vạ đã đẩy dự án đến một vấn đề là có quá nhiều các bộ phận khác nhau mà cần phải maintain, hoặc update. Nói cách khác, **tech debts** đang bị dồn từng ngày và **sự không thống nhất** đang ám ảnh toàn bộ dự án. Một ví dụ điển hình nhât là **Dynamic Dialog** khi mà cần phải hiển thị một **Dialog** và có thể truyền vào một **Component** để hiển thị nội dung của **Dialog** này. Nghe phê phê he? Tại thời điểm mà bọn mình cần tính năng này, `PrimeNG` chưa có hỗ trợ **DynamicDialog** (bây giờ thì họ có hỗ trợ rồi, nghiên cứu thêm tại [PrimeNG DynamicDialog](https://www.primefaces.org/primeng/#/dynamicdialog)). Một dev trong team mình đã tìm đến `NgBootstrap` vì **NgbModal** (đọc thêm về [NgBootstrap NgbModal](https://ng-bootstrap.github.io/#/components/modal/examples)). Đó là lý do và cũng là lúc mà dự án có cả `NgBootstrap` lẫn `PrimeNG`. 

Nhưng phải có cách nào tốt hơn chứ đúng không? Phải có cái nào mà có thể dùng những cái sẵn có chứ! May mắn cho các bạn là **có**. **Angular CDK** có cung cấp một cách khá "dễ" để triển khai **DynamicDialog** của riêng bạn, có thể kết hợp với **BẤT CỨ** bộ giao diện mà các bạn đang hoặc muốn sử dụng. Từ đó, mình đã và đang tìm hiểu thêm về **Angular CDK**, đặc biệt là **Overlay** module, để khám phá một cách để xây dựng **DynamicDialog** mà không phải phụ thuộc vào bất cứ **Bộ UI Component** nào để trong các dự án tương lai, bọn mình không phải lặp lại sai lầm nữa. Bài blog này là chia sẻ của mình về những gì mình tìm hiểu được và thông qua bài này, chúng ta sẽ sử dụng **Angular CDK OverlayModule** cùng với **Bulma CSS** để xây dựng một **DynamicDialog** theo phong cách **Angular**. Bắt đầu thôi.

### Chuẩn bị

Chúng ta sẽ bắt đầu bằng việc tạo mới một ứng dụng **Angular** với **Angular CLI**

```shell script
ng new cdk-bulma-dialog
```

> Nếu như chưa cài đặt **Angular CLI**, các bạn cài bằng lệnh `npm i -g @angular/cli`

![](../images/dynamic-dialog/ngcli.png)
*Angular CLI khởi tạo một ứng dụng Angular mới*

Chúng ta sẽ **không** cần `routing` và sẽ chọn `SCSS` cho phần giao diện. Kế tiếp, chúng ta sẽ cài **Angular CDK**

```shell script
ng add @angular/cdk
```

Mở file `styles.scss` và thêm vào dòng code này:

```scss
@import '~@angular/cdk/overlay-prebuilt.css';
```

Mở file `app.module.ts` và thêm `BrowserAnimationsModule`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- thêm import này 
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule], // <-- thêm BrowserAnimationsModule
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Mở `index.html` và sửa lại như sau:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CdkBulmaDialog</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
    <!-- Thêm BulmaCSS CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

Và bây giờ thì chúng ta đã sẵn sàng để tiếp tục vào phần chính của bài blog này.

### Nhiều Files khác nữa

Chúng ta sẽ bắt đầu phần này với việc khởi tạo một số files cần thiết bằng **Angular CLI** lẫn bằng tay 

- Dùng **Angular CLI**

Khởi tạo `DynamicDialogModule`

```shell script
ng generate module dynamic-dialog
```

Khởi tạo `DynamicDialogService`

```shell script
ng generate service dynamic-dialog/dynamic-dialog --skipTests
```

> Để bài viết này đơn giản, mình sẽ thêm `skipTests` vào tất cả các lệnh `ng generate`

Khởi tạo `DynamicDialogContentDirective`

```shell script
ng generate directive dynamic-dialog/dynamic-dialog-content --skipTests
```

Khởi tạo `DynamicDialogRootComponent`

```shell script
ng generate component dynamic-dialog/dynamic-dialog-root --flat --skipTests --inlineTemplate --inlineStyle
```

> Chúng ta sẽ dùng `inlineTemplate` và `inlineStyle` để có thể thấy được những gì xảy ra trong `DynamicDialogRootComponent` trong một file `*.component.ts` mà thôi.

- Tạo thư mục và files bằng tay

Chúng ta sẽ phải cần một số **Models** nên các bạn hãy tự tạo một thư mục mới tên là `models`. Thư mục này nên nằm dưới `dynamic-dialog` 1 bậc. 

```shell script
# mặc định là các bạn đang ở root của cdk-bulma-dialog
cd src/app/dynamic-dialog
mkdir models
cd models
```

Bây giờ thì hãy tạo 1 số files sau

```shell script
touch animation-state.enum.ts
touch dynamic-dialog-config.model.ts
```

và cũng viết nốt code cho các files này luôn. Mở file `animation-state.enum.ts`

```typescript
export enum AnimationState {
  Void = 'void',
  Enter = 'enter',
  Leave = 'leave'
}
```

sau đó là `dynamic-dialog-config.model.ts`

```typescript
import { OverlayConfig } from '@angular/cdk/overlay';

export class DynamicDialogConfig<TData = any> {
  header: string;
  closable: boolean;
  containerAnimationTiming: number;
  contentAnimationTiming: number;
  animationChildDelay: number;
  data?: TData;
  overlayConfig?: OverlayConfig;

  constructor() {
    this.header = '';
    this.closable = true;
    this.containerAnimationTiming = 0.3;
    this.contentAnimationTiming = 0.2;
    this.animationChildDelay = 0;
  }
}
```

Hãy điểm qua từng `config`:

1. `header`: Khá dễ hiểu. Chúng ta sẽ cấu hình `dialog` của mình để có một `title`. Mình sẽ cho phép người dùng **Dialog** tuỳ chỉnh biến `header` thông qua `DynamicDialogConfig`.
2. `closable`: Cho phép **Dialog** được đóng lại bằng cách: `click vào backdrop` và `click vào close icon`. Mặc định, chúng ta sẽ muốn có một `close icon` ở bên phải của `header`.
3. `containerAnimationTiming`: Thời gian để chạy animation của **Dialog Container**. Nhìn trên màn hình, thì **Dialog Container** sẽ là một khoảng có màu mờ, toàn màn hình và sẽ nằm bên dưới của **Dialog Content**.
4. `contentAnimationTiming`: Thời gian để chạy animation của **Dialog Content**.
5. `animationChildDelay`: Thời giản cách khoảng giữ animation của **Dialog Conatiner` và **Dialog Content**.
6. `data`: Dữ liệu thêm để truyền vào cho **Dialog** khi mở **Dialog**. Phần lớn thì `data` sẽ chứa một số thông tin như `productId` chẳng hạn, để khi mở **Dialog**, mình có thể dùng `productId` để fetch dữ liệu `Product`.  
7. `overlayConfig`: `OverlayConfig` của `Overlay` từ **Angular CDK**. **Dialog** mà chúng ta đang dựng sẽ cấu hình một số giá trị mặc định cho `OverlayConfig` nhưng chúng ta cũng sẽ cung cấp người dùng **Dialog** khả năng cấu hình `OverlayConfig` này thông qua biến `overlayConfig`. `overlayConfig` truyền vào sẽ được gộp (**merge**) với config đã được cấu hình sẵn.

Kế đến, file cuối cùng mà chúng ta cần là `DynamicDialogRef`. Mình sẽ giải thích tầm quan trọng của `ref` khi chúng ta bắt đầu viết code cho nó. Bây giờ thì cứ tạo file đó đi đã.

```shell script
# mặc định là các bạn đang ở bên trong src/app/dynamic-dialog/models
cd ..
touch dynamic-dialog-ref.ts
```

### Bắt đầu chiến thôi

Đầu tiên, chúng ta sẽ xử lý thằng `DynamicDialogContentDirective` trước vì nó rất ngắn và dễ hiểu. Mở file `dynamic-dialog-content.directive.ts` lên thôi

```typescript
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appDynamicDialogContent]'
})
export class DynamicDialogContentDirective {

  constructor(public readonly viewContainerRef: ViewContainerRef) { } // <-- inject ViewContainerRef

}
```

Thằng `directive` này sẽ giữ vai trò như một **cột mốc để thêm vào**. Đây là nơi mà chúng ta muốn hiển thị động `nội dung` (bằng một `Component`) của **Dialog**. Vì vậy, chúng ta cần inject `ViewContainerRef` vào thằng `directive` này để khi nó được mount, nó sẽ có quyền truy xuất đến cái element gốc mà `directive` này được sử dụng trên element gốc đó dưới dạng là `ViewContainerRef`. (Đọc thêm về [Angular Directive](https://angular.io/api/core/Directive)). Đừng lo lắng nếu nghe như sét đánh ngang tai, chúng ta sẽ gỡ các nút thắt sớm thôi. 

và đó là tất cả code mà chúng ta cần cho `DynamicDialogContentDirective`. Giờ thì mở file `dynamic-dialog-ref.ts` và thêm 1 đoạn code nhỏ này

```typescript
export class DynamicDialogRef<TReturnType = any> {

}
```

Hiện tại thì chỉ cần nhiêu đó thôi. Giờ hãy mở file `dynamic-dialog-root.component.ts`

```typescript
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <p>
      dynamic-dialog-root works!
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush // <-- dùng OnPush strategy.
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy { // <-- implements AfterViewInit and OnDestroy

  constructor() {
  }

  ngAfterViewInit(): void { // <-- ngAfterViewInit
  }

  ngOnDestroy(): void { // <-- ngOnDestroy
  }
}
```

Chúng ta sẽ cần một số fields sau:

1. `animationState` và `animationStateChanged`: Dùng để theo dõi các bước animations của `container` và `content` của **Dialog**. Chúng ta sẽ dựa vào `animationState` và `AnimationEvent` từ gói `@angular/animations` để xác định được thời điểm mà **Dialog** bị đóng lại.
2. `contentComponentType`: `Component` được truyền vào và được dùng để hiển thị phần `content` của **Dialog**.
3. `componentRef`: Biến này chỉ dùng để giữ con trỏ hiện tại đến **Dialog Content Component**, được dùng để "dọn dẹp", tiêu huỷ đi khi hook `ngOnDestroy` chạy. 

Quẩy code cho mấy fields này thôi

```typescript
import { AnimationEvent } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef
} from '@angular/core';
import { AnimationState } from './models/animation-state.enum'; // <-- import AnimationState

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <p>
      dynamic-dialog-root works!
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    animationState: AnimationState = AnimationState.Enter;
    // Bảo đảm là các bạn import AnimationEvent từ @angular/animations
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

  constructor() {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}
```

Ngoài những fields trên, chúng ta cũng sẽ cần một số thứ được injected vào cho `DynamicDialogRootComponent` này thông qua **Dependency Injection (DI)**

1. `DynamicDialogConfig`: Hàng `configuration` hand-made của mình
2. `DynamicDialogRef`: Hàng `dialogRef` hand-made của mình
3. `ComponentFactoryResolver`: Một chút kiến thức chung. Khi các bạn khởi tạo và sử dụng một `Component` thông thường bên trong **Angular** (nghĩa là dùng `selector` của `Component` trên `template`. Ví dụ: `<app-todo-item></app-todo-item>`), **Angular** sẽ lấy thông tin metadata từ decorator `@Component()` và sẽ tạo một `factory` cho `Component` đó. `Factory` sau đó sẽ được **Angular Compiler** dùng để biết được thông tin về `Component`, từ đó sẽ hiển thị cũng như cung cấp những thứ cần thiết cho `Component` đó sử dụng. **Dialog** của mình sẽ được hiển thị động trên màn hình vào bất cứ thời điểm nào. Vì thế, chúng ta sẽ cần phải dùng đến `ComponentFactoryResolver` để có thể tạo được `factory` cho **Dialog** bằng tay.
4. `ChangeDetectorRef`: Ý tưởng ở đây là chúng ta sẽ bắt đầu việc khởi tạo **Dialog Content Component** trong hook `ngAfterViewInit` sau khi **DOM** ban đầu đã được load xong. Bên cạnh đó, chúng ta cũng sử dụng `OnPush` vì thế sau khi khởi tạo **Dialog Content Component**, chúng ta sẽ muốn gọi `changeDetectorRef.markForCheck()` để thông báo cho **Cơ chế Change Detection của Angular** biến được có sự thay đổi trong `DynamicDialogRootComponent` và việc thông báo này chỉ xảy ra một lần duy nhất thôi. Các thay đổi khác trong tương lai sẽ xảy ra bên trong **Dialog Content Component**.

Một lần nữa, quẩy code thôi

```typescript
import { AnimationEvent } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef
} from '@angular/core';
import { AnimationState } from './models/animation-state.enum';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <p>
      dynamic-dialog-root works!
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

  constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}
```

Quẩy `template` nào

```typescript
import { AnimationEvent } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { AnimationState } from './models/animation-state.enum';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <div
      class="modal is-active"
      style="padding-left: 1rem; padding-right: 1rem"
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ dialogConfig.header }}</p>
          <button
            class="delete"
            aria-label="close"
            *ngIf="dialogConfig.closable"
          ></button>
        </header>
        <section class="modal-card-body">
          <ng-template appDynamicDialogContent></ng-template>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    // Giữ lấy con trỏ tới Directive để dùng trong TypeScript
    @ViewChild(DynamicDialogContentDirective, { static: false }) contentInsertionPoint: DynamicDialogContentDirective;

    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

    constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }
}
```

Mình lấy `HTML` trực tiếp từ [Bulma Modal](https://bulma.io/documentation/components/modal/) luôn và chỉ thay đổi `Modal Title` sang `dialogConfig.header`. Mình cũng bỏ tất cả những thứ râu ria ở giữa `<section class="modal-card-body"></section>` với `<ng-template></ng-template>` và quăng thằng `DynamicDialogContentDirective` lên `ng-tempalte`. Nếu bạn nào đã biết các **Dynamic Component** hoạt động trong **Angular**, bạn có thể thấy được cái gì đang xảy ra ở đây rồi. Chúng ta dùng `ng-template`, bind `DynamicDialogContentDirective` lên `ng-template`, và nếu nhớ lại, thì chúng ta cũng inject `ViewContainerRef` trong `DynamicDialogContentDirective`. Tất cả mấy thứ này sẽ giúp chúng ta lấy được con trỏ tới `ng-template` dưới dạng `ViewContainerRef` và chuyển `ng-template` này thành **cột mốc** để có thể hiển thị động **Dialog Content Component**.

Bây giờ thì triển code cho `ngAfterViewInit()` và `ngOnDestroy()` thôi

```typescript
import { AnimationEvent } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { AnimationState } from './models/animation-state.enum';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <div
      class="modal is-active"
      style="padding-left: 1rem; padding-right: 1rem"
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ dialogConfig.header }}</p>
          <button
            class="delete"
            aria-label="close"
            *ngIf="dialogConfig.closable"
          ></button>
        </header>
        <section class="modal-card-body">
          <ng-template appDynamicDialogContent></ng-template>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicDialogContentDirective, { static: false }) contentInsertionPoint: DynamicDialogContentDirective;

    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

    constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
        this.loadContentComponent();
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
          this.componentRef.destroy();
        }
    }

    private loadContentComponent(): void {
        const factory = this.cfr.resolveComponentFactory(this.contentComponentType);
        const vcr = this.contentInsertionPoint.viewContainerRef;
        vcr.clear();
        this.componentRef = vcr.createComponent(factory);
    }
}
```

Như đã nhắc ở trên, trong `ngAfterViewInit()`, chúng ta sẽ khởi tạo **Dialog Content Component** bằng việc gọi hàm `loadContentComponent()`, dùng `ComponentFactoryResolver` và sẽ thông báo cho **Change Detection** để có thể update **DialogRootComponent** sau khi khởi tạo xong. Trong hàm `loadContentComponent()`, chúng ta cũng sẽ lấy `viewContainerRef` từ thằng `DynamicDialogContentDirective`. Nếu để ý, các bạn sẽ thấy là mình chưa bao giờ gán giá trị cho `contentComponentType` ở đâu trong `DynamicDialogRootComponent` hết, và các bạn hoàn toàn đúng. Chúng ta sẽ gán giá trị cho `contentComponentType` vào một thời điểm "sớm" hơn, và ở một vị trí khác. Trong `ngOnDestroy()`, chúng ta chỉ triển khai một số công việc dọn dẹp với `componentRef` thôi. Khá là dễ hiểu 😊. Trước khi chuyển sang file khác, hãy triển thêm 1 hàm cho `DynamicDialogRootComponent` nữa.

```typescript
import { AnimationEvent } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { AnimationState } from './models/animation-state.enum';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <div
      class="modal is-active"
      style="padding-left: 1rem; padding-right: 1rem"
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ dialogConfig.header }}</p>
          <button
            class="delete"
            aria-label="close"
            *ngIf="dialogConfig.closable"
          ></button>
        </header>
        <section class="modal-card-body">
          <ng-template appDynamicDialogContent></ng-template>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicDialogContentDirective, { static: false }) contentInsertionPoint: DynamicDialogContentDirective;

    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

    constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
        this.loadContentComponent();
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
          this.componentRef.destroy();
        }
    }

    // Thêm hàm này
    startExitAnimation(): void {
        this.animationState = AnimationState.Leave;
    }

    private loadContentComponent(): void {
        const factory = this.cfr.resolveComponentFactory(this.contentComponentType);
        const vcr = this.contentInsertionPoint.viewContainerRef;
        vcr.clear();
        this.componentRef = vcr.createComponent(factory);
    }
}
```

Các bạn có nhớ mình nói là chúng ta sẽ dùng đến `animationState` để quyết định việc đóng **Dialog** không? Hàm `startExitAnimation()` sẽ giúp chúng ta bắt đầu được quy trình đóng **Dialog** này. Phù, vẫn có một số việc cần phải làm trong `DynamicDialogRootComponent` nữa, nhưng chúng ta sẽ phải quay lại file này sau. Điểm đến kế tiếp sẽ là `DynamicDialogRef`, con hàng quan trọng không kém 💪

To be continued in Vietnamese...

### DynamicDialogRef

`DynamicDialogRef` is the reference to the current instance `Overlay` that is being opened (and managed by **Angular CDK**). We will need a couple of fields and methods in `DynamicDialogRef`

1. `beforeClosed$`: This will be a `Subject` that will emit when the **Dialog** is **about** to close. We will keep the `Subject` private and expose the `Observable` counterpart via a `getter`
2. `afterClosed$`: Same concept as `beforeClosed$` but this is for when the **Dialog** has already been closed. We will also pass some optional `data` back to the consumers with `afterClosed$` as well.
3. `componentInstance`: The instance of `DynamicDialogRootComponent` which is being used by the `Overlay` to render the **Dialog**. We will hook onto the `animationStateChanged` on `DynamicDialogRootComponent` so we can determine when `beforeClosed$` and `afterClosed$` should emit.
4. `close(data?: TReturnType): void`: We are going to make the `DynamicDialogRef` available in **Dependency Injection Context** so that the **Dialog Content Component** can have access to the current `DynamicDialogRef` and will be able to call `close()` and pass in some `data` . Eg: when you close a **Confirmation Dialog** and upon close, you will want to pass `true` or `false` back to the **Dialog Invoker** so you can make a decision whether the user confirms the action or not. Again, `data` has a **Generic Type** `TReturnType` that we can pass in upon injecting `DynamicDialogRef` in a **Dialog Content Component**.

Beside these 4 things, we also need to inject `OverlayRef` so we can do some clean-up for the `Overlay` itself. Now, let's fill this bad boy up

```typescript
import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DynamicDialogRootComponent } from './dynamic-dialog-root.component';
import { AnimationState } from './models/animation-state.enum';

// A local constant.
const AnimationPhase = {
  START: 'start',
  DONE: 'done'
};

export class DynamicDialogRef<TReturnType = any> {
  private beforeClosed$: Subject<void> = new Subject<void>();
  private afterClosed$: Subject<TReturnType> = new Subject<TReturnType>();

  componentInstance: DynamicDialogRootComponent;

  constructor(private readonly overlayRef: OverlayRef) {
        overlayRef.backdropClick().pipe(take(1)).subscribe(this.close.bind(this));
  }

  get beforeClosed(): Observable<void> {
    return this.beforeClosed$.asObservable();
  }

  get afterClosed(): Observable<TReturnType> {
    return this.afterClosed$.asObservable();
  }

  close(data?: TReturnType): void {
    this.componentInstance.animationStateChanged.pipe(
      filter(event => event.phaseName === AnimationPhase.START),
      take(1)
    ).subscribe(() => {
      this.beforeClosed$.next();
      this.beforeClosed$.complete();
      this.overlayRef.detachBackdrop();
    });

    this.componentInstance.animationStateChanged.pipe(
      filter(event => event.phaseName === AnimationPhase.DONE && event.toState === AnimationState.Leave),
      take(1)
    ).subscribe(() => {
      this.overlayRef.dispose();
      this.afterClosed$.next(data);
      this.afterClosed$.complete();
      this.componentInstance = null;
    });

    this.componentInstance.startExitAnimation();
  }
}
```

Quite a lot is happening here. Let's go through it

1. `AnimationPhase` is just a local constant that has `START` and `DONE` properties on it. You can extract this out to its own file or some other place where you keep track of all of your constants. To me, this would work fine. 
2. In the `constructor`, we subscribe to `backdropClick()` on the `overlayRef` and call `close()` method.
3. Declare all of our fields `beforeClosed$` , `beforeClosed` getter, `afterClosed$`, `afterClosed` getter, `componentInstance`, injected `OverlayRef`, and `close()` method.
4. `beforeClosed` and `afterClosed` getters will allow us to provide the underline `Observable` from their `Subject` without exposing the `Subject`. `Subject` has the ability to emit new values and we do not want the consumers to be able to do that. 
5. `close(data?: TReturnType)`: The meat of `DynamicDialogRef`. We setup two `Subscription` to `animationStateChanged`: one is for when `AnimationPhase.START` and another is for when `AnimationPhase.DONE`. When we first invoke `close()`, the animations will actually start first and `@angular/animations` allows us to hook into these `AnimationEvent` . So during `AnimationPhase.START`, we will have the `Subscription` to `filter` by the `phaseName`, and we are only interested in **ONE** and **ONLY ONE** emitted value so we `take(1)`. Then, we have `beforeClosed$` emit and complete right away so it cleans itself up. Finally, we will have the `overlayRef` to `detachBackdrop()`. The other `Subscription` works in a similar manner. `filter` by `phaseName`, `take(1)` and have `afterClosed$` emit new value with `data` then complete itself. We also call `overlayRef.dispose()` to finally dispose the `Overlay` and nullify `componentInstance`. After setting up the `Subscriptions`, we actually invoke `startExitAnimation()` so the `Subscriptions` are **ready** when the animation starts.

That's it for `DynamicDialogRef`. Now, let's go back to `DynamicDialogRootComponent` since we have `DynamicDialogRef.close()` ready.

### Finish up DynamicDialogRootComponent

Let's first setup some methods that will invoke `DynamicDialogRef.close()` by default. 

```typescript
import { AnimationEvent } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    ViewChild,
    HostListener
} from '@angular/core';
import { AnimationState } from './models/animation-state.enum'; // <-- import AnimationState
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <div
      class="modal is-active"
      style="padding-left: 1rem; padding-right: 1rem"
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ dialogConfig.header }}</p>
          <button
            class="delete"
            aria-label="close"
            *ngIf="dialogConfig.closable"
          ></button>
        </header>
        <section class="modal-card-body">
          <ng-template appDynamicDialogContent></ng-template>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicDialogContentDirective, { static: false }) contentInsertionPoint: DynamicDialogContentDirective;

    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

    constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
        this.loadContentComponent();
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
          this.componentRef.destroy();
        }
    }

    startExitAnimation(): void {
        this.animationState = AnimationState.Leave;
    }

    private loadContentComponent(): void {
        const factory = this.cfr.resolveComponentFactory(this.contentComponentType);
        const vcr = this.contentInsertionPoint.viewContainerRef;
        vcr.clear();
        this.componentRef = vcr.createComponent(factory);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    @HostListener("document:keydown", ["$event.key"])
    private handleEscapeKey(key: string) {
        if (key === 'Escape') {
          this.closeDialog();
        }
    }
}
```

We added 2 methods

1. `closeDialog()`: Handle closing the **Dialog** upon clicking the **Close Icon** on the header or clicking on the backdrop.
2. `handleEscapeKey()`: A `HostListener` that listens to `document:keydown` event and will check if it's the `Escape` key to close the **Dialog**.

Now, we are going to add `animations` to this `DynamicDialogRootComponent`

I'm going to utilize an npm package called `ng-animate` to help with my animation skills. If you want to follow along, please run `npm i ng-animate`

```typescript
import { animateChild, AnimationEvent, group, query, transition, trigger, useAnimation } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    ViewChild,
    HostListener
} from '@angular/core';
import { fadeIn, fadeOut, zoomIn, zoomOut } from 'ng-animate';
import { AnimationState } from './models/animation-state.enum'; // <-- import AnimationState
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <div
      class="modal is-active"
      style="padding-left: 1rem; padding-right: 1rem"
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ dialogConfig.header }}</p>
          <button
            class="delete"
            aria-label="close"
            *ngIf="dialogConfig.closable"
          ></button>
        </header>
        <section class="modal-card-body">
          <ng-template appDynamicDialogContent></ng-template>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('zoom', [
      transition(
        '* => in',
        useAnimation(zoomIn, { params: { timing: '{{timing}}' } })
      ),
      transition(
        '* => out',
        useAnimation(zoomOut, { params: { timing: '{{timing}}' } })
      )
    ]),
    trigger('animation', [
      transition(
        `* => ${ AnimationState.Enter }`,
        group([
          useAnimation(fadeIn, { params: { timing: '{{timing}}' } }),
          query('@zoom', [animateChild({ delay: '{{delayChild}}' })], { optional: true })
        ])
      ),
      transition(
        `* => ${ AnimationState.Leave }`,
        group([
          useAnimation(fadeOut, { params: { timing: '{{timing}}' } }),
          query('@zoom', [animateChild({ delay: '{{delayChild}}' })], { optional: true })
        ])
      )
    ])
  ]
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicDialogContentDirective, { static: false }) contentInsertionPoint: DynamicDialogContentDirective;

    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

    constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
        this.loadContentComponent();
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
          this.componentRef.destroy();
        }
    }

    startExitAnimation(): void {
        this.animationState = AnimationState.Leave;
    }

    private loadContentComponent(): void {
        const factory = this.cfr.resolveComponentFactory(this.contentComponentType);
        const vcr = this.contentInsertionPoint.viewContainerRef;
        vcr.clear();
        this.componentRef = vcr.createComponent(factory);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    @HostListener("document:keydown", ["$event.key"])
    private handleEscapeKey(key: string) {
        if (key === 'Escape') {
          this.closeDialog();
        }
    }
}
```

Ok, this is going to be painful. I would suggest reading more about [Angular Animations](https://angular.io/guide/animations). Basically, we setup two `triggers` : `zoom` and `animation`. `zoom` will be responsible for animating the **Dialog Content** while `animation` will be responsible for animating the **Dialog Container**. In `animation` trigger, we setup `fadeIn` and `fadeOut` animation (from `ng-animate`, if you're comfortable with **Animations** in general, feel free to setup your own animations) based on the `state` , we also leverage `Animation Params` (eg: `{{timing}}`) to pass in configurable `Animation Configuration` to our animations. Remember `containerAnimationTiming` and `contentAnimationTiming` and such? Those will come into play here. Last but not least, we also setup `query` for `zoom` trigger inside of `animation` trigger so we are able to run `animateChild` with `delay`, again, remember `animateChildDelay` 😅?! Again, I would encourage reading more about **Angular Animations**.

Finally, let's finish up the `template` and hook everything together

```typescript
import { animateChild, AnimationEvent, group, query, transition, trigger, useAnimation } from '@angular/animations';
import { 
    AfterViewInit, 
    ChangeDetectionStrategy, 
    Component, 
    OnDestroy, 
    EventEmitter,
    Type,
    ComponentRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    ViewChild,
    HostListener
} from '@angular/core';
import { fadeIn, fadeOut, zoomIn, zoomOut } from 'ng-animate';
import { AnimationState } from './models/animation-state.enum'; // <-- import AnimationState
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';

@Component({
  selector: 'app-dynamic-dialog-root',
  template: `
    <div
      class="modal is-active"
      style="padding-left: 1rem; padding-right: 1rem"
      [@animation]="{
        value: animationState,
        params: {
          timing: dialogConfig.containerAnimationTiming,
          delayChild: dialogConfig.animationChildDelay
        }
      }"
      (@animation.start)="animationStateChanged.emit($event)"
      (@animation.done)="animationStateChanged.emit($event)"
    >
      <div class="modal-background" (click)="closeDialog()"></div>
      <div
        class="modal-card"
        [@zoom]="{
          value: animationState == 'enter' ? 'in' : 'out',
          params: { timing: dialogConfig.contentAnimationTiming }
        }">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ dialogConfig.header }}</p>
          <button
            class="delete"
            aria-label="close"
            *ngIf="dialogConfig.closable"
            (click)="closeDialog()"
          ></button>
        </header>
        <section class="modal-card-body">
          <ng-template appDynamicDialogContent></ng-template>
        </section>
      </div>
    </div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('zoom', [
      transition(
        '* => in',
        useAnimation(zoomIn, { params: { timing: '{{timing}}' } })
      ),
      transition(
        '* => out',
        useAnimation(zoomOut, { params: { timing: '{{timing}}' } })
      )
    ]),
    trigger('animation', [
      transition(
        `* => ${ AnimationState.Enter }`,
        group([
          useAnimation(fadeIn, { params: { timing: '{{timing}}' } }),
          query('@zoom', [animateChild({ delay: '{{delayChild}}' })], { optional: true })
        ])
      ),
      transition(
        `* => ${ AnimationState.Leave }`,
        group([
          useAnimation(fadeOut, { params: { timing: '{{timing}}' } }),
          query('@zoom', [animateChild({ delay: '{{delayChild}}' })], { optional: true })
        ])
      )
    ])
  ]
})
export class DynamicDialogRootComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicDialogContentDirective, { static: false }) contentInsertionPoint: DynamicDialogContentDirective;

    animationState: AnimationState = AnimationState.Enter;
    animationStateChanged: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    contentComponentType: Type<any>;
    
    private componentRef: ComponentRef<any>;

    constructor(
        public readonly dialogConfig: DynamicDialogConfig,
        private readonly dialogRef: DynamicDialogRef,
        private readonly cfr: ComponentFactoryResolver,
        private readonly cdr: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
        this.loadContentComponent();
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
          this.componentRef.destroy();
        }
    }

    startExitAnimation(): void {
        this.animationState = AnimationState.Leave;
    }

    private loadContentComponent(): void {
        const factory = this.cfr.resolveComponentFactory(this.contentComponentType);
        const vcr = this.contentInsertionPoint.viewContainerRef;
        vcr.clear();
        this.componentRef = vcr.createComponent(factory);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    @HostListener("document:keydown", ["$event.key"])
    private handleEscapeKey(key: string) {
        if (key === 'Escape') {
          this.closeDialog();
        }
    }
}
```

We hook up `animation` trigger to the top **DOM** element which is the `modal` and `zoom` trigger to `modal-card`. We also use `dialogConfig` to pass in the configurable **Animation Params**. Next, we set `@animation.start` and `@animation.done` event then have `animationStateChanged` emit accordingly. You see how `startExitAnimation`, `DynamicDialogRef.close()` and `animationStateChanged` all play together now? Finally, we hook up `closeDialog()` to `modal-background` and `button.delete` (`close icon`) on the `header`. 

Woohoo 🔥, we are 60% done now 😅. Let's finish up the last 40% with `DynamicDialogService`

### DynamicDialogService

Beside `DynamicDialogRef`, `DynamicDialogService` is the last piece that will allow the consumers to interact with our whole **Dynamic Dialog.** So open up `dynamic-dialog.service.ts` and jump right in. `DynamicDialogService` only exposes one method which is `open<TReturnType = any>()` so the consumers can use this method to **open** the **Dialog**. 

```typescript
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector, Type } from '@angular/core';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogRootComponent } from './dynamic-dialog-root.component';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';

@Injectable()
export class DynamicDialogService {

  private readonly defaultDialogConfig: DynamicDialogConfig;

  constructor(private readonly overlay: Overlay, private readonly injector: Injector) {
    this.defaultDialogConfig = new DynamicDialogConfig();
    this.defaultDialogConfig.overlayConfig = new OverlayConfig({
      disposeOnNavigation: true,
      hasBackdrop: true,
      panelClass: 'dynamic-dialog-panel',
      scrollStrategy: overlay.scrollStrategies.block(),
      positionStrategy: overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  open<TReturnType = any>(component: Type<any>, config?: DynamicDialogConfig): DynamicDialogRef<TReturnType> {
    const mergeConfig = {
      ...this.defaultDialogConfig,
      ...config,
      overlayConfig: {
        ...this.defaultDialogConfig.overlayConfig,
        ...(config && config.overlayConfig ? config.overlayConfig : {})
      }
    };

    const overlayRef = this.createOverlay(mergeConfig);
  }
}
```

Let's import everything we need first. After that, we declare a `private readonly defaultDialogConfig` which will hold our default configuration of the **Dialog**. We did setup some default configurations inside of `DynamicDialogConfig` upon instantiation. Here in the `constructor`, we are going to be **defaulting** some `OverlayConfig` as well

1. `disposeOnNavigation`: Self-explanatory. We want to close the dialog if we navigate away from the current page so we clean up and prevent potential memory-leak.
2. `hasBackdrop`: This can be set default or not. I set it to `true`. If it's `true`, then `Overlay` will also render a `cdk-backdrop` element along side the `cdk-overlay` on our **DOM Tree**.
3. `panelClass`: Customizable `HTML` class so we can customize the `Overlay` element should we desire.
4. `scrollStrategy`: Self-explanatory. Set the scrolling behavior when the `Overlay` is opened. We default it to `BlockScrollStrategy` here. Read more about [ScrollStrategies](https://material.angular.io/cdk/overlay/overview#scroll-strategies)
5. `positionStrategy`: Set the position of the `Overlay` when it's opened. Default to `center`. Read more about [PositionStrategies](https://material.angular.io/cdk/overlay/overview#position-strategies)

Next, we declare `open()` method. `open()` takes in an optional **Generic Type** `TReturnType` . We will have the `open()` method to return an `DynamicDialogRef<TReturnType>` so the `DynamicDialogRef.afterClosed` will have the correct type when the consumers subscribe to it. `open()` will expect a `Component` for the **Dialog Content** (remember `contentComponentType`, here's the **earlier point** that we set the `contentComponentType`) and a `DynamicDialogConfig` to be merged with `defaultDialogConfig`. Afterward, we create our `OverlayRef`. Let's implement `createOverlay()` now. 

```typescript
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector, Type } from '@angular/core';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogRootComponent } from './dynamic-dialog-root.component';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';

@Injectable()
export class DynamicDialogService {

  private readonly defaultDialogConfig: DynamicDialogConfig;

  constructor(private readonly overlay: Overlay, private readonly injector: Injector) {
    this.defaultDialogConfig = new DynamicDialogConfig();
    this.defaultDialogConfig.overlayConfig = new OverlayConfig({
      disposeOnNavigation: true,
      hasBackdrop: true,
      panelClass: 'dynamic-dialog-panel',
      scrollStrategy: overlay.scrollStrategies.block(),
      positionStrategy: overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  open<TReturnType = any>(component: Type<any>, config?: DynamicDialogConfig): DynamicDialogRef<TReturnType> {
    const mergeConfig = {
      ...this.defaultDialogConfig,
      ...config,
      overlayConfig: {
        ...this.defaultDialogConfig.overlayConfig,
        ...(config && config.overlayConfig ? config.overlayConfig : {})
      }
    };

    const overlayRef = this.createOverlay(mergeConfig);
  }

  private createOverlay(config: DynamicDialogConfig): OverlayRef {
    return this.overlay.create(config.overlayConfig);
  }
}
```

Very simple. We call `overlay.create()` and pass in the `OverlayConfig` from `DynamicDialogConfig.overlayConfig`. Now that we have `OverlayRef`, we can start creating our custom `DynamicDialogRef`

```typescript
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector, Type } from '@angular/core';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogRootComponent } from './dynamic-dialog-root.component';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';

@Injectable()
export class DynamicDialogService {

  private readonly defaultDialogConfig: DynamicDialogConfig;

  constructor(private readonly overlay: Overlay, private readonly injector: Injector) {
    this.defaultDialogConfig = new DynamicDialogConfig();
    this.defaultDialogConfig.overlayConfig = new OverlayConfig({
      disposeOnNavigation: true,
      hasBackdrop: true,
      panelClass: 'dynamic-dialog-panel',
      scrollStrategy: overlay.scrollStrategies.block(),
      positionStrategy: overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  open<TReturnType = any>(component: Type<any>, config?: DynamicDialogConfig): DynamicDialogRef<TReturnType> {
    const mergeConfig = {
      ...this.defaultDialogConfig,
      ...config,
      overlayConfig: {
        ...this.defaultDialogConfig.overlayConfig,
        ...(config && config.overlayConfig ? config.overlayConfig : {})
      }
    };

    const overlayRef = this.createOverlay(mergeConfig);
    const dialogRef = new DynamicDialogRef<TReturnType>(overlayRef);
    dialogRef.componentInstance = this.attachDialogContainer(overlayRef, component, dialogRef, mergeConfig);
  }

  private createOverlay(config: DynamicDialogConfig): OverlayRef {
    return this.overlay.create(config.overlayConfig);
  }
}
```

Remember `componentInstance` on `DynamicDialogRef` that has the type of `DynamicDialogRootComponent`. `DynamicDialogRootComponent` will still be created dynamically and this is really where `Overlay` and `Portal` from **Angular CDK** come into play. `OverlayRef` is a `PortalOutlet` which can `attach` a `ComponentPortal` to render that `Component` dynamically on the screen. Normally, you can leverage [Dynamic Component Loader](https://angular.io/guide/dynamic-component-loader) to create the `Component` dynamically. However, `Overlay` and `Portal` from **Angular** **CDK** provide better APIs to work with, and to clean up. With that in mind, let’s work on `attachDialogContainer` method

```typescript
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector, Type } from '@angular/core';
import { DynamicDialogRef } from './dynamic-dialog-ref';
import { DynamicDialogRootComponent } from './dynamic-dialog-root.component';
import { DynamicDialogConfig } from './models/dynamic-dialog-config.model';

@Injectable()
export class DynamicDialogService {

  private readonly defaultDialogConfig: DynamicDialogConfig;

  constructor(private readonly overlay: Overlay, private readonly injector: Injector) {
    this.defaultDialogConfig = new DynamicDialogConfig();
    this.defaultDialogConfig.overlayConfig = new OverlayConfig({
      disposeOnNavigation: true,
      hasBackdrop: true,
      panelClass: 'dynamic-dialog-panel',
      scrollStrategy: overlay.scrollStrategies.block(),
      positionStrategy: overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  open<TReturnType = any>(component: Type<any>, config?: DynamicDialogConfig): DynamicDialogRef<TReturnType> {
    const mergeConfig = {
      ...this.defaultDialogConfig,
      ...config,
      overlayConfig: {
        ...this.defaultDialogConfig.overlayConfig,
        ...(config && config.overlayConfig ? config.overlayConfig : {})
      }
    };

    const overlayRef = this.createOverlay(mergeConfig);
    const dialogRef = new DynamicDialogRef<TReturnType>(overlayRef);
    dialogRef.componentInstance = this.attachDialogContainer(overlayRef, component, dialogRef, mergeConfig);
    return dialogRef;
  }

  private createOverlay(config: DynamicDialogConfig): OverlayRef {
    return this.overlay.create(config.overlayConfig);
  }

  private attachDialogContainer(overlayRef: OverlayRef, component: Type<any>, dialogRef: DynamicDialogRef, dialogConfig: DynamicDialogConfig): DynamicDialogRootComponent {
    const injector = this.createInjector(dialogRef, dialogConfig);
    const portal = new ComponentPortal(DynamicDialogRootComponent, null, injector);
    const ref = overlayRef.attach(portal);
    ref.instance.contentComponentType = component;
    return ref.instance;
  }

  private createInjector(ref: DynamicDialogRef, config: DynamicDialogConfig): PortalInjector {
    const injectorTokenMap = new WeakMap();
    injectorTokenMap.set(DynamicDialogRef, ref);
    injectorTokenMap.set(DynamicDialogConfig, config);
    return new PortalInjector(this.injector, injectorTokenMap);
  }
}
```

First thing is we want to `createInjector()` for the **Dialog** because we want `DynamicDialogRef` and `DynamicDialogConfig` to be available via **Dependency** **Injection** in the `Overlay` instance which ultimately manages `DynamicDialogRootComponent` and custom **Dialog** **Content** **Component** which will also have access to the same **Injector** which provides the same `DynamicDialogRef` and `DynamicDialogConfig` instances used when the **Dialog** is opened with `open()`. `PortalInjector` will just merge a token map (`WeakMap` here) with the `parentInjector` so it can provide our custom tokens to the **Injector.** With the `PortalInjector` ready, we can then create an instance of `ComponentPortal` with the `PortalInjector` and our own `DynamicDialogRootComponent`. All that’s left to do is to attach this `ComponentPortal` to the `OverlayRef`. Call `overlayRef.attach()` to do so. Returned value is the reference to the underline `Component` used to instantiate `ComponentPortal`, which in this case is our `DynamicDialogRootComponent` and this is where we will assign the passed-in `component` that `contentComponentType` field. Finally, we return the `ref.instance` which is the instance of `DynamicDialogRootComponent` which is being managed by the current `Overlay`. Ultimately, we return the `dialogRef` for `open()` so the consumers have a hold of the `dialogRef` so they can subscribe to its events when it’s closed. 

### DynamicDialogModule

Every pieces of the **Dynamic Dialog** has been completed. However, we need to put everything in `DynamicDialogModule` before we can use it. Open `dynamic-dialog.module.ts`

```typescript
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicDialogContentDirective } from './dynamic-dialog-content.directive';
import { DynamicDialogRootComponent } from './dynamic-dialog-root.component';
import { DynamicDialogService } from './dynamic-dialog.service';


@NgModule({
  declarations: [DynamicDialogContentDirective, DynamicDialogRootComponent],
  imports: [CommonModule, OverlayModule], // <-- import OverlayModule
  entryComponents: [DynamicDialogRootComponent], // <-- add DynamicDialogRootComponent to entryComponents. Make sure to put it under declarations as well if you haven't already
  providers: [DynamicDialogService] // provide DynamicDialogService
})
export class DynamicDialogModule {
}
```

### Simple Usage

Before we use our **Dialog**, let's create a simple `Component` to be our **Dialog Content**. Run the following command

```shell script
# assume you are at the root level of the project (cdk-bulma-dialog)
ng generate component test-dialog 
--skipTests 
--inlineTemplate 
--inlineStyle 
--changeDetection=OnPush
--entryComponent
```

We use the **CLI** to generate a `Component` with `inlineTemplate`, `inlineStyle`, `skipTests`, `changeDetection=OnPush`, and `entryComponent` flags. This component will be really simple so we will have everything `inline`. `entryComponent` flag will put this component in `entryComponents` array automatically for us. Now, let's open `test-dialog.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-dialog',
    template: `
        <p>test-dialog works!</p>
        <button class="button" (click)="close()">Close</button>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestDialogComponent implements OnInit {

  constructor(
        private readonly dialogConfig: DynamicDialogConfig, 
        private readonly dialogRef: DynamicDialogRef<string>
    ) {}

  ngOnInit() {
  }

  close() {
    this.dialogRef.close('closed from inside content dialog');
  }
}
```

We only add a `button` with `(click)` bound to `close()` method. We also inject `DynamicDialogConfig` and `DynamicDialogRef<string>` to check if our `PortalInjector` works or not. In `close()`, we call `dialogRef.close()` and pass in a string `'closed from inside content dialog'`. Now, open `app.component.html` 

```html
<button class="button" (click)="showOverlay()">Show Overlay</button>
```

then open `app.component.ts`

```typescript
import { Component } from '@angular/core';
import { DynamicDialogService } from './dynamic-dialog/dynamic-dialog.service';
import { DynamicDialogConfig } from './dynamic-dialog/models/dynamic-dialog-config.model';
import { TestDialogComponent } from './test-dialog/test-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private readonly dynamicDialogService: DynamicDialogService) {
  }

  showOverlay() {
    const config = new DynamicDialogConfig();
    config.header = TestDialogComponent.name;
    const ref = this.dynamicDialogService.open<string>(TestDialogComponent, config);
    ref.afterClosed.subscribe(data => {
      console.log('closed with data', data);
    });
  }
}
```

We inject `DynamicDialogService` and implement `showOverlay()` method:

1. Instantiate a new `DynamicDialogConfig`, set the `header` to the name of `TestDialogComponent`.
2. Call `dynamicDialogService.open()` , with `TestDialogComponent` and `config` as the arguments, then assign the returned `DynamicDialogRef` back to local variable `ref`
3. Subscribe to `ref.afterClosed` and log the `data` passed from within `TestDialogComponent.close()` method.

Open `app.module.ts` 

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- add this import
import { AppComponent } from './app.component';
import { DynamicDialogModule } from './dynamic-dialog/dynamic-dialog.module';
import { TestDialogComponent } from './test-dialog/test-dialog.component';

@NgModule({
  declarations: [AppComponent, TestDialogComponent],
  imports: [BrowserModule, BrowserAnimationsModule, DynamicDialogModule],
  bootstrap: [AppComponent],
  entryComponents: [TestDialogComponent]
})
export class AppModule {
}
```

Make sure you have `TestDialogComponent` in `entryComponents` and `DynamicDialogModule` in `imports`. Now, everything is ready. Moment of truth! Run your **Angular** application

```shell script
ng serve -o
```

You should see the following on the screen

![](../images/dynamic-dialog/show-overlay-btn.png)
*Lonely Show Overlay button*

Clicking on the `Show Overlay` button will bring up our `TestDialogComponent` as a **Dialog**

![](../images/dynamic-dialog/overlay.png)
*Tada!*

Open your **Console**, and click on `Close` button, you'll see 

```shell script
closed with data closed from inside content dialog
```

logged to the **Console**. 👍

### Recap

To recap, I have a little ugly diagram

![](../images/dynamic-dialog/diagram.png)
*...😢*

Here is the encapsulation of what's happening under the hood when you call `dynamicDialogService.open()`. `Overlay` instance is created to manage the current `OverlayRef` that is being used to handle the current `PortalOutlet` which renders the `DynamicDialogRootComponent` as its `ComponentPortal`. Then, we have the `PortalInjector` to inject the current instances of `DynamicDialogRef` and `DynamicDialogConfig` so we can have access to those in the **Dialog Content Component** (`TestDialogComponent`). That's all there is to it. `Overlay` and `Portal` are two very powerful tools that **Angular CDK** provides with robust APIs which allows developers like us build high quality components like the **DynamicDialog**. With the same concept, you can apply `Overlay` and `Portal` to build many different common overlay behaviors like: **Tooltip, Drawer, Toast** etc... 💪

To conclude, I hope that I was able to share something and you learn something new after this long blog post 🚀. Have fun and good luck. I'll see you all in the next blog 👋
