<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { TreeEntry } from '$lib/types/tree';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Eye from 'lucide-svelte/icons/eye';
	import PencilLine from 'lucide-svelte/icons/pencil-line';
	import Square from 'lucide-svelte/icons/square';
	import SquareCheck from 'lucide-svelte/icons/square-check';
	import Trash from 'lucide-svelte/icons/trash-2';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import DeleteOuDialog from './delete-ou-dialog.svelte';
	import UpdateOuDialog from './update-ou-dialog.svelte';

	export let entry: TreeEntry;
	let open = false;
	let isDeleteOuDialogOpen = false;
	let isUpdateOuDialogOpen = false;
	$: ({ updateOuForm } = $page.data);

	const onOpenEditClick = () => {
		updateOuForm.data = {
			...updateOuForm.data,
			...entry,
			dn: entry.distinguishedName
		};
		isUpdateOuDialogOpen = true;
	};
	const selectedEntries = getContext<Writable<TreeEntry[]>>('selected-entries');
	$: isSelected = $selectedEntries.includes(entry);
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative size-8 p-0">
			<span class="sr-only">Open menu</span>
			<EllipsisVertical class="size-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				class="flex flex-nowrap gap-2"
				on:click={() =>
					selectedEntries.update((entries) =>
						isSelected ? entries.filter(({ dn }) => dn !== entry.dn) : [...entries, entry]
					)}
			>
				{#if isSelected}
					<Square class="size-5" />
					Deselect
				{:else}
					<SquareCheck class="size-5" />
					Select
				{/if}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				href="/ous/{encodeURIComponent(entry.distinguishedName)}"
				class="flex flex-nowrap gap-2"
			>
				<Eye class="size-5" />
				View details
			</DropdownMenu.Item>
			<DropdownMenu.Item class="flex flex-nowrap gap-2" on:click={onOpenEditClick}>
				<PencilLine class="size-5" />
				Edit
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="!hover:text-destructive flex flex-nowrap gap-2 !text-destructive"
				on:click={() => (isDeleteOuDialogOpen = true)}
			>
				<Trash class="size-5" />
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<DeleteOuDialog dn={entry.distinguishedName} bind:open={isDeleteOuDialogOpen} on:deleted />
<UpdateOuDialog
	on:name-change
	dn={entry.distinguishedName}
	bind:open={isUpdateOuDialogOpen}
	bind:form={updateOuForm}
/>
