<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import GroupTreeActions from '$lib/components/groups/group-tree-actions.svelte';
	import OuTreeActions from '$lib/components/organizational-units/ou-tree-actions.svelte';
	import UserTreeActions from '$lib/components/users/user-tree-actions.svelte';
	import { extractBase } from '$lib/ldap/utils';
	import type { NameChange } from '$lib/types';
	import type { TreeEntry } from '$lib/types/tree';
	import { getTreeUrlFromDn, isGroup, isOu, isUser } from '$lib/utils';
	import { getDnFromUrl, isExpandedEntry } from '../utils';
	import FallbackTreeActions from './fallback-tree-actions.svelte';

	export let entry: TreeEntry;

	const handleNameChange = async ({ detail }: CustomEvent<NameChange>) => {
		const urlDn = getDnFromUrl($page.url.pathname);
		const newUrlDn = urlDn.replace(detail.oldDn, detail.newDn);
		const newUrl = getTreeUrlFromDn(newUrlDn);
		await goto(`${newUrl}?${$page.url.searchParams}`, {
			invalidateAll: true,
			state: { preventScrollIntoView: true }
		});
	};

	const handleDeleted = async ({ detail }: CustomEvent<{ dn: string }>) => {
		if (isExpandedEntry(entry)) {
			const base = extractBase(detail.dn);
			const newUrl = getTreeUrlFromDn(base);
			await goto(newUrl, { invalidateAll: true, state: { preventScrollIntoView: true } });
		} else {
			await invalidateAll();
		}
	};
</script>

{#if isUser(entry)}
	<UserTreeActions {entry} on:name-change={() => invalidateAll()} on:deleted={handleDeleted} />
{:else if isGroup(entry)}
	<GroupTreeActions {entry} on:name-change={handleNameChange} on:deleted={handleDeleted} />
{:else if isOu(entry)}
	<OuTreeActions {entry} on:name-change={handleNameChange} on:deleted={handleDeleted} />
{:else}
	<FallbackTreeActions {entry} />
{/if}
