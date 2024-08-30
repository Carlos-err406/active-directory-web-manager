<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import PanelPlaceholder from '$lib/components/tree/panels/panel-placeholder.svelte';
	import Panel from '$lib/components/tree/panels/panel.svelte';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { tick } from 'svelte';
	import type { PageData } from './$types';
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
		tick().then(() => {
			tick().then(() => {
				anchorToLast.scrollIntoView({ behavior: 'smooth', block: 'start' });
			});
		});
	});
</script>

<div
	data-test="treePage"
	class="flex size-full overflow-x-auto overflow-y-hidden rounded border-2 border-muted-foreground last:border-r-0"
>
	{#each data.entries as entries}
		{#await entries}
			<PanelPlaceholder />
		{:then { entry, treeEntries }}
			{#await treeEntries then groupedEntries}
				<Panel base={entry} entries={groupedEntries} />
			{/await}
		{/await}
	{/each}
	<div bind:this={anchorToLast} />
</div>
