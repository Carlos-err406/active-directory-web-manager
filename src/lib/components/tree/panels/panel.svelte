<script lang="ts">
	import { page } from '$app/stores';
	import { CreateGroupDialog } from '$lib/components/groups';
	import { CreateOuDialog } from '$lib/components/organizational-units';
	import { CreateUserDialog } from '$lib/components/users';
	import type { TreeEntry } from '$lib/types/tree';
	import { cn } from '$lib/utils';
	import CreateEntryDialog from './create-entry-dialog.svelte';
	import PanelItem from './panel-item.svelte';
	export let entries: TreeEntry[] = [];
	export let base: {
		objectClass: string[];
		distinguishedName: string;
		dn: string;
	};
	let createUserDialogOpen = false;
	let createGroupDialogOpen = false;
	let createOuDialogOpen = false;

	const handleCreateUser = () => {
		createUserDialogOpen = true;
	};
	const handleCreateGroup = () => {
		createGroupDialogOpen = true;
	};
	const handleCreateOu = () => {
		createOuDialogOpen = true;
	};
</script>

<div
	class={cn(
		'relative flex flex-col items-center gap-2 px-2 pb-2',
		'transition-all duration-200',
		'overflow-y-auto overflow-x-hidden',
		'border-r-2 border-muted-foreground',
		'h-full max-h-[calc(100svh-87px)] w-full min-w-[23rem]'
	)}
>
	<div class="sticky top-0 z-10 flex w-full justify-end py-2">
		<CreateEntryDialog
			on:create-user={handleCreateUser}
			on:create-group={handleCreateGroup}
			on:create-ou={handleCreateOu}
		/>
	</div>
	<slot>
		{#each entries as entry (entry.dn)}
			<PanelItem {entry} />
		{:else}
			<div class="flex h-full items-center">
				<p class="text-center text-xl font-light">
					{#if $page.url.searchParams.get('q')}
						No entries match your search query: "{$page.url.searchParams.get('q')}"
					{:else}
						Empty
					{/if}
				</p>
			</div>
		{/each}
	</slot>
</div>

<CreateUserDialog bind:open={createUserDialogOpen} base={base.distinguishedName} />
<CreateGroupDialog bind:open={createGroupDialogOpen} base={base.distinguishedName} />
<CreateOuDialog bind:open={createOuDialogOpen} base={base.distinguishedName} />
