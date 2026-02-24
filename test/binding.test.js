/**
 * Tests for Phase 2 — DOM Binding (src/core/binding.js)
 */
import { describe, it, expect } from 'vitest';
import '../src/requery.js';

describe('data-rq-text binding', () => {
	it('sets text content on init', () => {
		document.body.innerHTML = `
      <div id="root">
        <span data-rq-text="name"></span>
      </div>`;
		$('#root').rqState({ name: 'jQuery' });
		expect(document.querySelector('[data-rq-text="name"]').textContent).toBe('jQuery');
	});

	it('updates text content when state changes', () => {
		document.body.innerHTML = `
      <div id="root">
        <span data-rq-text="label"></span>
      </div>`;
		$('#root').rqState({ label: 'before' });
		$('#root').rqSet('label', 'after');
		expect(document.querySelector('[data-rq-text="label"]').textContent).toBe('after');
	});

	it('coerces numbers to string', () => {
		document.body.innerHTML = `<div id="root"><span data-rq-text="count"></span></div>`;
		$('#root').rqState({ count: 42 });
		expect(document.querySelector('[data-rq-text="count"]').textContent).toBe('42');
	});
});

describe('data-rq-html binding', () => {
	it('sets innerHTML on init', () => {
		document.body.innerHTML = `<div id="root"><div data-rq-html="content"></div></div>`;
		$('#root').rqState({ content: '<b>bold</b>' });
		expect(document.querySelector('[data-rq-html="content"]').innerHTML).toBe('<b>bold</b>');
	});

	it('updates innerHTML when state changes', () => {
		document.body.innerHTML = `<div id="root"><div data-rq-html="body"></div></div>`;
		$('#root').rqState({ body: 'old' });
		$('#root').rqSet('body', '<em>new</em>');
		expect(document.querySelector('[data-rq-html="body"]').innerHTML).toBe('<em>new</em>');
	});
});

describe('data-rq-val binding', () => {
	it('sets input value on init', () => {
		document.body.innerHTML = `<div id="root"><input data-rq-val="username" /></div>`;
		$('#root').rqState({ username: 'pete' });
		expect(document.querySelector('input').value).toBe('pete');
	});

	it('updates input value when state changes', () => {
		document.body.innerHTML = `<div id="root"><input data-rq-val="query" /></div>`;
		$('#root').rqState({ query: '' });
		$('#root').rqSet('query', 'hello');
		expect(document.querySelector('input').value).toBe('hello');
	});

	it('sets checkbox checked state', () => {
		document.body.innerHTML = `<div id="root"><input type="checkbox" data-rq-val="active" /></div>`;
		$('#root').rqState({ active: true });
		expect(document.querySelector('input[type="checkbox"]').checked).toBe(true);
	});
});

describe('data-rq-show binding', () => {
	it('hides element when value is falsy', () => {
		document.body.innerHTML = `<div id="root"><p data-rq-show="visible">hi</p></div>`;
		$('#root').rqState({ visible: false });
		expect(document.querySelector('p').style.display).toBe('none');
	});

	it('shows element when value is truthy', () => {
		document.body.innerHTML = `<div id="root"><p data-rq-show="visible">hi</p></div>`;
		$('#root').rqState({ visible: true });
		expect(document.querySelector('p').style.display).not.toBe('none');
	});

	it('toggles correctly when state changes', () => {
		document.body.innerHTML = `<div id="root"><p data-rq-show="show">hi</p></div>`;
		$('#root').rqState({ show: true });
		$('#root').rqSet('show', false);
		expect(document.querySelector('p').style.display).toBe('none');
	});
});

describe('data-rq-attr-[name] binding', () => {
	it('sets an attribute on init', () => {
		document.body.innerHTML = `<div id="root"><a data-rq-attr-href="url">link</a></div>`;
		$('#root').rqState({ url: 'https://example.com' });
		expect(document.querySelector('a').getAttribute('href')).toBe('https://example.com');
	});

	it('updates attribute when state changes', () => {
		document.body.innerHTML = `<div id="root"><img data-rq-attr-src="imgUrl" /></div>`;
		$('#root').rqState({ imgUrl: 'old.png' });
		$('#root').rqSet('imgUrl', 'new.png');
		expect(document.querySelector('img').getAttribute('src')).toBe('new.png');
	});
});

describe('data-rq-class-[name] binding', () => {
	it('adds class when value is truthy', () => {
		document.body.innerHTML = `<div id="root"><div data-rq-class-active="isActive"></div></div>`;
		$('#root').rqState({ isActive: true });
		expect(document.querySelector('[data-rq-class-active]').classList.contains('active')).toBe(true);
	});

	it('removes class when value is falsy', () => {
		document.body.innerHTML = `<div id="root"><div class="active" data-rq-class-active="isActive"></div></div>`;
		$('#root').rqState({ isActive: false });
		expect(document.querySelector('[data-rq-class-active]').classList.contains('active')).toBe(false);
	});

	it('toggles class when state changes', () => {
		document.body.innerHTML = `<div id="root"><div data-rq-class-highlight="hl"></div></div>`;
		$('#root').rqState({ hl: false });
		$('#root').rqSet('hl', true);
		expect(document.querySelector('[data-rq-class-highlight]').classList.contains('highlight')).toBe(true);
	});
});

describe('binding scope', () => {
	it('does not affect sibling elements with the same data-rq-text key', () => {
		document.body.innerHTML = `
      <div id="a"><span data-rq-text="msg"></span></div>
      <div id="b"><span data-rq-text="msg"></span></div>`;
		$('#a').rqState({ msg: 'alpha' });
		$('#b').rqState({ msg: 'beta' });
		$('#a').rqSet('msg', 'ALPHA');
		expect(document.querySelector('#a [data-rq-text="msg"]').textContent).toBe('ALPHA');
		expect(document.querySelector('#b [data-rq-text="msg"]').textContent).toBe('beta');
	});
});
