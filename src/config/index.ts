import { CONFIG_PATH } from '$env/static/private';
import type { RecursiveRequired } from '@sveltejs/kit';
import merge from 'deepmerge';
import fs from 'fs';
import defaults from './defaults';
import Schema from './schemas/index.schema.json';

const getJSONConfig = () => {
	if (!CONFIG_PATH) throw Error('Missing CONFIG_PATH enviroment varable!');
	const content = fs.readFileSync(CONFIG_PATH, { encoding: 'utf-8' });
	const config = JSON.parse(content);
	return config;
};

const validateConfig = async () => {
	console.log('Validating config file...');
	// Use dynamic import with require to handle CommonJS module
	const pkg = await import('json-schema-library').then((module) => module.default || module);
	const { Draft07 } = pkg;

	const validator = new Draft07(Schema);
	const Config = getJSONConfig();
	const errors = validator.validate(Config);

	if (errors.length) {
		errors.map(console.error);
		throw new Error('Invalid config file. See errors above.', { cause: 'Invalid config file' });
	}
	console.log('Config file is valid! Proceeding...');
};

validateConfig();

// final configuration with defaults and values from Config, this ensures all values are present
const config = merge(defaults, getJSONConfig(), {
	arrayMerge: (_, source) => source
});
export default config as RecursiveRequired<App.Config>;

export const LOGGING_APP_BASE = config.system.logging.basePath + '/app/';
export const LOGGING_SYSTEM_BASE = config.system.logging.basePath + '/system/';
