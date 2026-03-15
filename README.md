# reQuery

A **jQuery 4 plugin** that brings reactive state and declarative DOM binding to your jQuery projects — without introducing a component framework, a virtual DOM, or a build step.

> jQuery-first. Selector-centric. Chainable. No magic.

---

## Why reQuery?

If you work on projects that use jQuery — legacy codebases, WordPress themes, simple web pages — you've probably wanted reactive data binding without pulling in an entire framework. reQuery adds that capability in a way that feels like native jQuery: you start with a selector, you chain methods, and the DOM updates itself.

No virtual DOM. No component tree. No build step required.

---

## Quick Start

### Script tag (no build step)

```html
<script src="https://code.jquery.com/jquery-4.0.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/peterbenoit/requery@latest/dist/requery.umd.js"></script>
```

### ESM / npm

```bash
npm install jquery
# copy dist/requery.esm.js into your project, or import from GitHub
```

```js
import $ from 'jquery';
import 'requery'; // registers $.fn.rq* methods
```

---

## Basic Example

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

That's it. No components, no templates, no compilation.

---

## API Reference

All methods are registered on `$.fn` and use the `rq` prefix.

### `$.fn.rqState(initialData, opts?)`

Initialize reactive state on the matched element. State is scoped to that element — it doesn't leak globally.

```js
$('#app').rqState({ count: 0, name: 'world' });
```

| Option | Type | Description |
|--------|------|-------------|
| `actions` | `object` | Named event handlers for `data-rq-on-*` bindings (Phase 5) |

---

### `$.fn.rqGet(key)`

Read a state value. Returns the value (not chainable).

```js
const count = $('#app').rqGet('count'); // → 0
```

---

### `$.fn.rqSet(key, value)`

Write a state value. Triggers all DOM bindings and watchers for that key. Chainable.

```js
$('#app').rqSet('count', 5).rqSet('name', 'reQuery');
```

---

### `$.fn.rqMutate(key, fn)`

Update state via a callback — safe for arrays and objects. Chainable.

```js
$('#app').rqMutate('count', n => n + 1);
$('#app').rqMutate('items', arr => [...arr, 'new item']);
```

---

### `$.fn.rqWatch(key, fn)`

Register a watcher that fires when a key changes. Chainable.

```js
$('#app')
  .rqState({ count: 0 })
  .rqWatch('count', (newVal, oldVal) => {
    console.log(`count changed: ${oldVal} → ${newVal}`);
  });
```

---

### `$.fn.rqComputed(key, fn)`

Register a derived value computed from state. Chainable.

```js
$('#app')
  .rqState({ price: 10, qty: 3 })
  .rqComputed('total', data => data.price * data.qty);

$('#app').rqGet('total'); // → 30
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

- **jQuery-first** — start with a selector, not with data
- **No virtual DOM** — direct DOM manipulation, always
- **No component tree** — scope is the element, not a hierarchy
- **Chainable** — `$.fn.rq*` methods return `this`
- **No build step for consumers** — drop in a `<script>` tag and go
- **State is private** — stored in a WeakMap, not on the DOM or `$.data()`

---

## Browser Support

Requires jQuery 4+ (which itself requires modern browsers — no IE). reQuery is written in ES2020+.

---

## License

[MIT](LICENSE) © 2026 Peter Benoit

## Author

Created by [Peter Benoit](https://www.peterbenoit.com)

