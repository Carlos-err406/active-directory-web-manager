import type { RecursiveRequired } from '@sveltejs/kit';
import merge from 'deepmerge';
import Config from './app.config.json';
import Schema from './config.schema.json';
import defaults from './defaults';
const validateConfig = async () => {
	console.log('Validating config file...');
	// Use dynamic import with require to handle CommonJS module
	const pkg = await import('json-schema-library').then((module) => module.default || module);
	const { Draft07 } = pkg;

	const validator = new Draft07(Schema);
	const errors = validator.validate(Config);

	if (errors.length) {
		errors.map(console.error);
		throw new Error('Invalid config file. See errors above.', { cause: 'Invalid config file' });
	}
	console.log('Config file is valid! Proceeding...');
};

validateConfig();

// final configuration with defaults and values from Config, this ensures all values are present
const config = merge(defaults, Config, {
	arrayMerge: (_, source) => source
});
export default config as RecursiveRequired<App.Config>;

export const LOGGING_APP_BASE = config.system.logging.basePath + '/app/';
export const LOGGING_SYSTEM_BASE = config.system.logging.basePath + '/system/';
