<script lang="ts">
	import { flip } from 'svelte/animate';
	import EntryChip from './entry-chip.svelte';
	import type { Entry } from './entry-select.svelte';

	export let entries: Entry[] = [];
</script>

<div class="mt-2 flex w-full flex-wrap items-center gap-3">
	{#each entries as entry (entry.dn)}
		<div animate:flip={{ duration: 200 }}>
			<EntryChip
				{entry}
				on:x={({ detail }) => (entries = entries.filter(({ dn }) => dn !== detail.dn))}
			/>
		</div>
	{:else}
		<div class="flex w-full justify-center">
			<slot name="empty-list">No entries selected</slot>
		</div>
	{/each}
</div>
