<script lang="ts" context="module">
	export const LogTypes = {
		all: 'All',
		info: 'Info',
		warn: 'Warn',
		error: 'Error'
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Filter from 'lucide-svelte/icons/filter';
	import TypeFilter from './type-filter.svelte';
	$: activeFilter = $page.url.searchParams.get('type') || 'all';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" class="flex gap-2 capitalize">
			<Filter class="size-5" />
			{activeFilter}
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<TypeFilter filterType="all" />
		<TypeFilter filterType="error" />
		<TypeFilter filterType="info" />
	</DropdownMenu.Content>
</DropdownMenu.Root>
