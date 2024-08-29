import { sveltekit } from '@sveltejs/kit/vite';
import type { PluginOption } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), purgeCss(), hotReloadOnConfigFileChange()],
	test: {
		env: {
			NODE_ENV: 'test'
		},
		include: ['tests/unit/**/*.{test,spec}.{js,ts}']
	}
});
function hotReloadOnConfigFileChange(): PluginOption {
	const configFileRegex = new RegExp(/^.*(app\.config(.*).(yaml|yml|json))$/);
	return {
		name: 'custom-hmr',
		enforce: 'post',

		handleHotUpdate: async ({ file, server }) => {
			if (configFileRegex.test(file)) {
				console.log('reloading because config file changed...');
				await server.restart();
			}
		}
	};
}
