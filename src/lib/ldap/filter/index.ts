import { UrlSearchFilter } from './search-filter';

export { AndFilter, type AndFilterOptions } from './and-filter';
export { EqualityFilter, type EqualityFilterOptions } from './equality-filter';
export { NotFilter, type NotFilterOptions } from './not-filter';
export { OrFilter, type OrFilterOptions } from './or-filter';
export { SubstringFilter, type SubstringFilterOptions } from './substring-filter';

export const urlFilterToLdapFilter = (filter: string) => {
	Object.entries(UrlSearchFilter).forEach(([operator, equivalent]) => {
		filter = filter.replaceAll(equivalent, operator);
	});
	return filter;
};

export const ldapFilterToUrlFilter = (filter: string) => {
	Object.entries(UrlSearchFilter).forEach(([operator, equivalent]) => {
		filter = filter.replaceAll(operator, equivalent);
	});
	return filter;
};
