<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import Trash from '$lucide/trash-2.svelte';
	import Edit from '$lucide/pencil-line.svelte';
	import Eye from '$lucide/eye.svelte';
	export let id: string;
	
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="flex flex-nowrap gap-2">
				<Eye class="size-5" />
				View user details
			</DropdownMenu.Item>
			<DropdownMenu.Item class="flex flex-nowrap gap-2">
				<Edit class="size-5" />
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item class="flex flex-nowrap gap-2 text-destructive hover:text-destructive">
				<Trash class="size-5" />
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
