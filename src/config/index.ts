import { CONFIG_PATH } from '$env/static/private';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { RecursiveRequired } from '@sveltejs/kit';
import merge from 'deepmerge';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import defaults from './defaults';

//Load json config file
if (!CONFIG_PATH) throw Error('Missing CONFIG_PATH environment variable!');
const content = fs.readFileSync(CONFIG_PATH, { encoding: 'utf-8' });

const configPathExtension = path.extname(CONFIG_PATH);

const isYAML = ['.yml', '.yaml'].includes(configPathExtension);
let Config = {};
if (isYAML) {
	Config = YAML.parse(content);
} else {
	Config = JSON.parse(content);
}

/**Resolves the json schema file, dereferencing all $refs to correctly use it for validation  */
const resolveSchema = () => {
	const schemaDir = path.resolve('src/config/schemas');
	try {
		return $RefParser.dereference(path.resolve(schemaDir, 'index.schema.json'), {
			mutateInputSchema: false
		});
	} catch (e) {
		console.log(e);
		throw new Error('Error resolving Schema');
	}
};

/**Validate config file against the json schema */
const validateConfig = async () => {
	console.log('Validating config file...');
	const schema = await resolveSchema();

	// Use dynamic import with require to handle CommonJS module
	const { Draft07 } = await import('json-schema-library').then(
		(module) => module.default || module
	);
	const validator = new Draft07(schema);
	const errors = validator.validate(Config, schema);
	if (errors.length) {
		errors.map(console.error);
		throw new Error('Invalid config file. See errors above.', { cause: 'Invalid config file' });
	}
	console.log('Config file is valid! Proceeding...');
};

validateConfig();

//Merge json config to the default values
const config = merge(defaults, Config, {
	arrayMerge: (_, source) => source
});
export default config as RecursiveRequired<App.Config>;

export const LOGGING_APP_BASE = config.system.logging.basePath + '/app/';
export const LOGGING_SYSTEM_BASE = config.system.logging.basePath + '/system/';
