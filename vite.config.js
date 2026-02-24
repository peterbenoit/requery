import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'src/requery.js',
			name: 'reQuery',
			formats: ['es', 'umd'],
			fileName: (format) => `requery.${format === 'es' ? 'esm' : format}.js`,
		},
		rollupOptions: {
			// jQuery is a peer dependency — exclude from bundle
			external: ['jquery'],
			output: {
				globals: {
					jquery: '$',
				},
			},
		},
	},
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: ['test/setup.js'],
	},
});
