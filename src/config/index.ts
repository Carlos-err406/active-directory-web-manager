import jsonSchema from 'json-schema-library';
import config from './app.config.json';
import schema from './app.config.schema.json';

try {
	const mySchema: jsonSchema.Draft = new jsonSchema.Draft07(schema);
	const errors = mySchema.validate(config);
	if (errors.length) {
		errors.map(console.error);
		throw new Error('Invalid Config file');
	}
} catch (e) {
	throw new Error(`${e}`);
}

export default config as App.Config;
