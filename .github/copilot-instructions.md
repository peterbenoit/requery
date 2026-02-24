# reQuery — GitHub Copilot Instructions

## What this project is

reQuery is a **jQuery 4 plugin** that adds reactive state and declarative DOM binding.
It is NOT a React/Vue/Svelte clone. It follows jQuery conventions: selector-first,
chainable, DOM-centric, no build step required for consumers.

## API Surface

Plugin methods all use the `rq` prefix on `$.fn`:
- `$.fn.rqState(obj, opts?)` — init state on an element
- `$.fn.rqGet(key)` — read state
- `$.fn.rqSet(key, value)` — write state + trigger DOM updates
- `$.fn.rqMutate(key, fn)` — update state via callback
- `$.fn.rqWatch(key, fn)` — reactive watcher
- `$.fn.rqComputed(key, fn)` — derived value

DOM binding via `data-rq-*` attributes:
- `data-rq-text`, `data-rq-html`, `data-rq-val`
- `data-rq-attr-[name]`, `data-rq-class-[name]`, `data-rq-show`
- `data-rq-each` (list rendering from a `<template>`)
- `data-rq-on-[event]` (declarative events)

## Code Style

- ES2020+, 2-space indent, single quotes, semicolons
- JSDoc on all public functions
- No TypeScript — plain JS only
- State stored in a WeakMap (never `$.data()`)
- All `$.fn.rq*` methods return `this` for chaining (except `rqGet`)

## Do NOT suggest

- Component trees or lifecycle hooks (mounted, unmounted, etc.)
- Virtual DOM or DOM diffing
- Migrating to TypeScript
- Adding a bundler requirement for end users
- Vue/React/Svelte patterns (v-bind, :prop, useState, etc.)
- A global state store

## Project structure

```
src/core/state.js      ← Phase 1: state engine
src/core/binding.js    ← Phase 2: data-rq-* DOM binding
src/core/watch.js      ← Phase 3: watch + computed
src/core/lists.js      ← Phase 4: data-rq-each
src/core/events.js     ← Phase 5: data-rq-on-*
src/requery.js         ← entry point, assembles $.fn methods
test/                  ← Vitest tests, one file per module
examples/              ← plain HTML demos, no build step
dist/                  ← built output (do not edit directly)
```

## Testing

- Vitest + happy-dom
- Run: `npm test`
- Test files: `test/state.test.js`, `test/binding.test.js`, etc.
