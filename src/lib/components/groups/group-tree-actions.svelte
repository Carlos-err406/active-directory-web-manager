<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getGroupTypes } from '$lib/ldap/utils';
	import { GroupFlags } from '$lib/types/group';
	import type { TreeEntry } from '$lib/types/tree';
	import EllipsisVertical from '$lucide/ellipsis-vertical.svelte';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
	import DeleteGroupDialog from './delete-group-dialog.svelte';
	import ManageGroupMembersDialog from './manage-group-members-dialog.svelte';
	import UpdateGroupDialog from './update-group-dialog.svelte';

	export let entry: TreeEntry;
	let open = false;
	let isDeleteGroupDialogOpen = false;
	let isUpdateGroupDialogOpen = false;
	let isManageMembersDialogOpen = false;
	$: ({ updateGroupForm } = $page.data);

	const onOpenEditClick = () => {
		const [match] = getGroupTypes(entry.groupType).filter(
			(gt) => gt !== GroupFlags['Global Scope']
		);
		updateGroupForm.data = {
			...updateGroupForm.data,
			...entry,
			groupType: match,
			dn: entry.distinguishedName
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
			<DropdownMenu.Item
				href="/groups/{encodeURIComponent(entry.distinguishedName)}"
				class="flex flex-nowrap gap-2"
			>
				<Eye class="size-5" />
				View group details
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

<DeleteGroupDialog dn={entry.distinguishedName} bind:open={isDeleteGroupDialogOpen} on:deleted />
<ManageGroupMembersDialog dn={entry.distinguishedName} bind:open={isManageMembersDialogOpen} />
<UpdateGroupDialog
	dn={entry.distinguishedName}
	bind:open={isUpdateGroupDialogOpen}
	bind:form={updateGroupForm}
	on:name-change
/>
