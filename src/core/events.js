/**
 * reQuery — Declarative Events (Phase 5)
 *
 * Bind DOM events to named action handlers via data-rq-on-[event] attributes.
 *
 * Usage:
 *   <button data-rq-on-click="increment">+</button>
 *
 *   $('#counter').rqState({ count: 0 }, {
 *     actions: {
 *       increment(state, event, $el) {
 *         return { count: state.count + 1 };
 *       }
 *     }
 *   });
 *
 * Action functions receive (currentState, event, $rootEl) and should return
 * a partial state object with the keys to update, or nothing to skip.
 */

import $ from 'jquery';

/**
 * Wire up declarative data-rq-on-[event] handlers within a root element.
 * Called once during rqState() initialization if actions are provided.
 *
 * @param {Element} rootEl
 * @param {object} actions - Map of action name → handler function
 * @param {Function} getStateFn - Returns current state data object
 * @param {Function} setStateFn - Sets a key/value on state
 */
export function bindActions(rootEl, actions, getStateFn, setStateFn) {
	if (!actions || typeof actions !== 'object') return;

	const $root = $(rootEl);

	// Find all data-rq-on-* attributes in the subtree
	// We delegate from the root to catch dynamically added elements too
	Object.entries(actions).forEach(([actionName, handler]) => {
		if (typeof handler !== 'function') return;

		// Scan for any event types that reference this action
		scanForAction($root, actionName, handler, getStateFn, setStateFn);
	});
}

/**
 * Scan the root for any data-rq-on-[event]="actionName" attributes
 * and delegate those events from the root element.
 *
 * @param {jQuery} $root
 * @param {string} actionName
 * @param {Function} handler
 * @param {Function} getStateFn
 * @param {Function} setStateFn
 */
function scanForAction($root, actionName, handler, getStateFn, setStateFn) {
	// We need to discover which event types reference this action.
	// Walk the DOM once to find data-rq-on-* attributes.
	$root.find('*').add($root).each(function () {
		const attrs = this.attributes;
		for (let i = 0; i < attrs.length; i++) {
			const attrName = attrs[i].name;
			const attrValue = attrs[i].value;

			if (!attrName.startsWith('data-rq-on-') || attrValue !== actionName) continue;

			const eventType = attrName.slice('data-rq-on-'.length);
			const selector = `[data-rq-on-${eventType}="${actionName}"]`;

			// Delegate from root (once per event type + action combination)
			$root.on(eventType + '.rq', selector, function (e) {
				const currentData = getStateFn();
				const updates = handler(currentData, e, $root);
				if (updates && typeof updates === 'object') {
					Object.entries(updates).forEach(([key, value]) => {
						setStateFn(key, value);
					});
				}
			});

			break; // Only bind once per element per action
		}
	});
}
