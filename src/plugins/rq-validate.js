/**
 * rq-validate — Form Validation Plugin for reQuery
 *
 * Adds two methods to $.fn:
 *
 *   $.fn.rqValidate(rules, opts?)
 *     Attach validation rules to a reQuery-managed element. Rules are
 *     functions keyed by state key name. Each rule receives the current
 *     value and returns an error string, or null/undefined when valid.
 *
 *     Options:
 *       validateOn  — when to run validation: 'change' (default) | 'submit' | 'blur'
 *       onValid     — callback fired when all fields become valid
 *       onInvalid   — callback fired when any field has an error
 *
 *     Errors are stored under the '_errors' state key as a plain object.
 *     Use data-rq-text="_errors.fieldName" or rqGet('_errors') to read them.
 *     (Note: because _errors is an object you'll typically read it in
 *     a watcher or via rqGet rather than directly in data-rq-text.)
 *
 *   $.fn.rqIsValid()
 *     Returns true if all validated fields are currently error-free.
 *     Returns false if any field has an error or validation hasn't run yet.
 *     Not chainable — returns a boolean.
 *
 * Usage:
 *   $('#form')
 *     .rqState({ name: '', email: '' })
 *     .rqValidate({
 *       name:  val => val.trim().length < 2 ? 'Name must be at least 2 characters' : null,
 *       email: val => !val.includes('@') ? 'Enter a valid email address' : null,
 *     });
 *
 *   // Check before submitting:
 *   if ($('#form').rqIsValid()) { ... }
 *
 * How to load:
 *   <!-- Script tag (after jQuery and reQuery) -->
 *   <script src="rq-validate.js"></script>
 *
 *   // ESM import:
 *   import 'requery/src/plugins/rq-validate.js';
 *
 * This file is a reference implementation — copy it as a starting point
 * for your own plugins.
 */

/* global $, jQuery */

// Support both script-tag usage ($.reQuery on window.$) and ESM import.
// In ESM, requery.js exports the $ instance; in script-tag usage it sets
// window.$.reQuery when the UMD bundle runs.
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS / ESM via bundler — caller must pass $ explicitly
		module.exports = factory;
	} else {
		// Script-tag: register immediately against window.$
		factory(window.$);
	}
}(function registerPlugin($) {
	if (!$ || !$.reQuery || typeof $.reQuery.use !== 'function') {
		console.error('rq-validate: reQuery must be loaded before this plugin.');
		return;
	}

	$.reQuery.use(function ({ $, getRecord, setState, addWatcher }) {

		// ------------------------------------------------------------------
		// Internal helpers
		// ------------------------------------------------------------------

		/**
		 * Run all rules against current state and return an errors object.
		 * Values are error strings; null means the field passed.
		 *
		 * @param {object} data  - current state
		 * @param {object} rules - { [key]: (value) => string|null }
		 * @returns {object}     - { [key]: string|null }
		 */
		function runRules(data, rules) {
			const errors = {};
			Object.keys(rules).forEach(function (key) {
				const result = rules[key](data[key], data);
				errors[key] = result || null;
			});
			return errors;
		}

		/**
		 * Return true if every key in the errors object is null.
		 *
		 * @param {object} errors
		 * @returns {boolean}
		 */
		function allValid(errors) {
			return Object.values(errors).every(function (v) { return v === null; });
		}

		// ------------------------------------------------------------------
		// $.fn.rqValidate(rules, opts?)
		// ------------------------------------------------------------------

		/**
		 * Attach validation rules to a reQuery-managed element.
		 *
		 * @param {object} rules - { [stateKey]: (value, allState) => string|null }
		 * @param {object} [opts]
		 * @param {string} [opts.validateOn='change'] - 'change' | 'blur' | 'submit'
		 * @param {Function} [opts.onValid]  - called when all fields are valid
		 * @param {Function} [opts.onInvalid] - called when any field is invalid
		 * @returns {jQuery} this — chainable
		 */
		$.fn.rqValidate = function (rules, opts) {
			opts = opts || {};
			const validateOn = opts.validateOn || 'change';

			return this.each(function () {
				const el = this;
				const record = getRecord(el);

				if (!record) {
					console.warn('rqValidate: called on element with no rqState.', el);
					return;
				}

				// Inject _errors into state so bindings can read it.
				// Initialize with nulls (no errors yet).
				const initialErrors = {};
				Object.keys(rules).forEach(function (k) { initialErrors[k] = null; });
				setState(el, '_errors', initialErrors);

				// Store rules on the record so rqIsValid can find them later.
				record._validateRules = rules;
				record._validateOpts = opts;

				function validate() {
					const errors = runRules(record.data, rules);

					// Only write back if something actually changed — avoids infinite loops.
					const current = record.data['_errors'] || {};
					const changed = Object.keys(errors).some(function (k) {
						return errors[k] !== current[k];
					});

					if (changed) {
						setState(el, '_errors', errors);
					}

					if (allValid(errors)) {
						if (typeof opts.onValid === 'function') opts.onValid(record.data);
					} else {
						if (typeof opts.onInvalid === 'function') opts.onInvalid(errors, record.data);
					}
				}

				if (validateOn === 'change') {
					// Watch every rule key — validate whenever any of them changes.
					Object.keys(rules).forEach(function (key) {
						addWatcher(el, key, validate);
					});
				} else if (validateOn === 'blur') {
					// Validate when a data-rq-val input for any rule key loses focus.
					$(el).on('blur.rqvalidate', '[data-rq-val]', function () {
						const key = this.getAttribute('data-rq-val');
						if (rules[key]) validate();
					});
				} else if (validateOn === 'submit') {
					// Validate when a form inside the root element is submitted.
					// The submit handler fires validate() and can be used to block
					// the default submit via onInvalid.
					$(el).on('submit.rqvalidate', 'form', function (e) {
						validate();
						if (!allValid(record.data['_errors'] || {})) {
							e.preventDefault();
						}
					});
					// Also validate the whole element itself if it IS the form.
					$(el).filter('form').on('submit.rqvalidate', function (e) {
						validate();
						if (!allValid(record.data['_errors'] || {})) {
							e.preventDefault();
						}
					});
				}
			});
		};

		// ------------------------------------------------------------------
		// $.fn.rqIsValid()
		// ------------------------------------------------------------------

		/**
		 * Returns true if all validated fields are currently error-free.
		 * Checks the '_errors' key written by rqValidate.
		 *
		 * @returns {boolean}
		 */
		$.fn.rqIsValid = function () {
			const el = this[0];
			if (!el) return false;
			const record = getRecord(el);
			if (!record) return false;
			const errors = record.data['_errors'];
			if (!errors) return false; // rqValidate hasn't been called
			return allValid(errors);
		};

	}); // end $.reQuery.use
})); // end UMD wrapper
