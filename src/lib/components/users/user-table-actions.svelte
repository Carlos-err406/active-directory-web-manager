<script lang="ts">
	import { getUserAccountControlMatches } from '$/lib/ldap/utils';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { User } from '$lib/types/user';
	import { getTreeUrlFromDn } from '$lib/utils';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Eye from 'lucide-svelte/icons/eye';
	import FolderTree from 'lucide-svelte/icons/folder-tree';
	import LockKeyholeOpen from 'lucide-svelte/icons/lock-keyhole-open';
	import PencilLine from 'lucide-svelte/icons/pencil-line';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Users from 'lucide-svelte/icons/users';
	import ChangePasswordDialog from './change-password-dialog.svelte';
	import DeleteUserDialog from './delete-user-dialog.svelte';
	import ManageUserMembershipDialog from './manage-user-membership-dialog.svelte';
	import UpdateUserDialog from './update-user-dialog.svelte';
	export let dn: string;
	let open = false;
	let isChangePasswordDialogOpen = false;
	let isDeleteUserDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	let isManageMembershipDialogOpen = false;
	$: ({ updateUserForm } = $page.data);
	const onOpenEditClick = () => {
		const paginationData: User[] = $page.data.pagination.data;
		const user = paginationData.find(({ distinguishedName }) => distinguishedName === dn);
		if (!user) return;
		const uacMatches = getUserAccountControlMatches(user.userAccountControl);
		updateUserForm.data = {
			...updateUserForm.data,
			...user,
			dn,
			jpegPhotoBase64: user?.jpegPhoto,
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
			<DropdownMenu.Item href="/users/{encodeURIComponent(dn)}" class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View user details
			</DropdownMenu.Item>
			<DropdownMenu.Item href={getTreeUrlFromDn(dn)} class="flex flex-nowrap gap-2">
				<FolderTree class="size-5" />
				View in tree
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

<DeleteUserDialog
	{dn}
	bind:open={isDeleteUserDialogOpen}
	on:deleted={() => invalidate('protected:users')}
/>
<ChangePasswordDialog {dn} bind:open={isChangePasswordDialogOpen} />
<UpdateUserDialog
	{dn}
	bind:open={isUpdateUserDialogOpen}
	bind:form={updateUserForm}
	on:name-change={() => invalidate('protected:users')}
/>
<ManageUserMembershipDialog {dn} bind:open={isManageMembershipDialogOpen} />
