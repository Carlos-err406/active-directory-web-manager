import { CONFIG_PATH } from '$env/static/private';
import { isTestEnvironment } from '$lib/server/utils';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { RecursiveRequired } from '@sveltejs/kit';
import merge from 'deepmerge';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import defaults from './defaults';

if (!isTestEnvironment() && !CONFIG_PATH) {
	throw Error('Missing CONFIG_PATH environment variable!');
}
let configPath = CONFIG_PATH;

if (isTestEnvironment()) {
	const testConfigPath = 'app.config.test.yaml';
	console.log(
		`Test environment detected. Overriding CONFIG_PATH configuration for '${testConfigPath}'`
	);
	configPath = testConfigPath;
}

const rawConfig = fs.readFileSync(configPath, { encoding: 'utf-8' });

const configPathExtension = path.extname(configPath);

const isYAML = ['.yml', '.yaml'].includes(configPathExtension);
const isJSON = ['.json'].includes(configPathExtension);

let Config = {};
if (isJSON) {
	Config = JSON.parse(rawConfig);
} else if (isYAML) {
	Config = YAML.parse(rawConfig);
} else {
	throw Error(`Config file must be either YAML or JSON. received: ${configPathExtension}`);
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
