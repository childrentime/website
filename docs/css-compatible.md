---
title: CSS Compatible
date: "2022-12-29"
category: Tech
tag: "css"
description: "This blog is used to document CSS compatibility issues"
---

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
