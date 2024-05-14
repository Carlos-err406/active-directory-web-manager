<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { paths } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Ellipsis from '$lucide/ellipsis.svelte';
	import Eye from '$lucide/eye.svelte';
	import Edit from '$lucide/pencil-line.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import { LockKeyholeOpen } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	export let id: string;
	let open = false;
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
			<DropdownMenu.Item class="flex flex-nowrap gap-2">
				<Edit class="size-5" />
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item class="flex flex-nowrap gap-2">
				<LockKeyholeOpen class="size-5" />
				Change password
			</DropdownMenu.Item>
			<form
				action={paths.users.actions.delete}
				method="post"
				use:enhance={() => {
					return ({ result }) => {
						open = false;
						if (result.type === 'success') {
							toast.success('User deleted successfully');
							invalidate('protected:users');
						} else if (result.type === 'error') {
							toast.error(result.error.message);
						}
					};
				}}
			>
				<input type="hidden" name="dn" value={id} />
				<Button
					type="submit"
					variant="ghost"
					class="flex w-full flex-nowrap justify-start gap-2 px-2 text-start text-destructive hover:text-destructive"
				>
					<Trash class="size-5" />
					Delete
				</Button>
			</form>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
