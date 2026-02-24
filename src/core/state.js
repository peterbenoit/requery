/**
 * reQuery — State Core (Phase 1)
 *
 * Provides reactive state scoped to a DOM element.
 * State is stored in a WeakMap to avoid memory leaks and keep
 * internals private from jQuery's $.data() and the DOM.
 *
 * Public API (registered on $.fn in requery.js):
 *   $.fn.rqState(obj, opts?)   — initialize state
 *   $.fn.rqGet(key)            — read a state value
 *   $.fn.rqSet(key, value)     — write a value, triggers updates
 *   $.fn.rqMutate(key, fn)     — update via callback (safe for objects/arrays)
 */

/** @type {WeakMap<Element, object>} */
const store = new WeakMap();

/**
 * Returns the internal state record for an element, or null if none.
 * @param {Element} el
 * @returns {{ data: object, watchers: object, computed: object } | null}
 */
export function getRecord(el) {
	return store.get(el) ?? null;
}

/**
 * Initialize reactive state on a DOM element.
 * Calling rqState again on the same element merges new keys in.
 *
 * @param {Element} el - The root DOM element
 * @param {object} initialData - Initial state key/value pairs
 * @param {object} [opts={}] - Options (reserved for future use)
 */
export function initState(el, initialData, opts = {}) {
	if (store.has(el)) {
		// Merge additional keys into existing state
		const record = store.get(el);
		Object.assign(record.data, initialData);
	} else {
		store.set(el, {
			data: { ...initialData },
			watchers: {},   // { [key]: Function[] }
			computed: {},   // { [key]: Function }
		});
	}
}

/**
 * Read a state value.
 *
 * @param {Element} el
 * @param {string} key
 * @returns {*}
 */
export function getState(el, key) {
	const record = getRecord(el);
	if (!record) return undefined;
	// If it's a computed key, call the function
	if (record.computed[key]) {
		return record.computed[key](record.data);
	}
	return record.data[key];
}

/**
 * Write a state value and trigger any registered watchers and DOM binding updates.
 *
 * @param {Element} el
 * @param {string} key
 * @param {*} value
 * @param {Function} [onUpdate] - callback for DOM binding (injected by binding.js)
 */
export function setState(el, key, value, onUpdate) {
	const record = getRecord(el);
	if (!record) {
		console.warn(`reQuery: rqSet called on element with no state.`, el);
		return;
	}

	const oldValue = record.data[key];
	if (Object.is(oldValue, value)) return; // No change, bail early

	record.data[key] = value;

	// Notify watchers
	const watchers = record.watchers[key];
	if (watchers) {
		watchers.forEach(fn => fn(value, oldValue));
	}

	// Trigger DOM binding update if a handler is registered
	if (typeof onUpdate === 'function') {
		onUpdate(el, key, value, record.data);
	}
}

/**
 * Update a state value via a callback function.
 * Safe for objects and arrays since you receive the current value.
 *
 * @param {Element} el
 * @param {string} key
 * @param {Function} fn - Receives current value, returns new value
 * @param {Function} [onUpdate] - DOM binding callback
 */
export function mutateState(el, key, fn, onUpdate) {
	const record = getRecord(el);
	if (!record) {
		console.warn(`reQuery: rqMutate called on element with no state.`, el);
		return;
	}
	const newValue = fn(record.data[key]);
	setState(el, key, newValue, onUpdate);
}

/**
 * Register a watcher for a state key.
 *
 * @param {Element} el
 * @param {string} key
 * @param {Function} fn - Called with (newValue, oldValue) on change
 */
export function addWatcher(el, key, fn) {
	const record = getRecord(el);
	if (!record) {
		console.warn(`reQuery: rqWatch called on element with no state.`, el);
		return;
	}
	if (!record.watchers[key]) {
		record.watchers[key] = [];
	}
	record.watchers[key].push(fn);
}

/**
 * Register a computed (derived) value for a key.
 *
 * @param {Element} el
 * @param {string} key
 * @param {Function} fn - Receives full state data object, returns derived value
 */
export function addComputed(el, key, fn) {
	const record = getRecord(el);
	if (!record) {
		console.warn(`reQuery: rqComputed called on element with no state.`, el);
		return;
	}
	record.computed[key] = fn;
}
