<script lang="ts">
	import { cn } from '$lib/utils';
	import _lodash from 'lodash';
	import PanelItemPlaceholder from './panel-item-placeholder.svelte';
</script>

<div
	class={cn(
		'relative flex flex-col items-center gap-2 px-2 pb-2',
		'transition-all duration-200',
		'overflow-y-auto overflow-x-hidden',
		'border-r-2 border-muted-foreground',
		'h-full max-h-[calc(100svh-87px)] w-full min-w-[23rem]'
	)}
>
	<div class="sticky top-0 z-10 flex w-full justify-end py-2">
		<div class="size-8 animate-pulse rounded bg-accent" />
	</div>

	{#each Array(_lodash.random(5, 10, false)) as _}
		<div class="flex w-full">
			<PanelItemPlaceholder />
		</div>
	{/each}
</div>
