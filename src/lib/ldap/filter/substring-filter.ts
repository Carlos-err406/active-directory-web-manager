import type { SearchFilterValues } from './search-filter';
import { SearchFilter } from './search-filter';

import { Filter } from './filter';

export interface SubstringFilterOptions {
	attribute?: string;
	initial?: string;
	any?: string[];
	final?: string;
}

export class SubstringFilter extends Filter {
	public type: SearchFilterValues = SearchFilter.substrings;

	public attribute: string;

	public initial: string;

	public any: string[];

	public final: string;

	public constructor(options: SubstringFilterOptions = {}) {
		super();
		this.attribute = options.attribute ?? '';
		this.initial = options.initial ?? '';
		this.any = options.any ?? [];
		this.final = options.final ?? '';
	}

	public override matches(
		objectToCheck: Record<string, string> = {},
		strictAttributeCase?: boolean
	): boolean {
		const objectToCheckValue = this.getObjectValue(
			objectToCheck,
			this.attribute,
			strictAttributeCase
		);

		if (typeof objectToCheckValue !== 'undefined') {
			let regexp = '';
			if (this.initial) {
				regexp += `^${SubstringFilter._escapeRegExp(this.initial)}.*`;
			}

			for (const anyItem of this.any) {
				regexp += `${SubstringFilter._escapeRegExp(anyItem)}.*`;
			}

			if (this.final) {
				regexp += `${SubstringFilter._escapeRegExp(this.final)}$`;
			}

			const matcher = new RegExp(regexp, strictAttributeCase ? 'gmu' : 'igmu');
			return matcher.test(objectToCheckValue);
		}

		return false;
	}

	public override toString(): string {
		let result = `(${this.escape(this.attribute)}=${this.escape(this.initial)}*`;

		for (const anyItem of this.any) {
			result += `${this.escape(anyItem)}*`;
		}

		result += `${this.escape(this.final)})`;

		return result;
	}

	private static _escapeRegExp(str: string): string {
		return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
	}
}
