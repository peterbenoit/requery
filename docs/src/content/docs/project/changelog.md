---
title: Changelog
description: All notable changes to reQuery, following keepachangelog.com conventions.
---

All notable changes to reQuery are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
reQuery adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-02-24

Initial release.

### Added

**Phase 1 — State Core** (`src/core/state.js`)
- `$.fn.rqState(initialData, opts?)` — initialize element-scoped reactive state via WeakMap
- `$.fn.rqGet(key)` — read a state value (supports computed keys)
- `$.fn.rqSet(key, value)` — write state, trigger watchers and DOM updates
- `$.fn.rqMutate(key, fn)` — update state via callback, safe for objects and arrays
- `$.fn.rqWatch(key, fn)` — register a watcher for a state key
- `$.fn.rqComputed(key, fn)` — define a lazily-evaluated derived value
- No-op optimisation via `Object.is()` — skips updates when value is unchanged
- Re-init merge behaviour — calling `rqState()` again on the same element merges keys

**Phase 2 — DOM Binding** (`src/core/binding.js`)
- `data-rq-text` — bind `textContent`
- `data-rq-html` — bind `innerHTML`
- `data-rq-val` — two-way binding for `input`, `select`, `textarea` (handles text, number, checkbox, radio)
- `data-rq-show` — show/hide via jQuery `.show()` / `.hide()`
- `data-rq-attr-[name]` — bind any HTML attribute; `null` removes the attribute
- `data-rq-class-[name]` — toggle a CSS class based on truthy state value
- Initial render pass on `rqState()` — all bindings populated immediately

**Phase 4 — List Rendering** (`src/core/lists.js`)
- `data-rq-each` — render arrays using a `<template>` element
- Object items: each object key is available as a binding inside the template
- Primitive items: wrapped as `{ value, $index }` automatically
- Full clear-and-re-render on every array update

**Phase 5 — Declarative Events** (`src/core/events.js`)
- `data-rq-on-[event]` — bind named action functions to DOM events
- Actions receive `(state, event, $root)` and return a partial state update (or void)
- Event delegation from the root element — works with dynamically rendered content

**Build**
- Vite 6 build: `dist/requery.esm.js` (ES module) + `dist/requery.umd.js` (UMD/script-tag)
- jQuery 4 externalized — not bundled, required as peer dependency

**Tests**
- Vitest + happy-dom test suite
- `test/state.test.js` — state core
- `test/binding.test.js` — DOM binding engine
