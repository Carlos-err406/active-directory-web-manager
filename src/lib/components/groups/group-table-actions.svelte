<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
	import DeleteGroupDialog from './delete-group-dialog.svelte';
	import ManageGroupMembersDialog from './manage-group-members-dialog.svelte';

	export let id: string;
	let open = false;
	let isDeleteGroupDialogOpen = false;
	// let isUpdateGroupDialogOpen = false;
	let isManageMembersDialogOpen = false;
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
			<DropdownMenu.LinkItem href={`/groups/${id}`} class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View group details
			</DropdownMenu.LinkItem>
			<DropdownMenu.Item class="flex flex-nowrap gap-2" on:click={() => {}}>
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

<DeleteGroupDialog dn={id} bind:open={isDeleteGroupDialogOpen} />
<ManageGroupMembersDialog dn={id} bind:open={isManageMembersDialogOpen} />
