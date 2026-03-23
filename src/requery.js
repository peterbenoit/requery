/**
 * reQuery — jQuery 4 Plugin Entry Point
 *
 * Assembles all core modules and registers $.fn.rq* methods on jQuery.
 *
 * Usage (script tag):
 *   <script src="https://code.jquery.com/jquery-4.0.0.min.js"></script>
 *   <script src="dist/requery.umd.js"></script>
 *
 * Usage (ESM):
 *   import $ from 'jquery';
 *   import 'requery';
 */

import $ from 'jquery';
import { initState, getState, setState, mutateState, addWatcher, addComputed, getRecord, destroyState } from './core/state.js';
import { applyBindings, renderAll, bindInputs } from './core/binding.js';
import { renderList } from './core/lists.js';
import { bindActions } from './core/events.js';

/**
 * Shared update handler passed into setState/mutateState.
 * Coordinates DOM binding and list rendering after a state change.
 *
 * @param {Element} el
 * @param {string} key
 * @param {*} value
 * @param {object} allData
 */
function onUpdate(el, key, value, allData) {
	applyBindings(el, key, value, allData);
	renderList(el, key, value);
}

// ---------------------------------------------------------------------------
// $.fn.rqState(initialData, opts?)
// Initialize reactive state on the matched element(s).
// ---------------------------------------------------------------------------
$.fn.rqState = function (initialData = {}, opts = {}) {
	return this.each(function () {
		const el = this;
		let data = { ...initialData };

		// Persistence: load saved state from localStorage on init.
		// Only keys that exist in initialData are restored — no unknown keys
		// are ever injected from storage.
		if (opts.persist) {
			try {
				const saved = JSON.parse(localStorage.getItem(opts.persist) || 'null');
				if (saved && typeof saved === 'object') {
					Object.keys(data).forEach(k => {
						if (Object.prototype.hasOwnProperty.call(saved, k)) {
							data[k] = saved[k];
						}
					});
				}
			} catch (_) { /* corrupt or unavailable storage — fall back to defaults */ }
		}

		// Compose onChange: persistence + optional user callback run together.
		let resolvedOpts = opts;
		if (opts.persist) {
			const persistKey = opts.persist;
			const userOnChange = typeof opts.onChange === 'function' ? opts.onChange : null;
			resolvedOpts = {
				...opts,
				onChange(key, newVal, oldVal) {
					try {
						const record = getRecord(el);
						if (record) localStorage.setItem(persistKey, JSON.stringify(record.data));
					} catch (_) { /* storage unavailable */ }
					if (userOnChange) userOnChange(key, newVal, oldVal);
				},
			};
		}

		initState(el, data, resolvedOpts);

		// Wire two-way input binding
		bindInputs(el, (key, value) => {
			setState(el, key, value, onUpdate);
		});

		// Wire declarative actions (Phase 5)
		if (opts.actions) {
			bindActions(
				el,
				opts.actions,
				() => getRecord(el)?.data ?? {},
				(key, value) => setState(el, key, value, onUpdate)
			);
		}

		// Initial DOM render pass
		const record = getRecord(el);
		if (record) {
			renderAll(el, record.data);
			// Render any list keys on init
			Object.entries(record.data).forEach(([key, value]) => {
				if (Array.isArray(value)) renderList(el, key, value);
			});
			// onInit callback
			if (typeof opts.onInit === 'function') {
				opts.onInit({ ...record.data });
			}
		}
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqGet(key?)
// Read a state value from the first matched element.
// If called with no key, returns a shallow snapshot of the full state.
// ---------------------------------------------------------------------------
$.fn.rqGet = function (key) {
	const el = this[0];
	if (!el) return undefined;
	if (key === undefined) {
		const record = getRecord(el);
		return record ? { ...record.data } : undefined;
	}
	return getState(el, key);
};

// ---------------------------------------------------------------------------
// $.fn.rqSet(key, value) | $.fn.rqSet(obj)
// Write one or more state values and trigger DOM updates. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqSet = function (key, value) {
	if (key !== null && typeof key === 'object') {
		// Batch form: rqSet({ key1: val1, key2: val2 })
		const updates = key;
		return this.each(function () {
			Object.entries(updates).forEach(([k, v]) => {
				setState(this, k, v, onUpdate);
			});
		});
	}
	return this.each(function () {
		setState(this, key, value, onUpdate);
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqMutate(key, fn)
// Update state via callback — safe for objects and arrays. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqMutate = function (key, fn) {
	return this.each(function () {
		mutateState(this, key, fn, onUpdate);
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqWatch(key, fn)
// Register a watcher: fn(newValue, oldValue) called on key change. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqWatch = function (key, fn) {
	return this.each(function () {
		addWatcher(this, key, fn);
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqComputed(key, fn)
// Register a derived value: fn(state) => value. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqComputed = function (key, fn) {
	return this.each(function () {
		addComputed(this, key, fn);
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqReset(key?)
// Reset state to its initial values. Pass a key to reset a single value,
// or call with no argument to reset all keys. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqReset = function (key) {
	return this.each(function () {
		const record = getRecord(this);
		if (!record) return;
		const el = this;
		if (key !== undefined) {
			if (Object.prototype.hasOwnProperty.call(record.initial, key)) {
				setState(el, key, record.initial[key], onUpdate);
			}
		} else {
			Object.keys(record.initial).forEach(k => {
				setState(el, k, record.initial[k], onUpdate);
			});
		}
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqDestroy()
// Remove all state and unbind reQuery event handlers from the element.
// After this, the element is as if rqState was never called. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqDestroy = function () {
	return this.each(function () {
		destroyState(this);
		$(this).off('.rq');
	});
};

export default $;
