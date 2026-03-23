# reQuery — Agent Instructions

This file is the source of truth for all AI agents working in this repository.
CLAUDE.md and GEMINI.md both import this file for shared guidance.

---

## Project Identity

**reQuery** is a jQuery 4 plugin that brings reactive state and declarative DOM binding
to jQuery-flavored projects. It is NOT a reimplementation of Vue, React, or any other
component framework.

---

## Target Audience — READ THIS BEFORE WRITING ANY CODE OR DOCS

reQuery is built for **jQuery developers who don't know React or Vue** and don't want to
learn them. These are people who:

- Know enough jQuery to wire up a click handler and update some text
- Have been writing `$(el).css()`, `$(el).text()`, `$(el).show()` for years
- Would love their page to update automatically when data changes, without having to
  manually hunt down every DOM element and repaint it
- Would be overwhelmed by React's JSX, components, hooks, bundlers, and mental model
- Are building WordPress sites, small CMSes, landing pages with interactivity, or
  maintaining legacy codebases that already use jQuery

**This means:**
- Every feature must have a one-line or two-line "just works" usage path
- Docs and examples must assume the reader knows jQuery, not computer science
- Avoid jargon like "WeakMap", "reactive pipeline", "declarative binding" in user-facing
  writing. Say what the thing *does*, not how it works internally.
- Simple is always better than complete. An 80% solution that a beginner can understand
  beats a 100% solution they'll never use.
- **Do not gate-keep features because they don't fit a purist philosophy.** If a beginner
  will obviously want it (e.g. "save my data when I reload the page"), build it and make
  it simple.

---

## Core Philosophy — READ THIS FIRST

These rules are non-negotiable. Every suggestion, refactor, and implementation must
honor them:

1. **jQuery-first, selector-centric.** You start with the DOM element, not with data.
   The API mirrors jQuery's own patterns — fluent, chainable, element-scoped.

2. **No virtual DOM. No diffing.** Direct DOM manipulation only. jQuery does this;
   so does reQuery.

3. **No component tree.** There are no parent/child component relationships, no
   lifecycle hooks (mounted, unmounted, etc.), and no render functions.

4. **Chainable API.** All `$.fn.rq*` methods return `this` for chaining unless a value
   is being retrieved (`rqGet`).

5. **No build step required for consumers.** The `dist/requery.umd.js` file must work
   when dropped in a `<script>` tag alongside jQuery 4 from a CDN. No transpilation,
   no bundler needed by the end user.

6. **State is scoped to a DOM element.** State is stored in a WeakMap keyed to the
   root element. It does not live in a global store.

7. **Binding uses `data-rq-*` attributes.** No custom template syntax. No JSX. No
   string interpolation in HTML. Work with existing HTML.

8. **Do not suggest Vue or React patterns** unless the user explicitly asks to compare
   them. Suggestions like "you should use a component," "lift state up," or "use a
   computed property in a component" are off-brand for this project.

---

## API Naming Convention

All jQuery plugin methods use the `rq` prefix on `$.fn`:

| Method | Purpose |
|--------|---------|
| `$.fn.rqState(obj, opts?)` | Initialize state on a scoped element |
| `$.fn.rqGet(key)` | Read a state value |
| `$.fn.rqSet(key, value)` | Write a state value, triggers DOM updates |
| `$.fn.rqMutate(key, fn)` | Update state via callback (safe for objects/arrays) |
| `$.fn.rqWatch(key, fn)` | Watch a key for changes |
| `$.fn.rqComputed(key, fn)` | Define a derived value |

DOM binding attributes:

| Attribute | Purpose |
|-----------|---------|
| `data-rq-text="key"` | Bind text content |
| `data-rq-html="key"` | Bind innerHTML |
| `data-rq-val="key"` | Two-way bind for inputs |
| `data-rq-attr-[name]="key"` | Bind any HTML attribute |
| `data-rq-class-[name]="key"` | Toggle a CSS class |
| `data-rq-show="key"` | Show/hide element |
| `data-rq-each="key"` | Render array over a `<template>` |
| `data-rq-on-[event]="action"` | Declarative event handler |

---

## Project Structure

```
src/
  core/
    state.js      ← WeakMap store, rqState/rqGet/rqSet/rqMutate
    binding.js    ← data-rq-* DOM binding engine
    watch.js      ← rqWatch + rqComputed
    lists.js      ← data-rq-each list rendering
    events.js     ← data-rq-on-* declarative events
  requery.js      ← assembles and registers $.fn.rq* methods
dist/
  requery.esm.js
  requery.umd.js
test/
  *.test.js
examples/
  *.html          ← plain HTML, no build step, CDN jQuery 4
```

---

## Development Phases

Work through phases in order. Do not implement a later phase if an earlier one is
incomplete or untested.

1. **Phase 1 — State Core** (`src/core/state.js`)
2. **Phase 2 — DOM Binding** (`src/core/binding.js`)
3. **Phase 3 — Watch & Computed** (`src/core/watch.js`)
4. **Phase 4 — Lists** (`src/core/lists.js`)
5. **Phase 5 — Declarative Events** (`src/core/events.js`)

---

## Out of Scope

Do not suggest or implement the following unless the user explicitly requests them:

- A router (e.g., jquery-router, hash-based navigation)
- Server-side rendering
- A component registry or global component system
- Virtual DOM or DOM diffing
- JSX or any custom template language
- Any React/Vue/Svelte-style lifecycle hooks

**Persistence is IN scope.** `opts.persist` saves state to `localStorage` automatically.
This is a core user need — beginners absolutely expect data to survive a page reload.
Do not suggest they "just use onChange and write their own persistence layer" — that
defeats the purpose. The option exists; use it.

---

## Code Style

- ES2020+ syntax (jQuery 4 dropped IE support; we can too)
- 2-space indentation
- Single quotes for strings
- Semicolons required
- JSDoc comments on all public functions
- No TypeScript (keep it accessible, script-tag friendly)
- `const` by default; `let` when mutation is needed; never `var`
- Prefer named functions over anonymous arrows for jQuery plugin methods

---

## Build

```bash
npm run build    # produces dist/requery.esm.js + dist/requery.umd.js
npm test         # runs Vitest
npm run dev      # watch mode
```

---

## Testing

- One test file per source module (e.g., `test/state.test.js`)
- Tests use happy-dom (in Vitest config) for DOM simulation
- Each test should be independent — no shared mutable state between tests
- Test the public `$.fn.rq*` API, not internal WeakMap internals directly

---

## Examples

Every feature must have a corresponding plain HTML file in `examples/`. These files:
- Load jQuery 4 from CDN
- Load `dist/requery.umd.js` via a relative `<script>` tag
- Require no build step to run
- Serve as the primary documentation for end users
