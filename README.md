# reQuery

A jQuery plugin that makes your page update itself when your data changes.

No React. No Vue. No build step. Just jQuery, the way you already know it.

---

## Who is this for?

You know jQuery. You've been writing things like:

```js
$('#count').text(count);
$('#message').show();
$('input').val(username);
```

And every time something changes, you have to remember to find every element that
displays that piece of data and update it by hand. It works — but it gets old fast.

reQuery lets you say *"when this value changes, update the page automatically"* —
without switching to React, without learning JSX, and without touching a bundler.

It's still jQuery. It still uses selectors. It just also keeps your DOM in sync.

---

## Quick Start

### Drop it in a page (no build step needed)

```html
<script src="https://code.jquery.com/jquery-4.0.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/peterbenoit/requery@latest/dist/requery.umd.js"></script>
```

### npm

```bash
npm install jquery
# copy dist/requery.esm.js into your project, or import from GitHub
```

```js
import $ from 'jquery';
import 'requery';
```

---

## Your first example

```html
<div id="counter">
  <p>Count: <strong data-rq-text="count">0</strong></p>
  <button id="inc">+</button>
  <button id="dec">−</button>
</div>

<script>
  $('#counter').rqState({ count: 0 });

  $('#inc').on('click', () => $('#counter').rqMutate('count', n => n + 1));
  $('#dec').on('click', () => $('#counter').rqMutate('count', n => n - 1));
</script>
```

That `data-rq-text="count"` attribute is the only new thing you need to learn.
It means: *"keep this element's text equal to the `count` value."*
When `count` changes, the text updates. You don’t touch the DOM yourself.

---

## Saving state between page reloads

Add `persist: 'any-name-you-want'` and reQuery handles localStorage for you:

```js
$('#counter').rqState({ count: 0 }, { persist: 'my-counter' });
```

That’s it. The count survives a page refresh. No extra code needed.

---

## API Reference

All methods start with `rq` so they don't clash with your existing jQuery code.

### `$.fn.rqState(initialData, opts?)`

This is how you start. Give it your data, and reQuery will keep the DOM in sync.

```js
$('#app').rqState({ count: 0, name: 'world' });
```

| Option | Type | Description |
|--------|------|-------------|
| `persist` | `string` | Save state to `localStorage` under this key. Restored on next load. |
| `actions` | `object` | Named event handlers for `data-rq-on-*` buttons |
| `onChange` | `function` | Runs as `(key, newValue, oldValue)` every time any value changes |
| `onInit` | `function` | Runs once after the page is first populated |
| `debug` | `boolean` | Log every state change to the browser console |

---

### `$.fn.rqGet(key?)`

Read a value. Pass a key to get one value; pass nothing to get all values as a plain object.

```js
const count = $('#app').rqGet('count');   // → 0
const all   = $('#app').rqGet();          // → { count: 0, name: 'world' }
```

---

### `$.fn.rqSet(key, value)` or `$.fn.rqSet({ key: value, ... })`

Change a value. The DOM updates immediately. Chainable.

```js
$('#app').rqSet('count', 5);

// Set multiple at once:
$('#app').rqSet({ count: 0, name: 'reset' });
```

---

### `$.fn.rqMutate(key, fn)`

Update a value based on what it currently is. The right tool for counters, toggles, and arrays.

```js
$('#app').rqMutate('count', n => n + 1);          // increment
$('#app').rqMutate('open', v => !v);               // toggle
$('#app').rqMutate('items', arr => [...arr, 'new']); // append
```

---

### `$.fn.rqWatch(key, fn)`

Run something whenever a specific value changes.

```js
$('#app').rqWatch('count', (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} → ${newVal}`);
});
```

---

### `$.fn.rqComputed(key, fn)`

Derive a value from other values. Updates automatically when dependencies change.

```js
$('#app')
  .rqState({ price: 10, qty: 3 })
  .rqComputed('total', data => data.price * data.qty);

$('#app').rqGet('total'); // → 30
```

---

### `$.fn.rqReset(key?)`

Restore original values. Pass a key to reset just one thing, or nothing to reset everything.

```js
$('#app').rqReset('count');  // just count
$('#app').rqReset();         // everything
```

---

### `$.fn.rqDestroy()`

Clean up completely. Removes state and unbinds all reQuery event listeners.

```js
$('#app').rqDestroy();
```

---

## DOM Binding Attributes

Bind state to the DOM declaratively with `data-rq-*` attributes. Bindings are scoped — they only apply within the element that owns the state.

### `data-rq-text="key"`

Sets the element's `textContent`.

```html
<span data-rq-text="count">0</span>
```

---

### `data-rq-html="key"`

Sets the element's `innerHTML`.

```html
<div data-rq-html="richContent"></div>
```

---

### `data-rq-val="key"`

**Two-way** binding for `<input>`, `<select>`, and `<textarea>`. User input updates state; state changes update the input.

```html
<input type="text" data-rq-val="username" />
<p>Hello, <span data-rq-text="username"></span>!</p>
```

Supports `text`, `number`, `range`, `checkbox`, and `radio` inputs.

---

### `data-rq-show="key"`

Shows or hides the element based on truthiness.

```html
<p data-rq-show="isLoggedIn">Welcome back!</p>
```

---

### `data-rq-attr-[name]="key"`

Binds any HTML attribute.

```html
<a data-rq-attr-href="profileUrl">View profile</a>
<img data-rq-attr-src="avatarUrl" />
```

---

### `data-rq-class-[name]="key"`

Toggles a CSS class based on truthiness.

```html
<div data-rq-class-active="isActive" data-rq-class-highlight="isHighlighted">
  ...
</div>
```

---

### `data-rq-each="key"` *(Phase 4)*

Renders an array over a `<template>` element. One clone per item. Item-level `data-rq-*` attributes resolve against the item's properties.

```html
<template data-rq-each="todos">
  <li>
    <span data-rq-text="label"></span>
  </li>
</template>
```

```js
$('#app').rqState({
  todos: [{ label: 'Buy milk' }, { label: 'Fix bugs' }]
});
```

---

### `data-rq-on-[event]="actionName"` *(Phase 5)*

Declarative event binding. Define named action handlers in `rqState` options.

```html
<button data-rq-on-click="increment">+</button>
<button data-rq-on-click="decrement">−</button>
```

```js
$('#app').rqState({ count: 0 }, {
  actions: {
    increment(state) { return { count: state.count + 1 }; },
    decrement(state) { return { count: state.count - 1 }; },
  }
});
```

Actions receive `(currentState, event, $rootEl)` and return a partial state update object.

---

## Examples

Open any file in `examples/` directly in a browser — no build step needed.

| File | Covers |
|------|--------|
| [`phase1-2-state-binding.html`](examples/phase1-2-state-binding.html) | State, binding, two-way inputs, show/hide, classes, computed, watch |

---

## Development

```bash
git clone https://github.com/peterbenoit/requery.git
cd requery
npm install

npm run build      # → dist/requery.esm.js + dist/requery.umd.js
npm test           # → Vitest test suite
npm run test:watch # → interactive watch mode
npm run dev        # → build in watch mode
```

### Project Structure

```
src/
  core/
    state.js      ← Phase 1: WeakMap state engine
    binding.js    ← Phase 2: data-rq-* DOM binding
    watch.js      ← Phase 3: rqWatch + rqComputed  (reserved)
    lists.js      ← Phase 4: data-rq-each
    events.js     ← Phase 5: data-rq-on-* actions
  requery.js      ← entry point, assembles $.fn.rq* methods
dist/             ← built output (committed for CDN use)
test/             ← Vitest tests, one file per module
examples/         ← plain HTML demos
```

### Testing

Tests use [Vitest](https://vitest.dev/) with [happy-dom](https://github.com/capricorn86/happy-dom) for DOM simulation.

```bash
npm test
```

---

## Design Principles

- **Start with a selector**, not with data — because that's jQuery
- **No virtual DOM** — reQuery writes directly to the DOM, the same way you always have
- **No component tree** — your elements are just elements, not components
- **No build step for users** — drop in a `<script>` tag and go
- **State is private** — it doesn't sit on the DOM or in a global variable; it's invisible until you read it

---

## Browser Support

Requires jQuery 4+ (which itself requires modern browsers — no IE). reQuery is written in ES2020+.

---

## License

[MIT](LICENSE) © 2026 Peter Benoit

## Author

Created by [Peter Benoit](https://www.peterbenoit.com)

