<script lang="ts">
	import { page } from '$app/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { derived } from 'svelte/store';
	import Check from '$lucide/check.svelte';
	export let filterType: string = 'all';

	const filter = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const params = new URLSearchParams(searchParams);
		params.set('type', filterType);
		const href = `${$page.url.pathname}?${params.toString()}`;
		const activeFilter = $page.url.searchParams.get('type');
		return { href, activeFilter };
	});
</script>

<DropdownMenu.Item href={$filter.href} class="flex gap-2 capitalize transition-all duration-200">
	{#if $filter.activeFilter === filterType || (!$filter.activeFilter && filterType === 'all')}
		<Check class="size-5 flex-none" />
	{:else}
		<span class="size-5"></span>
	{/if}
	<span>{filterType}</span>
</DropdownMenu.Item>
