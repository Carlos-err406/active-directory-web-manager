<script lang="ts">
	import type { Group } from '$lib/types/group';
	import X from '$lucide/x.svelte';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';

	export let group: Group;
	const dispatch = createEventDispatcher<{ x: Group }>();
</script>

<div
	transition:slide={{ axis: 'x', duration: 200 }}
	class="flex items-center gap-2 rounded bg-primary px-3 py-1 text-accent"
>
	<span class="">
		{group.sAMAccountName}
	</span>
	<button type="button" on:click={() => dispatch('x', group)}>
		<X />
	</button>
</div>
