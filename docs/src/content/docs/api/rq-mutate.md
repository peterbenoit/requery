---
title: rqMutate()
description: Update a state value via a callback — safe for objects and arrays.
---

## Signature

```ts
$.fn.rqMutate(key: string, fn: (currentValue: any) => any): this
```

**Chainable** — returns `this` for jQuery chaining.

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | Yes | The state key to update |
| `fn` | `function` | Yes | Receives the current value, returns the new value |

## Description

`rqMutate()` is a convenience wrapper around `rqGet` + `rqSet`. It:

1. Reads the current value of `key`
2. Passes it to `fn`
3. Writes `fn`'s return value via `rqSet` (triggering the full update pipeline)

This is the preferred way to update values that depend on their current state — especially numbers, arrays, and objects — because the read and write happen atomically without a separate `rqGet` call.

## Examples

### Increment a counter

```js
$('#app').rqMutate('count', n => n + 1);
```

### Toggle a boolean

```js
$('#app').rqMutate('open', v => !v);
```

### Append to an array

```js
$('#app').rqMutate('items', items => [...items, { id: Date.now(), text: 'New item' }]);
```

Using spread (`[...items, ...]`) returns a new array reference, which triggers the update pipeline and re-renders `data-rq-each`.

### Update a nested object property

```js
$('#app').rqMutate('user', user => ({ ...user, name: 'Bob' }));
```

Again, spread creates a new object reference so the update fires.

### Chaining

```js
$('#app')
  .rqMutate('count', n => n + 1)
  .rqMutate('lastUpdated', () => Date.now());
```

## Notes

- If `fn` returns the same reference that was passed in (e.g. you mutated an array in place with `.push()`), the `Object.is` no-op check in `rqSet` will prevent any updates from firing. Always return a new reference for objects and arrays.
- `fn` should be a pure function — avoid side effects inside it.
