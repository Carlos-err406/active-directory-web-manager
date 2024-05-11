<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ChevronDown from '$lucide/chevron-down.svelte';
	import type { FlatColumn } from 'svelte-headless-table';

	export let hidableCols: string[] = [];
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let flatColumns: FlatColumn<any>[] = [];

	$: ({ searchParams } = $page.url);
	$: hiddenColumnIds = searchParams.get('hide')?.split(',') || [];

	const handleToggleHideColumnClick = (id: string) => {
		const currentlyHidden = hiddenColumnIds;
		if (currentlyHidden.includes(id)) {
			currentlyHidden.splice(currentlyHidden.indexOf(id), 1);
		} else {
			currentlyHidden.push(id);
		}
		const params = new URLSearchParams(searchParams);
		if (currentlyHidden.length === 0) {
			params.delete('hide');
		} else {
			params.set('hide', currentlyHidden.join(','));
		}
		goto(`${$page.url.pathname}?${params.toString()}`);
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="outline" class="ml-auto" builders={[builder]}>
			Columns <ChevronDown class="ml-2 h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each flatColumns as col}
			{#if hidableCols.includes(col.id)}
				<DropdownMenu.CheckboxItem
					checked={!hiddenColumnIds.includes(col.id)}
					on:click={() => handleToggleHideColumnClick(col.id)}
				>
					{col.header}
				</DropdownMenu.CheckboxItem>
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
