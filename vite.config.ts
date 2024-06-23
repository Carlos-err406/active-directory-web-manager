import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import config from './src/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: [config.system.logging.basePath]
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
