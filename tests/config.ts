import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { RecursiveRequired } from '@sveltejs/kit';
import merge from 'deepmerge';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import defaults from '../src/config/defaults';

if (process.env.TESTING !== '1') {
	throw Error(
		'Not in test environment!. Set the "TESTING" environment variable to 1 to use the testing config.'
	);
}
const configPath = 'app.config.test.yaml';

const rawConfig = fs.readFileSync(configPath, { encoding: 'utf-8' });

const configPathExtension = path.extname(configPath);

const isYAML = ['.yml', '.yaml'].includes(configPathExtension);
let Config = {};
if (isYAML) {
	Config = YAML.parse(rawConfig);
} else {
	Config = JSON.parse(rawConfig);
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
};

validateConfig();

//Merge json config to the default values
const config = merge(defaults, Config, {
	arrayMerge: (_, source) => source
});

export default config as RecursiveRequired<App.Config>;

export const LOGGING_APP_BASE = config.system.logging.basePath + '/app/';
export const LOGGING_SYSTEM_BASE = config.system.logging.basePath + '/system/';
