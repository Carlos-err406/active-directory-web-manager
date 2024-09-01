<script lang="ts">
	import { getUserAccountControlMatches } from '$/lib/ldap/utils';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { TreeEntry } from '$lib/types/tree';
	import EllipsisVertical from '$lucide/ellipsis-vertical.svelte';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import LockKeyholeOpen from '$lucide/lock-keyhole-open.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
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
