<script lang="ts">
	import { getUserAccountControlMatches } from '$/lib/ldap/utils';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { TreeEntry } from '$lib/types/tree';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Eye from 'lucide-svelte/icons/eye';
	import LockKeyholeOpen from 'lucide-svelte/icons/lock-keyhole-open';
	import PencilLine from 'lucide-svelte/icons/pencil-line';
	import Square from 'lucide-svelte/icons/square';
	import SquareCheck from 'lucide-svelte/icons/square-check';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Users from 'lucide-svelte/icons/users';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import ChangePasswordDialog from './change-password-dialog.svelte';
	import DeleteUserDialog from './delete-user-dialog.svelte';
	import ManageUserMembershipDialog from './manage-user-membership-dialog.svelte';
	import UpdateUserDialog from './update-user-dialog.svelte';
	export let entry: TreeEntry;
	let open = false;
	let isChangePasswordDialogOpen = false;
	let isDeleteUserDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	let isManageMembershipDialogOpen = false;
	$: ({ updateUserForm } = $page.data);
	const onOpenEditClick = () => {
		const uacMatches = entry.userAccountControl
			? getUserAccountControlMatches(entry.userAccountControl)
			: [];

		updateUserForm.data = {
			...updateUserForm.data,
			...entry,
			dn: entry.distinguishedName,
			jpegPhotoBase64: entry?.jpegPhoto,
			...uacMatches.reduce((acc, match) => ({ ...acc, [`uac.${match}`]: true }), {})
		};
		isUpdateUserDialogOpen = true;
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
				href="/users/{encodeURIComponent(entry.distinguishedName)}"
				class="flex flex-nowrap gap-2"
			>
				<Eye class="size-5" />
				View user details
			</DropdownMenu.Item>
			<DropdownMenu.Item
				class="flex flex-nowrap gap-2"
				on:click={() => (isManageMembershipDialogOpen = true)}
			>
				<Users class="size-5" />
				Manage groups
			</DropdownMenu.Item>
			<DropdownMenu.Item class="flex flex-nowrap gap-2" on:click={onOpenEditClick}>
				<PencilLine class="size-5" />
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item
				class="flex flex-nowrap gap-2"
				on:click={() => (isChangePasswordDialogOpen = true)}
			>
				<LockKeyholeOpen class="size-5" />
				Change password
			</DropdownMenu.Item>
			<DropdownMenu.Item
				class="!hover:text-destructive flex flex-nowrap gap-2 !text-destructive"
				on:click={() => (isDeleteUserDialogOpen = true)}
			>
				<Trash class="size-5" />
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<DeleteUserDialog dn={entry.distinguishedName} bind:open={isDeleteUserDialogOpen} on:deleted />
<ChangePasswordDialog dn={entry.distinguishedName} bind:open={isChangePasswordDialogOpen} />
<UpdateUserDialog
	dn={entry.distinguishedName}
	bind:open={isUpdateUserDialogOpen}
	bind:form={updateUserForm}
	on:name-change
/>
<ManageUserMembershipDialog dn={entry.distinguishedName} bind:open={isManageMembershipDialogOpen} />
