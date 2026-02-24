---
title: rqWatch()
description: Register a callback that fires when a state key changes.
---

## Signature

```ts
$.fn.rqWatch(key: string, fn: (newValue: any, oldValue: any) => void): this
```

**Chainable** — returns `this` for jQuery chaining.

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | Yes | The state key to watch |
| `fn` | `function` | Yes | Called with `(newValue, oldValue)` when the key changes |

## Description

`rqWatch()` registers a watcher function for a specific state key. The function is called **synchronously** as part of the `rqSet`/`rqMutate` update pipeline, before the function returns.

Multiple watchers on the same key are all registered and called in registration order.

Watchers are intended for **side effects**: logging, analytics, cross-key updates, external integrations, etc.

## Examples

### Basic watcher

```js
$('#app')
  .rqState({ count: 0 })
  .rqWatch('count', (newVal, oldVal) => {
    console.log(`count: ${oldVal} → ${newVal}`);
  });

$('#app').rqSet('count', 5);
// Logs: "count: 0 → 5"
```

### Update another key from a watcher

```js
$('#app')
  .rqState({ price: 10, qty: 2, total: 20 })
  .rqWatch('price', () => recalcTotal())
  .rqWatch('qty', () => recalcTotal());

function recalcTotal() {
  const price = $('#app').rqGet('price');
  const qty   = $('#app').rqGet('qty');
  $('#app').rqSet('total', price * qty);
}
```

### Multiple watchers on the same key

```js
$('#app')
  .rqWatch('status', val => updateBadge(val))
  .rqWatch('status', val => logStatusChange(val));
// Both fire when 'status' changes, in registration order
```

### Page title sync

```js
$('#app').rqWatch('title', (val) => {
  document.title = val;
});
```

## Notes

- There is **no way to unregister** a watcher once it is registered. If you need conditional watching, gate inside the callback: `if (!condition) return;`
- Watchers do **not** fire on the initial `rqState()` call — only on subsequent `rqSet`/`rqMutate` changes.
- Watchers receive the values **after** the state write but the exact same synchronous call — DOM updates happen after watchers.
