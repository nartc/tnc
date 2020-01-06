---
title: Customize UI Library in Angular
date: 2020-01-01T17:06:55.354Z
tags: ["Programming", "Angular"]
draft: false
cover: ../covers/tooltip-extend.jpg
langs: ["en"]
---

Happy New Year everyone 🎇! I hope everyone will have a prosperous new year ahead of you all. As for me, I want to kick off 2020 with a new blog post, to stay **productive** you know 💪. So what are we going to do today? We are going to look at how we can customize 3rd party library (if applicable 🤞) in an **Angular** application.

### The Problem

As Web Technologies improve, there are a lot of 3rd-party UI libraries out there that we, **Web Developers**, can utilize without reinventing the wheels from scratch (Sometimes, building from scratch makes sense for your case/company/team 😊). However, these 3rd-party libraries are most of the times, **opinionated**, and a *particular* one library will never be able to fulfill *all* of your project's needs. That's why "sometimes, building from scratch makes sense".

Inexperienced developers or teams will tend to pull in many different libraries to have coverage of their usages. For example, they might pull in `library-A` for `DataTable` usage but `library-A`'s `Tooltip` does not cut it so they pull in `library-B` for `library-B`'s `Tooltip`. Although, this will make your team get a feature out quickly enough and make customers happy but overall, this is a bad practice. Not only that you have increased the application's bundle-size with multiple libraries but you also increase the tech-debt with **two** external libraries to keep track off and keep up-to-date.

Now, I am talking about **Open Source Software (OSS)** that are free to use provided to developers by other developers. Usually, **paid counterpart** provides supports that might be able to help you with your *missing feature*. However, that is not always the case with **OSS**. Normally, you would probably follow these steps:

1. Google a solution regarding the usage you want with the library you use. Sometimes, this will lead you to the library's **Github Issues** where it's most likely that someone else has already had the same issue as yours
2. File an issue/feature request on the library's **Github**
3. Wait for something to happen to your issue/feature request.

Some people will just stop there, and wait ⏱. But, there is a couple of additional steps that you might want to look at:

4. Look at the library's source code
5. Customize it

Most UI libraries are just **JavaScript** so most likely, you'll be able to customize it no problem. The hard part is to conform with whatever framework you're using for your project. In this blog, I will be going over a use-case with **PrimeNG**'s `TooltipModule`. 

### Use-case

What is **PrimeNG**? [PrimeNG](https://www.primefaces.org/primeng/#/) is a 3rd-party UI Component Suite for **Angular**. It is pretty complete in my opinion. But of course, nothing is perfect. One particular case that we run into for our project is their `TooltipModule` is not *mobile-friendly*. In other words, the `Tooltip` does not play well with mobile viewports as it does not support `click triggering`.

![problem](https://i.imgur.com/9XC5lzp.gif) 
*`TooltipModule` is not mobile friendly*

What can you do? Well, **NgBootstrap** `TooltipModule` does have `click triggering` which you can always pull in your project and use **NgBootstrap** just for their `Tooltip`. Or, you can go to [PrimeNG Github](https://github.com/primefaces/primeng) and submit a feature request for `TooltipModule` to support `click triggering`, which I think that's the way it should be.

### While you wait

Your feature request probably takes a while for it to be looked at, let alone worked on. In the mean time, we can utilize **step 4** and **step 5** above.

Let's get started with reading **PrimeNG** source code on how they implement their `Tooltip` at [tooltip.ts](https://github.com/primefaces/primeng/blob/master/src/app/components/tooltip/tooltip.ts). Let's walk over the `Tooltip`:

```typescript
@Directive({
    selector: '[pTooltip]'
})
export class Tooltip implements AfterViewInit, OnDestroy {
  // ...
}
```

We can tell right away that `Tooltip` is a `Directive`. It implements `AfterViewInit` and `OnDestroy`. Let's see what **PrimeNG** does in `ngAfterViewInit` and let me highlight the important pieces for you

```typescript{2-10}
ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
        if (this.tooltipEvent === 'hover') {
            this.mouseEnterListener = this.onMouseEnter.bind(this);
            this.mouseLeaveListener = this.onMouseLeave.bind(this);
            this.clickListener = this.onClick.bind(this);
            this.el.nativeElement.addEventListener('mouseenter', this.mouseEnterListener);
            this.el.nativeElement.addEventListener('mouseleave', this.mouseLeaveListener);
            this.el.nativeElement.addEventListener('click', this.clickListener);
        }
        else if (this.tooltipEvent === 'focus') {
            this.focusListener = this.onFocus.bind(this);
            this.blurListener = this.onBlur.bind(this);
            this.el.nativeElement.addEventListener('focus', this.focusListener);
            this.el.nativeElement.addEventListener('blur', this.blurListener);
        }
    });
}
```

Let's see:

1. They run some code outside of **Angular Change Detection** with `runOutsideAngular()` provided by `NgZone`. `NgZone` is another complex topic that you can read more about at [Do You Still Think That Ngzone Zone Js Is Required For Change Detection In Angular?](https://indepth.dev/do-you-still-think-that-ngzone-zone-js-is-required-for-change-detection-in-angular/) and/or [Boosting Performance Of Angular Applications With Manual Change Detection](https://medium.com/angular-in-depth/boosting-performance-of-angular-applications-with-manual-change-detection-42cb396110fb).
2. If the `tooltipEvent` is `hover`, then they bind some `mouseEnter` and `mouseLeave` events which makes total sense.

Next, let's look at `onMouseEnter`, `onMouseLeave` and `onClick` that **PrimeNG** uses to bind to the events.  

```typescript
onMouseEnter(e: Event) {
    if (!this.container && !this.showTimeout) {
        this.activate();
    }
}

onMouseLeave(e: Event) {
    this.deactivate();
}

onClick(e: Event) {
    this.deactivate();
}
```

`this.container` and `this.showTimeout` are just extra information. What we need to focus on is: `activate()` and `deactivate()` methods. We can kind of tell that `activate()` will show the `tooltip` and vice versa for `deactivate()`. Let's take a look

```typescript
activate() {
    this.active = true;
    this.clearHideTimeout();

    if (this.showDelay)
        this.showTimeout = setTimeout(() => { this.show() }, this.showDelay);
    else
        this.show();

    if (this.life) {
        let duration = this.showDelay ? this.life + this.showDelay : this.life;
        this.hideTimeout = setTimeout(() => { this.hide() }, duration);
    }
}

deactivate() {
    this.active = false;
    this.clearShowTimeout();

    if (this.hideDelay) {
        this.clearHideTimeout();
        this.hideTimeout = setTimeout(() => { this.hide() }, this.hideDelay);
    }
    else {
        this.hide();
    }
}
```

It's clear to see that upon calling `activate()`, **PrimeNG** sets `active` flag to `true` and have extra logic around its properties to determine how to display the `tooltip`, vice versa with `deactivate()`. Up to now, we probably have enough background of how `TooltipModule` works in **PrimeNG**. Now on to customizing it.

### The Solution

The first step is to run through what we need to do: (rationale)

1. We still want to have the `Tooltip` behave with the default `hover trigger` so we'll leave: `tooltipEvent`, `onMouseEnter` and `onMouseLeave` as is.
2. We need to attach an event that we can use on mobile viewports.
3. We will need to leverage `activate()` and `deactivate()` methods for step 2 to work.
4. We will also need to handle some kind of `click outside` so we can `deactivate()` the `Tooltip` on mobile viewports.

Let's start, shall we?

First step is to just initialize yourself an **Angular** application with **PrimeNG** setup. For the purpose of this demo, let's use `ButtonModule` and `TooltipModule` from **PrimeNG**

After all that, let's open up `app.module.ts`

```typescript{3-4,9}
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, ButtonModule, TooltipModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

In `app.component.html`, let's remove everything and add the following:

```html

<p-button label="PrimeNG Button" pTooltip="I am a not so mobile friendly tooltip"></p-button>

```

Run the application with `ng serve`, you should see a `PrimeNG Button` on the screen, and the `tooltip` when you hover over the button as well (just like the demo up there). Now, let's create a `Directive`. I am going to create it manually, although you can use `Angular CLI` to generate a `Directive` with the following command.

```shell

ng g directive tooltip-click --skipTests

```

Open up `tooltip-click.directive.ts`

```typescript{4}
import { Directive } from '@angular/core';

@Directive({
  selector: '[pTooltip][clickTrigger]' // change the selector
})
export class TooltipClickDirective {}
```

First thing to do is to change the `selector` to `[pTooltip][clickTrigger]`. `[pTooltip]` part lets us *patch* `TooltipClickDirective` on top of **PrimeNG**'s one. `[clickTrigger]` is arbitrary but you need to make sure you pick an **attribute name** that is unique enough. So, with `[pTooltip][clickTrigger]`, our `TooltipClickDirective` will be initialized with:

```html

<p-button label="PrimeNG Button" pTooltip="..." clickTrigger></p-button>

```

Remember what **PrimeNG**'s `Tooltip` implements? `AfterViewInit` and `OnDestroy` right? And we're going to do the same for `TooltipClickDirective`

```typescript
import { Directive, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[pTooltip][clickTrigger]'
})
export class TooltipClickDirective implements AfterViewInit, OnDestroy {
  
  ngAfterViewInit() {
    
  }
  
  ngOnDestroy() {
    
  }
}
```

> We didn't really go over **PrimeNG**'s `Tooltip` `ngOnDestroy` but essentially, they unbind the events that they bind in `ngAfterViewInit`.

We're going to inject a couple of things in our `Directive` `constructor`

```typescript{1-2,9}
import { Directive, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

@Directive({
  selector: '[pTooltip][clickTrigger]'
})
export class TooltipClickDirective implements AfterViewInit, OnDestroy {
 
  constructor(private readonly tooltip: Tooltip, private readonly ngZone: NgZone) {}
  
  ngAfterViewInit() {
    
  }
  
  ngOnDestroy() {
    
  }
}
``` 

Again, remember **PrimeNG** uses `NgZone` to run some event bindings outside of `Angular` with `runOutsideAngular`. We are going to do the same here. And `Tooltip` will give us the instance of the **PrimeNG**'s `Tooltip` in our `Directive`.

> In your `Directive`, you can use **Dependency Injection (DI)** to inject a couple of very useful things like `ElementRef` (the actual DOM element), `NgControl` (the `FormControl` that the `Directive` is used on) etc... and also the **Component Instance** (like `Tooltip` instance that we're utilizing here)

We are going to take care of a couple of low-hanging fruits next, namely: `toggleTooltip()` method, `click-outside` event and a small setup in `ngAfterViewInit()`

```typescript{12-16,23-28,30-36}
import { Directive, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

@Directive({
  selector: '[pTooltip][clickTrigger]'
})
export class TooltipClickDirective implements AfterViewInit, OnDestroy {
 
  constructor(private readonly tooltip: Tooltip, private readonly ngZone: NgZone) {}
  
  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      if (this.tooltip.clickListener) {
        this.tooltip.el.nativeElement.removeEventListener('click', this.tooltip.clickListener);
      }
    });
  }
  
  ngOnDestroy() {
    
  }
  
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: Node) {
    if (!this.tooltip.el.nativeElement.contains(target) && this.tooltip.active) {
      this.tooltip.deactivate();
    }
  }
  
  private toggleTooltip() {
    if (this.tooltip.active) {
      this.tooltip.deactivate();
    } else {
      this.tooltip.activate();
    }
  }
}
```

Let's go through each block, **from bottom to top**

1. `toggleTooltip()`: This is very straight-forward. We check if the `Tooltip` instance is `active`, if yes, we `deactivate()` it, else, we `activate()` it.
2. `HostListener()`: This is our `click-outside` piece. It listens to click on the `Document` and will check if the `EventTarget` is the `Tooltip`'s `nativeElement` which is whatever element we use our `Directive` on, if yes and if the `Tooltip` is `active`, we `deactivate()` it, else, we do nothing. This `HostListener` will get unbound when the `Directive` is destroyed.
3. `runOutsideAngular()`: You might be wondering why do we need to check for the instance's `clickListener` and remove it. Remember what `onClick` does in **PrimeNG**'s `Tooltip`? It calls `deactivate()` but we really need a `click event` to `toggleTooltip()` instead of just `deactivate()` it. That's why we're removing the `clickListener` and attaching a new event of our own. 

Now, you might be jumping to conclusion that "We're going to use `HostListener` to listen to the `click` event then handle it". Well, you might be right but you'll soon find out that it's not going to work. A `click event` will also trigger `mouseenter event` which in our case, we still need the `hover effect` on large viewports so the `mouseenter event` is still there in the original `Tooltip` instance. You should be curious to try but to save time, I'm going to let you know what happen: It will take two `clicks` to display the tooltip instead of one. Why? Because the original `Tooltip.onMouseEnter()` will call `activate()` and remember what `activate()` does? It sets `Tooltip.active` to `true` which will conflict with out `toggleTooltip()` method which we check for `Tooltip.active` to display the `Tooltip`. Right? So we need to find another way.

One thing that comes to my mind, for my use-case, is the following question: "What really is a click on mobile devices?" And you know, a `click` on mobile devices is actually a `press`, or more accurately, a `tap`. I bet most of you have heard of `hammerjs` if you have ever used **Angular Material**. **HammerJS** is a **JavaScript** library that adds *Touch gestures to your webapp* and that sounds exactly like what we need, a `tap` gesture. Let's go ahead and install `hammerjs` if you haven't already.

```shell
yarn add hammerjs
yarn add -D @types/hammerjs
```

> I know I lied about pulling libraries. At the time, our project has `hammerjs` installed as well as most of our other web projects. `hammerjs` is always there. So, let's move on.

**HammerJS** has an event that we're interested in: `singletap` so let's start wiring it up

```typescript{1,10,19-21,26-30}
import 'hammerjs';
import { Directive, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

@Directive({
  selector: '[pTooltip][clickTrigger]'
})
export class TooltipClickDirective implements AfterViewInit, OnDestroy {
  
  private hammerManager: HammerManager;
 
  constructor(private readonly tooltip: Tooltip, private readonly ngZone: NgZone) {}
  
  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      if (this.tooltip.clickListener) {
        this.tooltip.el.nativeElement.removeEventListener('click', this.tooltip.clickListener);
      }
      this.hammerManager = new Hammer.Manager(this.tooltip.el.nativeElement);
      this.hammerManager.add(new Hammer.Tap({ event: 'singletap' }));
      this.hammerManager.on('singletap', this.toggleTooltip.bind(this));
    });
  }
  
  ngOnDestroy() {
    this.ngZone.runOutsideAngular(() => {
      if (this.hammerManager.get('singletap')) {
        this.hammerManager.off('singletap', this.toggleTooltip.bind(this));
      }
    });
  }
  
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: Node) {
    if (!this.tooltip.el.nativeElement.contains(target) && this.tooltip.active) {
      this.tooltip.deactivate();
    }
  }
  
  private toggleTooltip() {
    if (this.tooltip.active) {
      this.tooltip.deactivate();
    } else {
      this.tooltip.activate();
    }
  }
}
```

1. `import 'hammerjs';` at the top of our `tooltip-click.directive.ts`
2. **HammerJS** needs a `HammerManager` instance to start managing `touch gestures`. We create our `Hammer.Manager` and pass in the `DOM element`, add a `singletap` event and listen to that event with `toggleTooltip()` bound to `singletap` event.
3. We clean up our `singletap` in `ngOnDestroy`

Now, we no longer trigger `onMouseEnter` with our `singletap` which makes it work pretty well on mobile friendly. Let's go ahead and try it on our `p-button` in `app.component.html`:

```html
<p-button label="PrimeNG Button" pTooltip="I am a mobile friendly tooltip. Try on mobile screen and click me" clickTrigger></p-button>
```

Go ahead and have your application refreshed, turn on `responsive mode` and check the `Tooltip` is working perfectly on mobile viewports.

![mobile friendly](https://i.imgur.com/wFyXBuZ.gif) 
*`Tooltip` now works on mobile viewports*

### Recap

I hope you can learn something from this blog post. We've done hell of a lot of things in this post. We **read the source code of a 3rd party library**, **learn about HammerJS**, and most importantly, **learn about how to use Directive to override/customize functionalities of a 3rd-party Component**. I also hope you can pick up a couple of tricks here and there from the blog post. Even though in my use-case, I only demonstrate on **PrimeNG** 's `TooltipModule` but the same concept can be applied to any 3rd-party UI Library which is open-source. Oh come on, `hammerjs` does not count 😢. Again, I wish you a Happy New Year. Thank you for reading 🚀. You can find the full code at [Stackblitz](https://stackblitz.com/edit/primeng-tooltip-extend) 
