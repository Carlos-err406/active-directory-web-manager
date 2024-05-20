<script lang="ts">
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { User } from '$lib/types/user';
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
	export let id: string;
	let open = false;
	let isChangePasswordDialogOpen = false;
	let isDeleteUserDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	let isManageMembershipDialogOpen = false;
	$: ({ updateUserForm } = $page.data);
	const onOpenEditClick = () => {
		const paginationData: User[] = $page.data.pagination.data;
		const user = paginationData.find(({ distinguishedName }) => distinguishedName === id);
		updateUserForm.data = {
			...updateUserForm.data,
			...user,
			dn: id,
			jpegPhotoBase64: user?.jpegPhoto
		};
		isUpdateUserDialogOpen = true;
	};
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative size-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="size-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.LinkItem href={paths.users.dn(id)} class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View user details
			</DropdownMenu.LinkItem>
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

<DeleteUserDialog dn={id} bind:open={isDeleteUserDialogOpen} />
<ChangePasswordDialog dn={id} bind:open={isChangePasswordDialogOpen} />
<UpdateUserDialog dn={id} bind:open={isUpdateUserDialogOpen} bind:form={updateUserForm} />
<ManageUserMembershipDialog dn={id} bind:open={isManageMembershipDialogOpen} />
