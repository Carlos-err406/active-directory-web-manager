<script lang="ts">
	import { getEntryIcon, type EntryWithObjectClass } from '$lib/utils';
	import X from 'lucide-svelte/icons/x';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';

	export let entry: EntryWithObjectClass;
	const dispatch = createEventDispatcher<{ x: EntryWithObjectClass }>();
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
