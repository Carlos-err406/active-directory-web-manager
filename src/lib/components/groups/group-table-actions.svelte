<script lang="ts">
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { User } from '$lib/types/user';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import DeleteGroupDialog from './delete-group-dialog.svelte';
	import UpdateUserDialog from './update-group-dialog.svelte';
	export let id: string;
	let open = false;
	let isDeleteGroupDialogOpen = false;
	let isUpdateGroupDialogOpen = false;
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
		isUpdateGroupDialogOpen = true;
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
			<DropdownMenu.LinkItem href={paths.groups.dn(id)} class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View group details
			</DropdownMenu.LinkItem>
			<DropdownMenu.Item class="flex flex-nowrap gap-2" on:click={onOpenEditClick}>
				<PencilLine class="size-5" />
				Edit
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

<DeleteGroupDialog dn={id} bind:open={isDeleteGroupDialogOpen} />
<UpdateUserDialog dn={id} bind:open={isUpdateGroupDialogOpen} bind:form={updateUserForm} />
