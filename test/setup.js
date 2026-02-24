/**
 * Vitest test setup
 * Provides a jQuery instance wired to the happy-dom environment
 * so all $.fn.rq* tests run against a real DOM.
 */
import $ from 'jquery';
import { beforeEach } from 'vitest';

// Make $ available globally in tests (mirrors browser usage)
global.$ = $;

// Reset the DOM before each test
beforeEach(() => {
	document.body.innerHTML = '';
});
