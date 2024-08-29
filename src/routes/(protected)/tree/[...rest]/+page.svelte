<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import PanelItemPlaceholder from '$lib/components/tree/panels/panel-item-placeholder.svelte';
	import Panel from '$lib/components/tree/panels/panel.svelte';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import _lodash from 'lodash';
	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	export let data: PageData;
	const toastId = writable<string | number>(NaN);
	setContext('inspection-toast', toastId);
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
			<Panel>
				{#each Array(_lodash.random(5, 10, false)) as _}
					<div class="flex w-full">
						<PanelItemPlaceholder />
					</div>
				{/each}
			</Panel>
		{:then entryGroups}
			<Panel entries={entryGroups} />
		{/await}
	{/each}
	<div bind:this={anchorToLast} />
</div>
