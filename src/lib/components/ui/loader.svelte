<script lang="ts">
	import type { NumericRange } from '@sveltejs/kit';
	import clsx from 'clsx';
	export let condition: boolean | undefined = undefined;
	export let vertical = false;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'sm';
	export let amount: NumericRange<1, 5> = 3;

	let height =
		size === 'sm' ? 'h-3' : size === 'md' ? 'h-5' : size === 'lg' ? 'h-8' : size === 'xl' && 'h-10';
</script>

{#if !condition && condition !== undefined}
	<slot />
{:else}
	<div class={clsx('flex', 'gap-1', vertical ? 'flex-col' : 'flex-row')}>
		{#each new Array(amount) as _, index}
			<div
				class={clsx(
					'relative flex aspect-square items-center justify-center rounded-full border border-slate-500',
					height
				)}
			>
				<div
					class={clsx(
						'absolute aspect-square animate-ping rounded-full border-[1px] border-slate-500',
						'animation-delay-' + index * 100,
						height
					)}
				/>
			</div>
		{/each}
	</div>
{/if}
