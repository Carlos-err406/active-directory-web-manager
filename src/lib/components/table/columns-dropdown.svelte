<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ChevronDown from '$lucide/chevron-down.svelte';
	import type { FlatColumn } from 'svelte-headless-table';
	import ColumnsDropdownElement from './columns-dropdown-element.svelte';

	export let hidableCols: string[] = [];
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let flatColumns: FlatColumn<any>[] = [];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="outline" builders={[builder]}>
			Columns <ChevronDown class="ml-2 size-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each flatColumns.filter((col) => hidableCols.includes(col.id)) as col}
			<ColumnsDropdownElement {col} />
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
