<script lang="ts">
	import { Button } from '$/lib/components/ui/button';
	import type { TreeEntry } from '$/lib/types/tree';
	import { afterNavigate, goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import PanelPlaceholder from '$lib/components/tree/panels/panel-placeholder.svelte';
	import Panel from '$lib/components/tree/panels/panel.svelte';
	import { extractBase, getCNFromDN, getRDNFromDN } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { getCorrectPluralization, getTreeUrlFromDn, mayHaveChildren } from '$lib/utils';
	import Move from '$lucide/move.svelte';

	import DeleteManyEntriesDialog from '$/lib/components/tree/delete-many-entries-dialog.svelte';
	import { getDnFromUrl } from '$/lib/components/tree/utils';
	import _ from 'lodash';
	import { setContext, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
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

	let deleteSelectedDialogOpen = false;
	const selectedEntries = writable<TreeEntry[]>([]);
	const copiedEntries = writable<TreeEntry[]>([]);
	setContext('selected-entries', selectedEntries);
	setContext('copied-entries', copiedEntries);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			if ($copiedEntries.length) {
				copiedEntries.set([]);
			} else {
				selectedEntries.set([]);
			}
		}
		if (e.key === 'Delete' && $selectedEntries.length && !$copiedEntries.length) {
			e.preventDefault();
			deleteSelectedDialogOpen = true;
		}
	};

	const handleInitMove = () => {
		copiedEntries.set(_.cloneDeep($selectedEntries));
	};

	const handleDeletedMany = async ({ detail }: CustomEvent<TreeEntry[]>) => {
		$selectedEntries = [];
		$copiedEntries = [];
		const ordered = detail.sort((a, b) => a.dn.split(',').length - b.dn.split(',').length);
		if (ordered.length) {
			console.log(ordered);
			const currentDn = getDnFromUrl($page.url.pathname);
			const getBaseFrom = ordered.findLast((value) => currentDn.endsWith(value.dn));
			if (getBaseFrom) {
				const base = extractBase(getBaseFrom.dn);
				const url = getTreeUrlFromDn(base);
				await goto(url, { invalidateAll: true });
			} else {
				invalidateAll();
			}
		} else {
			await goto('/tree', { invalidateAll: true });
		}
	};

	const handleMoveCancel = () => {
		copiedEntries.set([]);
	};
	$: {
		$selectedEntries;
		if ($copiedEntries.length) copiedEntries.set(_.cloneDeep($selectedEntries));
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<div class="flex size-full flex-col gap-2">
	{#if ($selectedEntries.length && !$copiedEntries.length) || $copiedEntries.length}
		<div transition:slide={{ duration: 200 }} class="flex items-center gap-6">
			{#if $selectedEntries.length && !$copiedEntries.length}
				<div class="flex items-center gap-4">
					<span class="text-nowrap text-muted-foreground">
						Selected {$selectedEntries.length}
						{getCorrectPluralization($selectedEntries, 'entries', 'entry')}
					</span>
					<Button class="flex items-center gap-2" on:click={handleInitMove}>
						<Move class="size-4 flex-none" />
						Move selected entries
					</Button>
					<DeleteManyEntriesDialog
						bind:open={deleteSelectedDialogOpen}
						entries={$selectedEntries}
						on:deleted={handleDeletedMany}
					/>
				</div>
			{/if}
			{#if $copiedEntries.length}
				<div class="flex items-center gap-4">
					<span class="text-nowrap text-muted-foreground">
						Moving {$copiedEntries.length}
						{getCorrectPluralization($copiedEntries, 'entries', 'entry')}
					</span>
					<Button class="flex items-center gap-2" on:click={handleMoveCancel}>Cancel</Button>
				</div>
			{/if}
		</div>
	{/if}
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
</div>
