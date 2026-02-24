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
