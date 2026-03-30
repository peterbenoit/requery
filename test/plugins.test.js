/**
 * Tests for the plugin API — $.reQuery.use()
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../src/requery.js'; // registers $.fn.rq* methods and $.reQuery

describe('$.reQuery.use — registration', () => {
	it('$.reQuery.use exists', () => {
		expect(typeof $.reQuery).toBe('object');
		expect(typeof $.reQuery.use).toBe('function');
	});

	it('calls the plugin function immediately', () => {
		const spy = vi.fn();
		$.reQuery.use(spy);
		expect(spy).toHaveBeenCalledOnce();
	});

	it('warns and does not throw when passed a non-function', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(() => $.reQuery.use('not a function')).not.toThrow();
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it('passes $ in the context', () => {
		let received;
		$.reQuery.use(ctx => { received = ctx.$; });
		expect(received).toBe($);
	});

	it('passes getRecord in the context', () => {
		let received;
		$.reQuery.use(ctx => { received = ctx.getRecord; });
		expect(typeof received).toBe('function');
	});

	it('passes setState in the context', () => {
		let received;
		$.reQuery.use(ctx => { received = ctx.setState; });
		expect(typeof received).toBe('function');
	});

	it('passes mutateState in the context', () => {
		let received;
		$.reQuery.use(ctx => { received = ctx.mutateState; });
		expect(typeof received).toBe('function');
	});

	it('passes addWatcher in the context', () => {
		let received;
		$.reQuery.use(ctx => { received = ctx.addWatcher; });
		expect(typeof received).toBe('function');
	});

	it('passes addComputed in the context', () => {
		let received;
		$.reQuery.use(ctx => { received = ctx.addComputed; });
		expect(typeof received).toBe('function');
	});
});

describe('$.reQuery.use — plugin can read and write state', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="root"></div>';
	});

	it('plugin can read state via getRecord', () => {
		$('#root').rqState({ score: 42 });
		let record;
		$.reQuery.use(({ getRecord }) => {
			record = getRecord(document.getElementById('root'));
		});
		expect(record).not.toBeNull();
		expect(record.data.score).toBe(42);
	});

	it('plugin can write state via setState and trigger DOM update', () => {
		document.body.innerHTML = '<div id="root"><span data-rq-text="score"></span></div>';
		$('#root').rqState({ score: 0 });

		$.reQuery.use(({ setState }) => {
			setState(document.getElementById('root'), 'score', 99);
		});

		expect($('#root').rqGet('score')).toBe(99);
		expect($('#root span').text()).toBe('99');
	});

	it('plugin can mutate state via mutateState', () => {
		$('#root').rqState({ count: 5 });

		$.reQuery.use(({ mutateState }) => {
			mutateState(document.getElementById('root'), 'count', v => v + 10);
		});

		expect($('#root').rqGet('count')).toBe(15);
	});

	it('plugin can register a watcher via addWatcher', () => {
		$('#root').rqState({ x: 0 });
		const spy = vi.fn();

		$.reQuery.use(({ addWatcher }) => {
			addWatcher(document.getElementById('root'), 'x', spy);
		});

		$('#root').rqSet('x', 7);
		expect(spy).toHaveBeenCalledWith(7, 0);
	});

	it('plugin can register a computed via addComputed', () => {
		$('#root').rqState({ a: 3, b: 4 });

		$.reQuery.use(({ addComputed }) => {
			addComputed(document.getElementById('root'), 'sum', state => state.a + state.b);
		});

		expect($('#root').rqGet('sum')).toBe(7);
	});
});

describe('$.reQuery.use — plugin can extend $.fn', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="root"></div>';
	});

	it('plugin can add a new $.fn method', () => {
		$.reQuery.use(({ $, getRecord }) => {
			$.fn.rqTestPlugin = function () {
				return this.each(function () {
					const rec = getRecord(this);
					if (rec) rec.data.__pluginTouched = true;
				});
			};
		});

		$('#root').rqState({ value: 1 }).rqTestPlugin();
		const el = document.getElementById('root');
		$.reQuery.use(({ getRecord }) => {
			expect(getRecord(el).data.__pluginTouched).toBe(true);
		});

		// Cleanup: remove the test method
		delete $.fn.rqTestPlugin;
	});

	it('plugin method is chainable when it returns this', () => {
		$.reQuery.use(({ $ }) => {
			$.fn.rqChainTest = function () { return this; };
		});

		const result = $('#root').rqState({ x: 0 }).rqChainTest().rqSet('x', 5);
		expect($('#root').rqGet('x')).toBe(5);

		delete $.fn.rqChainTest;
	});
});
