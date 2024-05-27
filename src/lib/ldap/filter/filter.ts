import type { SearchFilterValues } from './search-filter';

export abstract class Filter {
	public abstract type: SearchFilterValues;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public matches(_: Record<string, string> = {}, __?: boolean): boolean {
		return true;
	}

	/**
	 * RFC 2254 Escaping of filter strings
	 * Raw                     Escaped
	 * (o=Parens (R Us))       (o=Parens \28R Us\29)
	 * (cn=star*)              (cn=star\2A)
	 * (filename=C:\MyFile)    (filename=C:\5cMyFile)
	 *
	 * @param {string|Buffer} input
	 */
	public escape(input: string): string {
		let escapedResult = '';

		for (const inputChar of input) {
			switch (inputChar) {
				case '*':
					escapedResult += '\\2a';
					break;
				case '(':
					escapedResult += '\\28';
					break;
				case ')':
					escapedResult += '\\29';
					break;
				case '\\':
					escapedResult += '\\5c';
					break;
				case '\0':
					escapedResult += '\\00';
					break;
				default:
					escapedResult += inputChar;
					break;
			}
		}
		return escapedResult;
	}

	public abstract toString(): string;

	protected getObjectValue(
		objectToCheck: Record<string, string>,
		key: string,
		strictAttributeCase?: boolean
	): string | undefined {
		let objectKey;
		if (typeof objectToCheck[key] !== 'undefined') {
			objectKey = key;
		} else if (!strictAttributeCase && key.toLowerCase() === 'objectclass') {
			for (const objectToCheckKey of Object.keys(objectToCheck)) {
				if (objectToCheckKey.toLowerCase() === key.toLowerCase()) {
					objectKey = objectToCheckKey;
					break;
				}
			}
		}

		if (objectKey) {
			return objectToCheck[objectKey];
		}

		return undefined;
	}
}
