---
title: rqReset()
description: Reset state to its original initial values.
---

## Signature

```ts
$.fn.rqReset(key?: string): this
```

**Chainable** — returns `this` for jQuery chaining.

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | No | The state key to reset. Omit to reset all keys. |

## Description

`rqReset()` restores state to the values that were passed to `rqState()` when the element was first initialized. It uses the full update pipeline — watchers fire and DOM bindings update for each key that actually changes value.

The "initial" snapshot is captured once at `rqState()` time. Calling `rqState()` again on the same element to merge new keys also adds those keys to the initial snapshot, so they too will be resetable.

## Examples

### Reset all keys

```js
$('#app').rqState({ count: 0, label: 'hello', active: false });

// ...later, after various changes...
$('#app').rqReset();
// count → 0, label → 'hello', active → false
```

### Reset a single key

```js
$('#app').rqReset('count');
// Only count is restored; other keys are untouched
```

### Reset button pattern

```html
<div id="form-demo">
  <input data-rq-val="firstName" />
  <input data-rq-val="lastName" />
  <button id="clear-btn">Clear</button>
</div>
```

```js
$('#form-demo').rqState({ firstName: '', lastName: '' });

$('#clear-btn').on('click', () => {
  $('#form-demo').rqReset();
});
```

### Combined with rqWatch

Watchers still fire on a reset, so you can react to the restore:

```js
$('#app')
  .rqState({ count: 5 })
  .rqWatch('count', (val) => console.log('count is now', val));

$('#app').rqReset(); // logs "count is now 0"
```

### Chaining

```js
$('#app')
  .rqReset()
  .rqSet('status', 'idle');
```

## Notes

- `rqReset()` uses `Object.is()` for change detection — keys that already match their initial value will not trigger watchers or DOM updates.
- The no-arg form resets **only keys from `initialData`**, not keys that were added later via `rqSet` for keys that never had an initial value.
- Does nothing (no-op) if the element has no state record.
