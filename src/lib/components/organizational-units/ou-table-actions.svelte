<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { OrganizationalUnit } from '$lib/types/ou';
	import { getTreeUrlFromDn } from '$lib/utils';
	import EllipsisVertical from '$lucide/ellipsis-vertical.svelte';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import FolderTree from '$lucide/folder-tree.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import DeleteOuDialog from './delete-ou-dialog.svelte';
	import UpdateOuDialog from './update-ou-dialog.svelte';

	export let dn: string;
	let open = false;
	let isDeleteOuDialogOpen = false;
	let isUpdateOuDialogOpen = false;
	$: ({ updateOuForm } = $page.data);

	const onOpenEditClick = () => {
		const paginationData: OrganizationalUnit[] = $page.data.pagination.data;
		const ou = paginationData.find(({ distinguishedName }) => distinguishedName === dn);
		if (!ou) return;

		updateOuForm.data = {
			...updateOuForm.data,
			...ou,
			dn: dn
		};
		isUpdateOuDialogOpen = true;
	};
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative size-8 p-0">
			<span class="sr-only">Open menu</span>
			<svelte:component
				this={$page.url.pathname.startsWith('/tree') ? EllipsisVertical : Ellipsis}
				class="size-4"
			/>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/ous/{encodeURIComponent(dn)}" class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View details
			</DropdownMenu.Item>
			<DropdownMenu.Item href={getTreeUrlFromDn(dn)} class="flex flex-nowrap gap-2">
				<FolderTree class="size-5" />
				View in tree
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

<DeleteOuDialog {dn} on:deleted={() => invalidateAll()} bind:open={isDeleteOuDialogOpen} />
<UpdateOuDialog
	{dn}
	bind:open={isUpdateOuDialogOpen}
	bind:form={updateOuForm}
	on:name-change={() => invalidateAll()}
/>
