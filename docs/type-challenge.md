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

type First<T extends any[]> = T extends [infer F, ...infer Rest] ? F : never
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

## Medium

### Get Return Type

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

### Omit

```ts
type MyOmit<T,K> = Pick<T, Exclude<keyof T, K>>
```

### Readonly 2

```ts
type MyReadonly2<T, K = keyof T> = {
  readonly [Key in keyof T as Key extends K ? Key : never]: T[Key];
} & { [Key in keyof T as Key extends K ? never : Key]: T[Key] };

type MyReadonly2<T, K extends keyof T = keyof T> = { readonly [P in K]: T[P] } & Omit<T, K>;
```

### Deep Readonly

```ts
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

type PrimitiveType = number | string | boolean;
type AtomicObject = Function | Promise<any> | Date | RegExp;
type WeakReferences = WeakMap<any, any> | WeakSet<any>;
type Immutable<T> = T extends PrimitiveType
  ? T
  : T extends AtomicObject
  ? T
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<Immutable<K>, Immutable<V>>
  : T extends ReadonlySet<infer V>
  ? ReadonlySet<Immutable<V>>
  : T extends WeakReferences
  ? T
  : T extends object
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T;
```

### TupleToUnion

```ts
type TupleToUnion<T extends any[]> = T extends [infer F, ...infer Rest] ? F | TupleToUnion<Rest>: never

type TupleToUnion<T extends any[]> = T[number]
```

### Chainable Options

```ts
type Chainable<Pre = {}> = {
  option<K extends string, V>(
    key: K extends keyof Pre ? never : K,
    value: V
  ): Chainable<Pre & { [key in K]: V }>;
  get(): Pre;
};
```

### Last Of Array

```ts
type Last<T extends any[]> = T extends [...infer Rest, infer L] ? L : never;

type Last<T extends any[]> = T extends [infer F, ...infer Rest]
  ? T["length"] extends 1
    ? F
    : Last<Rest>
  : never;

```

### Pop

```ts
type Pop<T extends any[]> = T extends [...infer Rest, infer L] ? Rest : [];
```

### Promise.All

```ts
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
declare function PromiseAll<T extends readonly unknown[] | []>(
  values: T
): Promise<{ -readonly [P in keyof T]: MyAwaited<T[P]> }>;

```

### LookUp

```ts
type LookUp<U, T> = U extends { type: T } ? U : never;
```

### TrimLeft

```ts
type TrimLeft<S extends string> = S extends `${WhiteSpace}${infer Rest}`
  ? TrimLeft<Rest>
  : S;
```

### Trim

```ts

type WhiteSpace = " " | "\t" | "\n";
type TrimLeft<S extends string> = S extends `${WhiteSpace}${infer Rest}`
  ? TrimLeft<Rest>
  : S;
type TrimRight<S extends string> = S extends `${infer Rest}${WhiteSpace}`
  ? TrimRight<Rest>
  : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;
```

### Capitalize

```ts
type MyCapitalize<S extends string> = S extends `${infer F}${infer Rest}`
  ? `${Uppercase<F>}${Rest}`
  : S;
```

### Replace

```ts
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer F}${From}${infer L}`
  ? `${F}${To}${L}`
  : S;
```

### Replace All

```ts
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends `${infer F}${From}${infer L}`
  ? `${F}${To}${ReplaceAll<L, From, To>}`
  : S;
```

### AppendArgument

```ts
type AppendArgument<Fn extends (...args: any[]) => any, I> = Fn extends (
  ...args: infer A
) => infer R
  ? (...args: [...A, I]) => R
  : never;

type AppendArgument<Fn extends (...args: any[]) => any, I> = (
  ...args: [...Parameters<Fn>, I]
) => ReturnType<Fn>;
```

### Permutation

```ts
type Permutation<T extends keyof any> = [T] extends [never]
  ? []
  : { [P in T]: [P, ...Permutation<Exclude<T, P>>] }[T];
```

### LengthOfString

```ts
type LengthOfString<
  S extends string,
  A extends any[] = []
> = S extends `${infer L}${infer R}`
  ? LengthOfString<R, [...A, L]>
  : A["length"];
```

### Flatten

```ts
type Flatten<Els extends unknown[]> = Els extends [infer F, ...infer R]
  ? F extends unknown[]
    ? [...Flatten<F>, ...Flatten<R>]
    : [F, ...Flatten<R>]
  : [];
```
