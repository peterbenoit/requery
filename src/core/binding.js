/**
 * reQuery — DOM Binding Engine (Phase 2)
 *
 * Declarative DOM binding via data-rq-* attributes.
 * Binding is always scoped to the root element that owns the state.
 *
 * Supported attributes:
 *   data-rq-text="key"          — sets element.textContent
 *   data-rq-html="key"          — sets element.innerHTML
 *   data-rq-val="key"           — two-way bind for inputs/selects/textareas
 *   data-rq-attr-[name]="key"   — sets any HTML attribute
 *   data-rq-class-[name]="key"  — toggles a CSS class (truthy/falsy)
 *   data-rq-show="key"          — shows/hides element (jQuery show/hide)
 */

import $ from 'jquery';

/**
 * Apply all data-rq-* bindings within a root element for a specific key/value.
 * Called by setState whenever a key changes.
 *
 * @param {Element} rootEl - The element that owns the state
 * @param {string} changedKey - The state key that changed
 * @param {*} value - The new value
 * @param {object} allData - The complete state data object
 */
export function applyBindings(rootEl, changedKey, value, allData) {
	const $root = $(rootEl);

	// data-rq-text
	$root.find(`[data-rq-text="${changedKey}"]`).add(
		$root.filter(`[data-rq-text="${changedKey}"]`)
	).each(function () {
		this.textContent = value == null ? '' : String(value);
	});

	// data-rq-html
	$root.find(`[data-rq-html="${changedKey}"]`).add(
		$root.filter(`[data-rq-html="${changedKey}"]`)
	).each(function () {
		this.innerHTML = value == null ? '' : String(value);
	});

	// data-rq-val (one-direction: state → input)
	$root.find(`[data-rq-val="${changedKey}"]`).add(
		$root.filter(`[data-rq-val="${changedKey}"]`)
	).each(function () {
		const el = this;
		if (el.type === 'checkbox') {
			el.checked = Boolean(value);
		} else if (el.type === 'radio') {
			el.checked = el.value === String(value);
		} else {
			el.value = value == null ? '' : String(value);
		}
	});

	// data-rq-show
	$root.find(`[data-rq-show="${changedKey}"]`).add(
		$root.filter(`[data-rq-show="${changedKey}"]`)
	).each(function () {
		value ? $(this).show() : $(this).hide();
	});

	// data-rq-attr-[name] — e.g. data-rq-attr-href="url"
	$root.find('[data-rq-attr]').add($root.filter('[data-rq-attr]')).each(function () {
		// handled below via attribute enumeration
	});

	// Enumerate all attributes on descendants to handle data-rq-attr-* and data-rq-class-*
	$root.find('*').add($root).each(function () {
		const attrs = this.attributes;
		for (let i = 0; i < attrs.length; i++) {
			const attrName = attrs[i].name;
			const attrValue = attrs[i].value;

			if (attrValue !== changedKey) continue;

			// data-rq-attr-[htmlattr]="key"
			if (attrName.startsWith('data-rq-attr-')) {
				const htmlAttr = attrName.slice('data-rq-attr-'.length);
				if (value == null) {
					this.removeAttribute(htmlAttr);
				} else {
					this.setAttribute(htmlAttr, String(value));
				}
			}

			// data-rq-class-[classname]="key"
			if (attrName.startsWith('data-rq-class-')) {
				const className = attrName.slice('data-rq-class-'.length);
				this.classList.toggle(className, Boolean(value));
			}
		}
	});
}

/**
 * Perform a full initial render pass for all data-rq-* bindings in a root element.
 * Called once after rqState() initializes state so the DOM reflects initial values.
 *
 * @param {Element} rootEl
 * @param {object} allData - Complete state data
 */
export function renderAll(rootEl, allData) {
	Object.keys(allData).forEach(key => {
		applyBindings(rootEl, key, allData[key], allData);
	});
}

/**
 * Wire up two-way binding for data-rq-val inputs within a root element.
 * Input events update state, which triggers applyBindings back to the DOM.
 *
 * @param {Element} rootEl
 * @param {Function} setStateFn - bound setState for this element
 */
export function bindInputs(rootEl, setStateFn) {
	const $root = $(rootEl);

	$root.on('input change', '[data-rq-val]', function () {
		const key = this.getAttribute('data-rq-val');
		let value;
		if (this.type === 'checkbox') {
			value = this.checked;
		} else if (this.type === 'number' || this.type === 'range') {
			value = this.valueAsNumber;
		} else {
			value = this.value;
		}
		setStateFn(key, value);
	});
}
