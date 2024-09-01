<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import PanelPlaceholder from '$lib/components/tree/panels/panel-placeholder.svelte';
	import Panel from '$lib/components/tree/panels/panel.svelte';
	import { getCNFromDN, getRDNFromDN } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { mayHaveChildren } from '$lib/utils';
	export let data: PageData;
	$: breadcrumbs.set([
		{ name: 'Root', link: '/tree' },
		...data.activeDns.map(buildTreeBreadcrumbs)
	]);

	const buildTreeBreadcrumbs = (dn: string) => {
		const index = data.activeDns.indexOf(dn);
		if (index === -1) {
			throw new Error(`DNS '${dn}' not found in activeDns`);
		}
		return {
			name: getCNFromDN(data.activeDns[index]),
			link:
				'/tree/' +
				data.activeDns
					.map(getRDNFromDN)
					.slice(0, index + 1)
					.join('/')
		};
	};

	let anchorToLast: HTMLDivElement;
	afterNavigate(() => {
		if (!$page.state.preventScrollIntoView) {
			tick().then(() => {
				tick().then(() => {
					anchorToLast.scrollIntoView({ behavior: 'smooth', block: 'start' });
				});
			});
		}
	});
</script>

<div
	data-test="treePage"
	class="flex size-full overflow-x-auto overflow-y-hidden rounded border-2 border-muted-foreground last:border-r-0"
>
	{#each data.entries as entries}
		{#await entries}
			<PanelPlaceholder />
		{:then entries}
			{#if entries}
				{#if mayHaveChildren(entries.base)}
					{#await entries.treeEntries then groupedEntries}
						<Panel base={entries.base} entries={groupedEntries} />
					{/await}
				{/if}
			{/if}
		{/await}
	{/each}
	<div bind:this={anchorToLast} />
</div>
