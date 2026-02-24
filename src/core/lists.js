/**
 * reQuery — List Rendering (Phase 4)
 *
 * Renders arrays using a <template> element as the item blueprint.
 * No virtual DOM, no diffing — the list container is cleared and
 * re-stamped on each update. Simple, honest, jQuery-native.
 *
 * Usage:
 *   <template data-rq-each="items">
 *     <li>
 *       <span data-rq-text="label"></span>
 *     </li>
 *   </template>
 *
 * The content inside <template> is cloned once per array item.
 * Item-level data-rq-* attributes are resolved against the item object
 * (if items are objects) or against a synthetic { value, index } shape
 * (if items are primitives).
 */

import $ from 'jquery';
import { applyBindings } from './binding.js';

/**
 * Render list bindings for a changed key within a root element.
 * Called from applyBindings when the changed key matches a data-rq-each.
 *
 * @param {Element} rootEl
 * @param {string} changedKey
 * @param {Array} items
 */
export function renderList(rootEl, changedKey, items) {
	const $root = $(rootEl);

	$root.find(`template[data-rq-each="${changedKey}"]`).each(function () {
		const $template = $(this);
		const templateContent = this.content; // DocumentFragment

		// The list container is the next sibling element, or we create one
		let $container = $template.next(`[data-rq-list="${changedKey}"]`);
		if (!$container.length) {
			$container = $('<div>').attr('data-rq-list', changedKey);
			$template.after($container);
		}

		// Clear and re-render
		$container.empty();

		if (!Array.isArray(items)) return;

		items.forEach((item, index) => {
			// Clone the template's content
			const $clone = $(document.importNode(templateContent, true));

			// Normalize item to an object
			const itemData = (item !== null && typeof item === 'object')
				? { ...item, $index: index }
				: { value: item, $index: index };

			// Apply bindings within the clone using item data
			$clone.find('*').add($clone).each(function () {
				Object.keys(itemData).forEach(key => {
					applyItemBindings(this, key, itemData[key]);
				});
			});

			$container.append($clone);
		});
	});
}

/**
 * Apply data-rq-* bindings to a single element using item-scoped data.
 * This is a simplified version of applyBindings for list item context.
 *
 * @param {Element} el
 * @param {string} key
 * @param {*} value
 */
function applyItemBindings(el, key, value) {
	const attrs = el.attributes;
	if (!attrs) return;

	for (let i = 0; i < attrs.length; i++) {
		const attrName = attrs[i].name;
		const attrValue = attrs[i].value;

		if (attrValue !== key) continue;

		if (attrName === 'data-rq-text') {
			el.textContent = value == null ? '' : String(value);
		} else if (attrName === 'data-rq-html') {
			el.innerHTML = value == null ? '' : String(value);
		} else if (attrName === 'data-rq-val') {
			el.value = value == null ? '' : String(value);
		} else if (attrName === 'data-rq-show') {
			el.style.display = value ? '' : 'none';
		} else if (attrName.startsWith('data-rq-attr-')) {
			const htmlAttr = attrName.slice('data-rq-attr-'.length);
			if (value == null) {
				el.removeAttribute(htmlAttr);
			} else {
				el.setAttribute(htmlAttr, String(value));
			}
		} else if (attrName.startsWith('data-rq-class-')) {
			const className = attrName.slice('data-rq-class-'.length);
			el.classList.toggle(className, Boolean(value));
		}
	}
}
