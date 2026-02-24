// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://requery.dev',
	integrations: [
		starlight({
			title: 'reQuery',
			description: 'A jQuery 4 plugin for reactive state and declarative DOM binding.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/peterbenoit/requery' }],
			head: [
				// Author
				{ tag: 'meta', attrs: { name: 'author', content: 'Peter Benoit' } },

				// Open Graph — site-level defaults (page-level frontmatter overrides title/description)
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:site_name', content: 'reQuery' } },
				{ tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' } },

				// Twitter / X card
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' } },
				{ tag: 'meta', attrs: { name: 'twitter:creator', content: '@peterbenoit' } },
				{ tag: 'meta', attrs: { name: 'twitter:site', content: '@peterbenoit' } },

				// Color / theme
				{ tag: 'meta', attrs: { name: 'color-scheme', content: 'light dark' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#2563eb', media: '(prefers-color-scheme: light)' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#1e3a8a', media: '(prefers-color-scheme: dark)' } },

				// Humans.txt attribution
				{ tag: 'link', attrs: { rel: 'author', href: '/humans.txt' } },

				// Referrer and security hygiene
				{ tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' } },

				// Peter's scripts
				{
					tag: 'script',
					attrs: {
						src: 'https://peterbenoit.com/js/badge.js',
						'data-mode': 'tracker',
						defer: true,
					},
				},
				{
					tag: 'script',
					attrs: { src: 'https://uiguy.dev/libs/console.js' },
				},
			],
			editLink: {
				baseUrl: 'https://github.com/peterbenoit/requery/edit/main/docs/',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'State Scoping', slug: 'concepts/state-scoping' },
						{ label: 'Binding Lifecycle', slug: 'concepts/binding-lifecycle' },
						{ label: 'Reactivity Model', slug: 'concepts/reactivity-model' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{
							label: 'Plugin Methods',
							items: [
								{ label: 'rqState()', slug: 'api/rq-state' },
								{ label: 'rqGet()', slug: 'api/rq-get' },
								{ label: 'rqSet()', slug: 'api/rq-set' },
								{ label: 'rqMutate()', slug: 'api/rq-mutate' },
								{ label: 'rqWatch()', slug: 'api/rq-watch' },
								{ label: 'rqComputed()', slug: 'api/rq-computed' },
							],
						},
						{
							label: 'DOM Bindings',
							slug: 'api/dom-bindings',
						},
					],
				},
				{
					label: 'Project',
					items: [
						{ label: 'Changelog', slug: 'project/changelog' },
						{ label: 'Contributing', slug: 'project/contributing' },
					],
				},
			],
		}),
	],
});
