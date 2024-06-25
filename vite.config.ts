import { sveltekit } from '@sveltejs/kit/vite';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

export default defineConfig({
	plugins: [sveltekit(), purgeCss(), hotReloadOnConfigFileChange()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
function hotReloadOnConfigFileChange(): PluginOption {
	const configFileRegex = new RegExp(/^.*(app\.config(.*).json)$/);
	return {
		name: 'custom-hmr',
		enforce: 'post',
		handleHotUpdate({ file, server }) {
			if (configFileRegex.test(file)) {
				console.log('reloading because config file changed...');
				server.ws.send({
					type: 'full-reload',
					path: '*'
				});
			}
		}
	};
}
