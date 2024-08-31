<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { TreeEntry } from '$lib/types/tree';
	import { cn, getEntryIcon, isContainer, isGroup, isOu } from '$lib/utils';
	import { onMount, tick } from 'svelte';
	import { isExpandedEntry, isLastExpandedEntry } from '../utils';
	import PanelItemActions from './panel-item-actions.svelte';

	export let entry: TreeEntry;

	const mayHaveChildren = () => isOu(entry) || isContainer(entry) || isGroup(entry);
	const handleItemClick = async () => {
		if (isExpandedEntry(entry)) return;
		const { distinguishedName } = entry;
		if (mayHaveChildren()) {
			const parts = distinguishedName.split(',');
			const RDNs = parts.reverse().slice(2); //removing PUBLIC_BASE_DN
			await goto(`/tree/${RDNs.map(encodeURIComponent).join('/')}?${$page.url.searchParams}`, {
				invalidateAll: true
			});
		}
	};

	let panelItemElement: HTMLButtonElement;
	onMount(() => {
		if (isLastExpandedEntry(entry) && !$page.state.preventScrollIntoView) {
			tick().then(() => panelItemElement.scrollIntoView({ behavior: 'auto', block: 'center' }));
		}
	});
</script>

<button
	bind:this={panelItemElement}
	type="button"
	on:click|self={handleItemClick}
	data-active={isExpandedEntry(entry)}
	class={cn(
		mayHaveChildren()
			? 'data-[active=false]:cursor-pointer data-[active=true]:cursor-default hover:shadow-md data-[active=false]:hover:bg-primary/10 data-[active=true]:hover:bg-primary/90'
			: 'cursor-default',
		'relative flex h-fit w-full min-w-80 self-start', //positioning and size
		'rounded border-[1px] ', //border
		'p-1 pl-10', //paddings
		'transition-all duration-200 ',
		'data-[active=true]:text-muted', //text color
		'data-[active=true]:bg-primary' //bg
	)}
>
	<svelte:component
		this={getEntryIcon(entry)}
		class="pointer-events-none absolute left-2 top-1/2 flex size-6 flex-none origin-center -translate-y-1/2 font-light"
	/>
	<div class="absolute right-1 top-1 size-fit">
		<PanelItemActions {entry} />
	</div>
	<div class="pointer-events-none flex !w-full flex-col p-1">
		<p class="w-full text-start font-semibold">
			{entry.name}
		</p>
		<p
			data-active={isExpandedEntry(entry)}
			class="truncate text-start font-light text-muted-foreground data-[active=true]:text-muted/90"
		>
			{entry.dn}
		</p>
	</div>
</button>
