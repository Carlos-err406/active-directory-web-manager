<script lang="ts">
	import clsx from 'clsx';

	export let condition = false;
	export let vertical = false;
	export let size: 'sm' | 'md' | 'lg' = 'sm';
	export let amount = 3;
</script>

{#if !condition && condition !== undefined}
	<slot />
{:else}
	<div class={clsx('flex', 'gap-1', vertical ? 'flex-col' : 'flex-row')}>
		{#each Array(amount) as _, index}
			<div
				class={clsx(
					'relative flex aspect-square items-center justify-center rounded-full border-[1px] border-slate-500',
					size === 'sm' ? 'h-3' : size === 'md' ? 'h-5' : 'h-8'
				)}
			>
				<div
					class={clsx(
						'absolute aspect-square animate-ping rounded-full border-[1px] border-slate-500',
						'delay-' + index * 100,
						size === 'sm' ? 'h-3' : size === 'md' ? 'h-5' : 'h-8'
					)}
				></div>
			</div>
		{/each}
	</div>
{/if}
