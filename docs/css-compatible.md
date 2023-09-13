---
title: CSS Compatible
date: "2022-12-29"
category: Tech
tag: "css"
description: "CSS compatibility issues"
---

[[toc]]

## IOS scrolling stutters

[question link](https://stackoverflow.com/questions/9807620/ipad-safari-scrolling-causes-html-elements-to-disappear-and-reappear-with-a-dela)

This is a possible solution to fix it.

```html
<div class="container">
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
</div>
<style>
  .container {
    transform: translate(0%, 0px);
  }
  .item {
    // add two lines below to fix
    transform: translate3d(0, 0, 0);
    -webkit-overflow-scrolling: touch;
  }
</style>
```

## Safari overflow-hidden-with-border-radius not work

[question link](https://stackoverflow.com/questions/49066011/overflow-hidden-with-border-radius-not-working-on-safari)

Releted post: <https://www.sungikchoi.com/blog/safari-overflow-border-radius/>

solution:

```html
<div class="wrapper">
  <div class="item"></div>
</div>

<style>
  .wrapper {
    border-radius: 10px;
    overflow: hidden;
    // add this line to fix
    isolation: isolate;
  }
</style>
```

## Ios Only Style

Sometimes we want styles to only apply to Ios.

The not operator is useful here if you don't want to add styles to Ios.

[Compatibility](https://caniuse.com/?search=-webkit-touch-callout)

```css
@supports (-webkit-touch-callout: initial) {
  .iosStyle {
    margin: 0;
  }
}
```
