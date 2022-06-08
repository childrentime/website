---
title: Type Challenge
date: '2022-06-07'
category: Tech
tag: 'typescript'
description: "This blog is used to record the answers of [type challenge](https://github.com/type-challenges/type-challenges)"
---

## Warm-up

### Hello World

```ts
type HelloWorld = string
```

## Easy

### Pick

```ts
type MyPick<T, K extends keyof T> = { [Key in K]: T[Key] }
```

### Readonly

```ts
type MyReadonly<T> = {readonly [P in keyof T]: T[P]}
```

### TupleToObject

```ts
type TupleToObject<T extends ReadonlyArray<any>> = {
  [P in T[number]]: P;
}
```

### First Of Array

```ts
type First<T extends any[]> = T["length"] extends 0 ? never : T[0];
```

### Length Of Tuple

```ts
type Length<T extends ReadonlyArray<any>> = T['length']
```

### Exclude

```ts
type MyExclude<T, U> = T extends U ? never : T;
```

### Awaited

```ts
type MyAwaited<T>  = T extends Promise<infer U>? MyAwaited<U>: T;
```

### If

```ts
type If<C extends boolean, T, F> = C extends true ? T: F
```

### Concat

```ts
type Concat<T extends ReadonlyArray<any>, U extends ReadonlyArray<any>> = [...T,...U]
```

### Includes

```ts
type isEqual<X, Y> = (<F>() => F extends X ? 1 : 2) extends <S>() => S extends Y
  ? 1
  : 2
  ? true
  : false;
type Includes<T extends readonly any[], U> = T extends [infer F, ...infer Rest]
  ? isEqual<F, U> extends true
    ? true
    : Includes<Rest, U>
  : false;
```

### Push

```ts
type Push<T extends any[], U> = [...T, U];
```

### Unshift

```ts
type Unshift<T extends unknown[], U> = [U,...T] 
```

### Parameters

```ts
type MyParameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer A
) => any
  ? A
  : never;

```
