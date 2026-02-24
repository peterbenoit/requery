/**
 * Tests for Phase 1 — State Core (src/core/state.js)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import '../src/requery.js'; // registers $.fn.rq* methods

describe('rqState — initialization', () => {
	it('initializes state on an element without errors', () => {
		document.body.innerHTML = '<div id="root"></div>';
		expect(() => $('#root').rqState({ count: 0 })).not.toThrow();
	});

	it('can merge state by calling rqState again', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root').rqState({ a: 1 }).rqState({ b: 2 });
		expect($('#root').rqGet('a')).toBe(1);
		expect($('#root').rqGet('b')).toBe(2);
	});

	it('state on one element does not bleed into another', () => {
		document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
		$('#a').rqState({ count: 10 });
		$('#b').rqState({ count: 99 });
		expect($('#a').rqGet('count')).toBe(10);
		expect($('#b').rqGet('count')).toBe(99);
	});
});

describe('rqGet', () => {
	it('returns the initial value', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root').rqState({ name: 'reQuery' });
		expect($('#root').rqGet('name')).toBe('reQuery');
	});

	it('returns undefined for keys that were never set', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root').rqState({});
		expect($('#root').rqGet('missing')).toBeUndefined();
	});

	it('returns undefined when called on an element with no state', () => {
		document.body.innerHTML = '<div id="root"></div>';
		expect($('#root').rqGet('anything')).toBeUndefined();
	});
});

describe('rqSet', () => {
	it('updates the stored value', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root').rqState({ count: 0 });
		$('#root').rqSet('count', 5);
		expect($('#root').rqGet('count')).toBe(5);
	});

	it('is chainable', () => {
		document.body.innerHTML = '<div id="root"></div>';
		const $el = $('#root').rqState({ a: 0, b: 0 });
		const result = $el.rqSet('a', 1).rqSet('b', 2);
		expect(result).toBe($el);
		expect($el.rqGet('a')).toBe(1);
		expect($el.rqGet('b')).toBe(2);
	});

	it('does not trigger update when value does not change', () => {
		document.body.innerHTML = '<div id="root"></div>';
		let callCount = 0;
		$('#root').rqState({ x: 42 }).rqWatch('x', () => callCount++);
		$('#root').rqSet('x', 42); // same value
		expect(callCount).toBe(0);
	});
});

describe('rqMutate', () => {
	it('updates state via a callback', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root').rqState({ count: 3 });
		$('#root').rqMutate('count', n => n * 2);
		expect($('#root').rqGet('count')).toBe(6);
	});

	it('is chainable', () => {
		document.body.innerHTML = '<div id="root"></div>';
		const $el = $('#root').rqState({ items: [] });
		const result = $el.rqMutate('items', arr => [...arr, 'a']);
		expect(result).toBe($el);
		expect($el.rqGet('items')).toEqual(['a']);
	});

	it('safely appends to arrays', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root').rqState({ list: [1, 2] });
		$('#root').rqMutate('list', arr => [...arr, 3]);
		expect($('#root').rqGet('list')).toEqual([1, 2, 3]);
	});
});

describe('rqWatch', () => {
	it('calls watcher with new and old values on change', () => {
		document.body.innerHTML = '<div id="root"></div>';
		const calls = [];
		$('#root').rqState({ x: 0 }).rqWatch('x', (newVal, oldVal) => {
			calls.push({ newVal, oldVal });
		});
		$('#root').rqSet('x', 7);
		expect(calls).toEqual([{ newVal: 7, oldVal: 0 }]);
	});

	it('supports multiple watchers on the same key', () => {
		document.body.innerHTML = '<div id="root"></div>';
		let a = 0, b = 0;
		$('#root')
			.rqState({ flag: false })
			.rqWatch('flag', () => a++)
			.rqWatch('flag', () => b++);
		$('#root').rqSet('flag', true);
		expect(a).toBe(1);
		expect(b).toBe(1);
	});
});

describe('rqComputed', () => {
	it('returns derived value from state', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root')
			.rqState({ count: 4 })
			.rqComputed('double', data => data.count * 2);
		expect($('#root').rqGet('double')).toBe(8);
	});

	it('reflects latest state when computed is read after mutation', () => {
		document.body.innerHTML = '<div id="root"></div>';
		$('#root')
			.rqState({ price: 10, qty: 3 })
			.rqComputed('total', data => data.price * data.qty);
		$('#root').rqSet('qty', 5);
		expect($('#root').rqGet('total')).toBe(50);
	});
});
