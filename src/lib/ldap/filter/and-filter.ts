import { Filter } from './filter';
import type { SearchFilterValues } from './search-filter';
import { SearchFilter } from './search-filter';

export interface AndFilterOptions {
	filters: Filter[];
}

export class AndFilter extends Filter {
	public type: SearchFilterValues = SearchFilter.and;

	public filters: Filter[];

	public constructor(options: AndFilterOptions) {
		super();
		this.filters = options.filters;
	}

	public override matches(
		objectToCheck: Record<string, string> = {},
		strictAttributeCase?: boolean
	): boolean {
		if (!this.filters.length) {
			// per RFC4526
			return true;
		}

		for (const filter of this.filters) {
			if (!filter.matches(objectToCheck, strictAttributeCase)) {
				return false;
			}
		}

		return true;
	}

	public override toString(): string {
		let result = '(&';
		for (const filter of this.filters) {
			result += filter.toString();
		}

		result += ')';

		return result;
	}
}
