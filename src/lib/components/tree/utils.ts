import { page } from '$app/stores';
import { PUBLIC_BASE_DN } from '$env/static/public';
import type { TreeEntry } from '$lib/types/tree';
import { get } from 'svelte/store';
export const isUser = (entry: TreeEntry) => entry.objectClass.includes('organizationalPerson');
export const isOu = (entry: TreeEntry) => entry.objectClass.includes('organizationalUnit');
export const isContainer = (entry: TreeEntry) => entry.objectClass.includes('container');
export const isGroup = (entry: TreeEntry) => entry.objectClass.includes('group');
export const isComputer = (entry: TreeEntry) => entry.objectClass.includes('computer');
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
