<script lang="ts">
	import type { User } from '$lib/types/user';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import X from '$lucide/x.svelte';

	export let user: User;
	const dispatch = createEventDispatcher<{ x: User }>();
</script>

<div
	transition:slide={{ axis: 'x', duration: 200 }}
	class="flex items-center gap-2 rounded bg-primary px-3 py-1 text-accent"
>
	<span class="">
		{user.sAMAccountName}
	</span>
	<button type="button" on:click={() => dispatch('x', user)}>
		<X />
	</button>
</div>
