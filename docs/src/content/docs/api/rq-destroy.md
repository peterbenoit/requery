---
title: rqDestroy()
description: Remove state and unbind all reQuery event handlers from an element.
---

import { Aside } from '@astrojs/starlight/components';

## Signature

```ts
$.fn.rqDestroy(): this
```

**Chainable** — returns `this` for jQuery chaining (though subsequent `rq*` calls will have no state to work with).

## Parameters

None.

## Description

`rqDestroy()` performs a full teardown of reQuery on the matched element(s):

1. **Removes the state record** from the internal WeakMap — `rqGet`, `rqSet`, etc. all become no-ops that emit console warnings
2. **Unbinds all reQuery event handlers** — input listeners (`data-rq-val`), action delegates (`data-rq-on-*`), and any jQuery events bound under the `.rq` namespace are removed

The DOM itself is left as-is. Any `data-rq-*` attributes remain in the HTML; they are simply no longer active. The element can be re-initialized with `rqState()` at any time.

<Aside type="tip">
  `rqDestroy()` is intended for dynamic UIs where reactive sections are removed or replaced \u2014 e.g., a modal that is torn down when closed, or a widget that is replaced by server-rendered HTML.
</Aside>

## Examples

### Basic teardown

```js
$('#widget').rqState({ count: 0 });

// ... later, when the widget is removed
$('#widget').rqDestroy();
$('#widget').remove();
```

### Re-initialize after destroy

```js
$('#panel').rqState({ open: true });

$('#panel').rqDestroy();

// Start fresh with new state
$('#panel').rqState({ open: false, tab: 'info' });
```

### Teardown in a close handler

```html
<div id="modal">
  <p data-rq-text="message"></p>
  <button id="close-modal">Close</button>
</div>
```

```js
function openModal(message) {
  $('#modal').rqState({ message }).show();
}

$('#close-modal').on('click', () => {
  $('#modal').rqDestroy().hide();
});
```

## Notes

- After `rqDestroy()`, calling `rqGet`, `rqSet`, `rqWatch`, etc. will log a console warning and return `undefined` (for `rqGet`) or `this` (for chainable methods).
- `rqDestroy()` does **not** remove `data-rq-*` attributes from the DOM.
- The WeakMap entry is deleted, so the previous state object can be garbage-collected.
- Because reQuery events are all bound under the `.rq` jQuery namespace, `rqDestroy()` will not accidentally remove event handlers added by other code.
