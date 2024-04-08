import { writable } from 'svelte/store';

const getBreadcrumbsStore = () => {
	interface Breadcrumb {
		name: string;
		link?: string;
	}
	const { subscribe, set } = writable<Breadcrumb[]>([{ name: 'Console' }]);
	const _set = (value: Breadcrumb[]) => {
		set([{ name: 'Console' }, ...value]);
	};

	return {
		subscribe,
		set: _set
	};
};

export const breadcrumbs = getBreadcrumbsStore();

export const globalLoader = writable<boolean>(false);
