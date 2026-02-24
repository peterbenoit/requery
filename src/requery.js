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
import { initState, getState, setState, mutateState, addWatcher, addComputed, getRecord } from './core/state.js';
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
		initState(this, initialData, opts);

		const el = this;

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
		}
	});
};

// ---------------------------------------------------------------------------
// $.fn.rqGet(key)
// Read a state value from the first matched element.
// ---------------------------------------------------------------------------
$.fn.rqGet = function (key) {
	const el = this[0];
	if (!el) return undefined;
	return getState(el, key);
};

// ---------------------------------------------------------------------------
// $.fn.rqSet(key, value)
// Write a state value and trigger DOM updates. Chainable.
// ---------------------------------------------------------------------------
$.fn.rqSet = function (key, value) {
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

export default $;
