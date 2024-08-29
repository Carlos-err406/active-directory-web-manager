<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import BookOpenText from '$lucide/book-open-text.svelte';
	import Calendar from '$lucide/calendar.svelte';
	import Captions from '$lucide/captions.svelte';
	import FilterX from '$lucide/filter-x.svelte';
	import Search from '$lucide/search.svelte';
	import { derived } from 'svelte/store';
	import { slide } from 'svelte/transition';

	$: showResetFilters =
		$page.url.searchParams.has('q') ||
		($page.url.searchParams.has('type') && $page.url.searchParams.get('type') !== 'all') ||
		$page.url.searchParams.has('fromDate') ||
		$page.url.searchParams.has('toDate') ||
		$page.url.searchParams.has('pageSize') ||
		$page.url.searchParams.has('page');

	const noQ = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const copy = new URLSearchParams(searchParams);
		copy.delete('q');
		return copy.toString().length > 0
			? `${$page.url.pathname}?${copy.toString()}`
			: $page.url.pathname;
	});

	const noPagePageSize = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const copy = new URLSearchParams(searchParams);
		copy.delete('pageSize');
		copy.delete('page');
		return copy.toString().length > 0
			? `${$page.url.pathname}?${copy.toString()}`
			: $page.url.pathname;
	});

	const noType = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const copy = new URLSearchParams(searchParams);
		copy.delete('type');
		return copy.toString().length > 0
			? `${$page.url.pathname}?${copy.toString()}`
			: $page.url.pathname;
	});
	const noDate = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const copy = new URLSearchParams(searchParams);
		copy.delete('toDate');
		copy.delete('fromDate');
		return copy.toString().length > 0
			? `${$page.url.pathname}?${copy.toString()}`
			: $page.url.pathname;
	});
	let open = false;
	$: if (!showResetFilters) open = false;
</script>

<DropdownMenu.Root bind:open>
	{#if showResetFilters}
		<div transition:slide={{ axis: 'x' }}>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" class="flex gap-2">
					<FilterX class="size-5 flex-none" />
					<span>Reset Filters</span>
				</Button>
			</DropdownMenu.Trigger>
		</div>
	{/if}
	{#if open}
		<DropdownMenu.Content>
			{#if $page.url.searchParams.has('q')}
				<DropdownMenu.Item href={$noQ} class="flex gap-2 hover:no-underline">
					<Search class="size-4 flex-none" />
					<span>Clear Search</span>
				</DropdownMenu.Item>
			{/if}
			{#if $page.url.searchParams.has('pageSize') || $page.url.searchParams.has('page')}
				<DropdownMenu.Item href={$noPagePageSize} class="flex gap-2 hover:no-underline">
					<BookOpenText class="size-4 flex-none" />
					<span>Clear Page and Page size</span>
				</DropdownMenu.Item>
			{/if}
			{#if $page.url.searchParams.has('type')}
				<DropdownMenu.Item href={$noType} class="flex gap-2 hover:no-underline">
					<Captions class="size-4 flex-none" />
					<span>Clear type filter</span>
				</DropdownMenu.Item>
			{/if}
			{#if $page.url.searchParams.has('toDate') || $page.url.searchParams.has('fromDate')}
				<DropdownMenu.Item href={$noDate} class="flex gap-2 hover:no-underline">
					<Calendar class="size-4 flex-none" />
					<span>Clear date filter</span>
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	{/if}
</DropdownMenu.Root>
