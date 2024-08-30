<script lang="ts">
	import X from '$lucide/x.svelte';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { Entry } from './entry-select.svelte';
	import { getEntryIcon } from '$lib/utils';

	export let entry: Entry;
	const dispatch = createEventDispatcher<{ x: Entry }>();
</script>

<div
	transition:slide={{ axis: 'x', duration: 200 }}
	class="flex items-center gap-2 rounded bg-primary px-3 py-1 text-accent"
>
	<svelte:component this={getEntryIcon(entry)} class="size-5" />
	<span>
		{entry.sAMAccountName}
	</span>
	<button type="button" on:click={() => dispatch('x', entry)}>
		<X />
	</button>
</div>
