import { page } from '$app/stores';
import { PUBLIC_BASE_DN } from '$env/static/public';
import type { TreeEntry } from '$lib/types/tree';
import { get } from 'svelte/store';

/**
 * @param pathname `/tree/cn=system/cn=policies`
 * @returns `cn=policies,cn=system,PUBLIC_BASE_DN`
 */
export const getDnFromUrl = (pathname: string) =>
	`${decodeURIComponent(pathname).split('/').slice(2).reverse().join(',')},${PUBLIC_BASE_DN}`;

export const isExpandedEntry = (entry: TreeEntry) => {
	const dn = getDnFromUrl(get(page).url.pathname);
	return dn.includes(entry.distinguishedName);
};

export const isLastExpandedEntry = (entry: TreeEntry) => {
	const dn = getDnFromUrl(get(page).url.pathname);
	return dn === entry.distinguishedName;
};
