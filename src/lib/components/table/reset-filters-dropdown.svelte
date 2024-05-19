<script lang="ts">
	import { page } from '$app/stores';
	import ArrowUpDown from '$lucide/arrow-up-down.svelte';
	import BookOpenText from '$lucide/book-open-text.svelte';
	import EyeOff from '$lucide/eye-off.svelte';
	import FilterX from '$lucide/filter-x.svelte';
	import Search from '$lucide/search.svelte';
	import { derived } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { Button } from '../ui/button';
	import * as DropdownMenu from '../ui/dropdown-menu';

	$: showResetFilters =
		$page.url.searchParams.has('hide') ||
		$page.url.searchParams.has('q') ||
		$page.url.searchParams.has('sort') ||
		$page.url.searchParams.has('order') ||
		$page.url.searchParams.has('pageSize') ||
		$page.url.searchParams.has('page');

	const noSortAndOrder = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const copy = new URLSearchParams(searchParams);
		copy.delete('sort');
		copy.delete('order');
		return copy.toString().length > 0
			? `${$page.url.pathname}?${copy.toString()}`
			: $page.url.pathname;
	});

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
	const noHide = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const copy = new URLSearchParams(searchParams);
		copy.delete('hide');
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
				<DropdownMenu.LinkItem href={$noQ} class="flex gap-2 hover:no-underline">
					<Search class="size-4 flex-none" />
					<span>Clear Search</span>
				</DropdownMenu.LinkItem>
			{/if}
			{#if $page.url.searchParams.has('sort') || $page.url.searchParams.has('order')}
				<DropdownMenu.LinkItem href={$noSortAndOrder} class="flex gap-2 hover:no-underline">
					<ArrowUpDown class="size-4 flex-none" />
					<span>Clear Sort</span>
				</DropdownMenu.LinkItem>
			{/if}
			{#if $page.url.searchParams.has('pageSize') || $page.url.searchParams.has('page')}
				<DropdownMenu.LinkItem href={$noPagePageSize} class="flex gap-2 hover:no-underline">
					<BookOpenText class="size-4 flex-none" />
					<span>Clear Page and Page size</span>
				</DropdownMenu.LinkItem>
			{/if}
			{#if $page.url.searchParams.has('hide')}
				<DropdownMenu.LinkItem href={$noHide} class="flex gap-2 hover:no-underline">
					<EyeOff class="size-4 flex-none" />
					<span>Clear Hidden columns</span>
				</DropdownMenu.LinkItem>
			{/if}
		</DropdownMenu.Content>
	{/if}
</DropdownMenu.Root>
