<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import GroupTreeActions from '$lib/components/groups/group-tree-actions.svelte';
	import OuTreeActions from '$lib/components/organizational-units/ou-tree-actions.svelte';
	import UserTreeActions from '$lib/components/users/user-tree-actions.svelte';
	import type { NameChange } from '$lib/types';
	import type { TreeEntry } from '$lib/types/tree';
	import { isGroup, isOu, isUser } from '$lib/utils';
	import { getDnFromUrl } from '../utils';

	export let entry: TreeEntry;

	const handleNameChange = async ({ detail }: CustomEvent<NameChange>) => {
		const urlDn = getDnFromUrl($page.url.pathname);
		console.log({ urlDn, ...detail });
		const newUrlDn = urlDn.replace(detail.oldDn, detail.newDn);
		const newUrl = newUrlDn.split(',').reverse().slice(2).map(encodeURIComponent).join('/');
		console.log({ newUrlDn, newUrl });
		await goto(`/tree/${newUrl}?${$page.url.searchParams}`, {
			invalidateAll: true,
			state: { preventScrollIntoView: true }
		});
	};
</script>

{#if isUser(entry)}
	<UserTreeActions {entry} on:name-change={() => invalidateAll()} />
{:else if isGroup(entry)}
	<GroupTreeActions {entry} on:name-change={handleNameChange} />
{:else if isOu(entry)}
	<OuTreeActions {entry} on:name-change={handleNameChange} />
{/if}
