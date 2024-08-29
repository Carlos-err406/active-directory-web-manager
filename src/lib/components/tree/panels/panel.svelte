<script lang="ts">
	import type { TreeEntry } from '$lib/types/tree';
	import { cn } from '$lib/utils';
	import PanelItem from './panel-item.svelte';
	export let entries: TreeEntry[] = [];
</script>

<div
	class={cn(
		'flex flex-col items-center gap-2 p-2 ',
		'transition-all duration-200',
		'overflow-y-auto overflow-x-hidden',
		'border-r-2 border-muted-foreground',
		'h-full max-h-[calc(100svh-87px)] w-full min-w-[23rem]'
	)}
>
	<slot>
		{#each entries as entry (entry.dn)}
			<PanelItem {entry} />
		{:else}
			<div class="flex h-full items-center">
				<p class="text-center text-xl font-light">Empty</p>
			</div>
		{/each}
	</slot>
</div>
