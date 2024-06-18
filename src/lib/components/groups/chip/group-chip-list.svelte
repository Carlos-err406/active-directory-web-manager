<script lang="ts">
	import type { Group } from '$lib/types/group';
	import { flip } from 'svelte/animate';
	import GroupChip from './group-chip.svelte';

	export let groups: Group[] = [];
</script>

<div class="mt-2 flex w-full flex-wrap items-center gap-3">
	{#each groups as group (group.dn)}
		<div animate:flip={{ duration: 200 }}>
			<GroupChip
				{group}
				on:x={({ detail }) => (groups = groups.filter(({ dn }) => dn !== detail.dn))}
			/>
		</div>
	{:else}
		<div class="flex w-full justify-center">
			<slot name="empty-list">No groups selected</slot>
		</div>
	{/each}
</div>
