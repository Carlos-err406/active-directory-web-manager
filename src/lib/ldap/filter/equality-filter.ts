import { Filter } from './filter';
import type { SearchFilterValues } from './search-filter';
import { SearchFilter } from './search-filter';

export interface EqualityFilterOptions {
	attribute?: string;
	value?: string;
}

export class EqualityFilter extends Filter {
	public type: SearchFilterValues = SearchFilter.equalityMatch;

	public attribute: string;

	public value: string;

	public constructor(options: EqualityFilterOptions = {}) {
		super();

		this.attribute = options.attribute ?? '';
		this.value = options.value ?? '';
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
			const stringValue = this.value;
			if (strictAttributeCase) {
				return stringValue === objectToCheckValue;
			}
			return stringValue.toLowerCase() === objectToCheckValue.toLowerCase();
		}
		return false;
	}

	public override toString(): string {
		return `(${this.escape(this.attribute)}=${this.escape(this.value)})`;
	}
}
