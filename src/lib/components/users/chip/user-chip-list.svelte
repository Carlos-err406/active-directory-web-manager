<script lang="ts">
	import type { User } from '$lib/types/user';
	import { flip } from 'svelte/animate';
	import UserChip from './user-chip.svelte';

	export let users: User[] = [];
</script>

<div class="mt-2 flex w-full flex-wrap items-center gap-3">
	{#each users as user (user.dn)}
		<div animate:flip={{ duration: 200 }}>
			<UserChip
				{user}
				on:x={({ detail }) => (users = users.filter(({ dn }) => dn !== detail.dn))}
			/>
		</div>
	{:else}
		<div class="flex w-full justify-center">
			<slot name="empty-list">No users selected</slot>
		</div>
	{/each}
</div>
