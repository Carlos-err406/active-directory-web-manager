import { sveltekit } from '@sveltejs/kit/vite';
import 'dotenv/config';
import type { PluginOption } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), purgeCss(), hotReloadOnConfigFileChange()],
	test: {
		include: ['tests/unit/**/*.{test,spec}.{js,ts}']
	}
});
function hotReloadOnConfigFileChange(): PluginOption {
	return {
		name: 'custom-hmr',
		enforce: 'post',

		handleHotUpdate: async ({ file, server }) => {
			if (
				file.endsWith(process.env.CONFIG_PATH!) &&
				process.env.DEV__RELOAD_ON_CONFIG_CHANGE === '1'
			) {
				console.log('reloading because config file changed...');
				await server.restart();
			}
		}
	};
}
