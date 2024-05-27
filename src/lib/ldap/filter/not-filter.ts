import { Filter } from './filter';
import type { SearchFilterValues } from './search-filter';
import { SearchFilter } from './search-filter';

export interface NotFilterOptions {
	filter: Filter;
}

export class NotFilter extends Filter {
	public type: SearchFilterValues = SearchFilter.not;

	public filter: Filter;

	public constructor(options: NotFilterOptions) {
		super();
		this.filter = options.filter;
	}

	public override matches(
		objectToCheck: Record<string, string> = {},
		strictAttributeCase?: boolean
	): boolean {
		return !this.filter.matches(objectToCheck, strictAttributeCase);
	}

	public override toString(): string {
		return `(!${this.filter.toString()})`;
	}
}
