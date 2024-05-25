<script lang="ts">
	import { page } from '$app/stores';
	import Check from '$lucide/check.svelte';
	import type { FlatColumn } from 'svelte-headless-table';
	import { derived } from 'svelte/store';
	import { LinkItem } from '../ui/dropdown-menu';
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let col: FlatColumn<any>;

	const element = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const hiddenColumnIds = searchParams.get('hide')?.split(',') || [];
		const currentlyHidden = hiddenColumnIds;
		const { id, header } = col;
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
		const href = `${$page.url.pathname}?${params.toString()}`;
		return {
			header,
			href,
			isHidden: searchParams.get('hide')?.includes(id) || false
		};
	});
</script>

<LinkItem class="flex gap-3" href={$element.href}>
	<span class="size-3.5">
		{#if !$element.isHidden}
			<Check class="size-full" />
		{/if}
	</span>
	<span>
		{$element.header}
	</span>
</LinkItem>
