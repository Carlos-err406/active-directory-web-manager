<script lang="ts" context="module">
	export type Entry = {
		dn: string;
		distinguishedName: string;
		objectClass: string[];
		[index: string]: unknown;
	};
</script>

<script lang="ts">
	import { PUBLIC_API_KEY } from '$env/static/public';
	import { Input } from '$lib/components/ui/input';
	import { ldapFilterToUrlFilter } from '$lib/ldap/filter';
	import type { Filter } from '$lib/ldap/filter/filter';
	import { arrowNavigation, getEntryIcon } from '$lib/utils';
	import Loading from '$lucide/loader.svelte';
	import Search from '$lucide/search.svelte';
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';

	let loading = Promise.resolve(false);
	let q = '';
	let abortController: AbortController | null = null;
	let entries: Entry[] = [];
	let input: HTMLInputElement;
	let usersContainer: HTMLDivElement;

	export let selected: Entry[] = [];
	export let getFilter: (q: string) => Filter;
	const _getFilter = () => {
		const filter = getFilter(q);
		return encodeURI(ldapFilterToUrlFilter(filter.toString()));
	};

	const handleInput = async () => {
		abort();
		if (!q) {
			entries = [];
			return;
		}
		abortController = new AbortController();
		const { signal } = abortController;
		loading = new Promise((r) =>
			window.setTimeout(() => {
				r(true);
			}, 200)
		);
		fetch(`/api/search?filter=${_getFilter()}`, {
			headers: { Authorization: `Bearer ${PUBLIC_API_KEY}` },
			signal
		})
			.then((r) => r.json())
			.then((data) => (entries = data))
			.then(() => (loading = Promise.resolve(false)))
			.catch(() => (loading = Promise.resolve(false)))
			.then(() => (abortController = null));
	};
	const abort = () => {
		loading = Promise.resolve(false);
		abortController?.abort('Outdated');
	};

	const dispatch = createEventDispatcher<{ select: Entry }>();
</script>

<div class="relative flex w-full flex-col gap-2">
	<div class="relative">
		<Input
			bind:element={input}
			placeholder="Search for entries to add..."
			class="w-full pr-10"
			max={100}
			on:input={handleInput}
			on:keydown={(e) => e.key === 'ArrowDown' && usersContainer.querySelector('button')?.focus()}
			bind:value={q}
		/>
		<div class="absolute right-2 top-1.5">
			<Search />
		</div>
	</div>
	<div
		use:arrowNavigation
		bind:this={usersContainer}
		class:p-1={entries.length}
		class:border={entries.length}
		class="absolute top-full z-50 grid max-h-96 w-full min-w-[8rem] grid-cols-1 overflow-y-auto overflow-x-hidden rounded-md bg-popover text-popover-foreground shadow-md transition-all duration-200 focus:outline-none"
	>
		{#await loading then isLoading}
			{#if isLoading}
				<div
					transition:slide={{ duration: 200 }}
					class="flex h-fit w-full items-center justify-center py-1"
				>
					<Loading class="size-5 animate-spin" /> <span>searching...</span>
				</div>
			{/if}
		{/await}
		{#each entries.filter(({ dn }) => !selected.find(({ distinguishedName }) => distinguishedName === dn)) as entry (entry.dn)}
			<button
				id={entry.dn}
				transition:slide={{ duration: 200, axis: 'y' }}
				animate:flip={{ duration: 200 }}
				class="relative flex cursor-default select-none items-center gap-3 rounded-sm px-2 py-1.5 text-start text-sm outline-none data-[highlighted]:text-accent-foreground hover:bg-accent focus:bg-accent disabled:pointer-events-none disabled:opacity-50"
				type="button"
				on:click={() => {
					dispatch('select', entry);
					q = '';
					entries = [];
					input?.focus();
				}}
			>
				<svelte:component this={getEntryIcon(entry)} class="size-5" />
				{entry.displayName || entry.givenName || entry.cn} ({entry.sAMAccountName})
			</button>
		{:else}
			{#await loading then isLoading}
				{#if q && !isLoading}
					<div class="flex w-full justify-center items-center">
						<slot name="no-entries">--- No entries to select ---</slot>
					</div>
				{/if}
			{/await}
		{/each}
	</div>
</div>
