<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { TreeEntry } from '$lib/types/tree';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Square from 'lucide-svelte/icons/square';
	import SquareCheck from 'lucide-svelte/icons/square-check';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	export let entry: TreeEntry;
	let open = false;

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
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
