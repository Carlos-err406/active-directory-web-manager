import { Filter } from './filter';
import type { SearchFilterValues } from './search-filter';
import { SearchFilter } from './search-filter';

export interface OrFilterOptions {
	filters: Filter[];
}

export class OrFilter extends Filter {
	public type: SearchFilterValues = SearchFilter.or;

	public filters: Filter[];

	public constructor(options: OrFilterOptions) {
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
			if (filter.matches(objectToCheck, strictAttributeCase)) {
				return true;
			}
		}

		return false;
	}

	public override toString(): string {
		let result = '(|';
		for (const filter of this.filters) {
			result += filter.toString();
		}

		result += ')';

		return result;
	}
}
