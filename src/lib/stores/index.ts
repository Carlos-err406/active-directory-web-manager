import { writable } from 'svelte/store';
import _ from 'lodash';
const getBreadcrumbsStore = () => {
	interface Breadcrumb {
		name: string;
		link?: string;
	}
	const { subscribe, set } = writable<Breadcrumb[]>([{ name: 'Console' }]);
	const _set = (value: Breadcrumb[]) => {
		const _value = _.uniqBy(value, 'name');
		set([{ name: 'Console' }, ..._value]);
	};

	return {
		subscribe,
		set: _set
	};
};

export const breadcrumbs = getBreadcrumbsStore();

export const globalLoader = writable(false);
