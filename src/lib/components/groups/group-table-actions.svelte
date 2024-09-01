<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getGroupTypes } from '$lib/ldap/utils';
	import { GroupFlags, type Group } from '$lib/types/group';
	import { getTreeUrlFromDn } from '$lib/utils';
	import EllipsisVertical from '$lucide/ellipsis-vertical.svelte';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import FolderTree from '$lucide/folder-tree.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
	import DeleteGroupDialog from './delete-group-dialog.svelte';
	import ManageGroupMembersDialog from './manage-group-members-dialog.svelte';
	import UpdateGroupDialog from './update-group-dialog.svelte';

	export let dn: string;
	let open = false;
	let isDeleteGroupDialogOpen = false;
	let isUpdateGroupDialogOpen = false;
	let isManageMembersDialogOpen = false;
	$: ({ updateGroupForm } = $page.data);

	const onOpenEditClick = () => {
		const paginationData: Group[] = $page.data.pagination.data;
		const group = paginationData.find(({ distinguishedName }) => distinguishedName === dn);
		if (!group) return;
		const [match] = getGroupTypes(group.groupType).filter(
			(gt) => gt !== GroupFlags['Global Scope']
		);
		updateGroupForm.data = {
			...updateGroupForm.data,
			...group,
			groupType: match,
			dn: dn
		};
		isUpdateGroupDialogOpen = true;
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
			<DropdownMenu.Item href="/groups/{encodeURIComponent(dn)}" class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View group details
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
				class="flex flex-nowrap gap-2"
				on:click={() => (isManageMembersDialogOpen = true)}
			>
				<Users class="size-5" />
				Manage members
			</DropdownMenu.Item>
			<DropdownMenu.Item
				class="!hover:text-destructive flex flex-nowrap gap-2 !text-destructive"
				on:click={() => (isDeleteGroupDialogOpen = true)}
			>
				<Trash class="size-5" />
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<DeleteGroupDialog
	{dn}
	bind:open={isDeleteGroupDialogOpen}
	on:deleted={() => invalidate('protected:groups')}
/>
<ManageGroupMembersDialog {dn} bind:open={isManageMembersDialogOpen} />
<UpdateGroupDialog
	{dn}
	bind:open={isUpdateGroupDialogOpen}
	bind:form={updateGroupForm}
	on:name-change={() => invalidate('protected:groups')}
/>
