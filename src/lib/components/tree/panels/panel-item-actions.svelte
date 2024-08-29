<script lang="ts">
	import GroupTableActions from '$lib/components/groups/group-table-actions.svelte';
	import UserTableActions from '$lib/components/users/user-table-actions.svelte';
	import type { TreeEntry } from '$lib/types/tree';
	import { getContext } from 'svelte';
	import { isGroup, isOu, isUser } from '../utils';

	const entry = getContext<TreeEntry>('tree-entry');
	const menu = isGroup(entry)
		? GroupTableActions
		: isUser(entry)
			? UserTableActions
			: isOu(entry)
				? null
				: null;
</script>

<svelte:component this={menu} id={entry.distinguishedName} />
