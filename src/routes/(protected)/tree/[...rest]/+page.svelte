<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import __ from 'lodash';
	import PanelItemPlaceholder from '../panel-item-placeholder.svelte';
	import PanelItem from '../panel-item.svelte';
	import Panel from '../panel.svelte';
	import type { PageData } from './$types';
	import { scale } from 'svelte/transition';
	import { browser } from '$app/environment';
	export let data: PageData;

	$: breadcrumbs.set([
		{ name: 'Root', link: '/tree' },
		...data.activeDns.map((dn) => ({ name: getCNFromDN(dn), link: buildTreeUrl(dn) }))
	]);

	const buildTreeUrl = (dn: string): string => {
		const index = data.activeDns.indexOf(dn);
		if (index === -1) {
			throw new Error(`DNS '${dn}' not found in activeDns`);
		}
		return '/tree/' + data.activeDns.slice(0, index + 1).join('/');
	};

	let anchorToLast: HTMLDivElement;
	afterNavigate(() => {
		anchorToLast.scrollIntoView({ behavior: 'smooth', block: 'end' });
	});
</script>

<div
	data-test="treePage"
	class="max-w- flex size-full overflow-x-auto overflow-y-hidden rounded border-2 border-muted-foreground last:border-r-0"
>
	{#each data.entries as entries}
		{#await entries}
			<Panel>
				{#if browser}
					{#each Array(__.random(5, 10, false)) as _}
						<div class="flex w-full" transition:scale>
							<PanelItemPlaceholder />
						</div>
					{/each}
				{/if}
			</Panel>
		{:then entryGroups}
			<Panel>
				{#each entryGroups as entry (entry.dn)}
					<PanelItem {entry} />
				{:else}
					<div class="flex h-full items-center">
						<p class="text-center text-xl font-light">Empty</p>
					</div>
				{/each}
			</Panel>
		{/await}
	{/each}
	<div bind:this={anchorToLast} />
</div>
