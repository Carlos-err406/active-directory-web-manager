<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { CreateGroupDialog } from '$lib/components/groups';
	import { CreateOuDialog } from '$lib/components/organizational-units';
	import { CreateUserDialog } from '$lib/components/users';
	import { getCNFromDN } from '$lib/ldap/utils';
	import type { TreeEntry } from '$lib/types/tree';
	import { cn, type EntryWithObjectClass } from '$lib/utils';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { Button } from '../../ui/button';
	import CreateEntryDialog from './create-entry-dialog.svelte';
	import PanelItem from './panel-item.svelte';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import { invalidateAll } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { toastError } from '$/lib';
	export let entries: TreeEntry[] = [];
	export let base: EntryWithObjectClass;
	let createUserDialogOpen = false;
	let createGroupDialogOpen = false;
	let createOuDialogOpen = false;
	const copiedEntries = getContext<Writable<TreeEntry[]>>('copied-entries');
	const selectedEntries = getContext<Writable<TreeEntry[]>>('selected-entries');

	const handleCreateUser = () => {
		createUserDialogOpen = true;
	};
	const handleCreateGroup = () => {
		createGroupDialogOpen = true;
	};
	const handleCreateOu = () => {
		createOuDialogOpen = true;
	};

	let toastId: string | number = NaN;
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
		{#if $copiedEntries.length}
			{@const disableForThisPanel = $copiedEntries.some((entry) => base.dn.endsWith(entry.dn))}
			<div transition:slide={{ axis: 'x' }}>
				<form
					title={disableForThisPanel ? "Can't move entries to be a child of themselves" : ''}
					novalidate
					method="post"
					action="/tree?/move"
					use:enhance={() => {
						const to = base.dn === PUBLIC_BASE_DN ? 'Root' : getCNFromDN(base.dn);
						toastId = toast.loading(`Moving entries to ${to}`);
						return ({ result }) => {
							switch (result.type) {
								case 'success':
									toast.success(`Successfully moved entries to ${to}`, { id: toastId });
									invalidateAll();
									break;
								case 'error':
									toastError(result.error, toastId);
									break;
							}
							$copiedEntries = [];
							$selectedEntries = [];
						};
					}}
				>
					<input type="text" name="base" value={base.dn} hidden />
					{#each $copiedEntries as { dn }}
						<input type="text" name="dns" hidden value={dn} />
					{/each}
					<Button disabled={disableForThisPanel} type="submit">Move entries here</Button>
				</form>
			</div>
		{:else}
			<div transition:slide={{ axis: 'x' }}>
				<CreateEntryDialog
					{base}
					on:create-user={handleCreateUser}
					on:create-group={handleCreateGroup}
					on:create-ou={handleCreateOu}
				/>
			</div>
		{/if}
	</div>
	<slot>
		{#each entries as entry (entry.dn)}
			<div class="w-full" animate:flip={{ duration: 200 }}>
				<PanelItem {entry} />
			</div>
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

<CreateUserDialog bind:open={createUserDialogOpen} base={base.dn} />
<CreateGroupDialog bind:open={createGroupDialogOpen} base={base.dn} on:created={() => {}} />
<CreateOuDialog bind:open={createOuDialogOpen} base={base.dn} />
