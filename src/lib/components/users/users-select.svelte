<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { User } from '$lib/types/user';
	import { arrowNavigation } from '$lib/utils';
	import Loading from '$lucide/loader.svelte';
	import Search from '$lucide/search.svelte';
	import {
		AndFilter,
		EqualityFilter,
		NotFilter,
		OrFilter,
		SubstringFilter,
		ldapFilterToUrlFilter
	} from '$lib/ldap/filter';
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';

	let loading = Promise.resolve(false);
	let q = '';
	let abortController: AbortController | null = null;
	let users: User[] = [];
	export let selected: User[] = [];

	const getFilter = () => {
		//filter for getting only users
		const objectClassFilter = new AndFilter({
			filters: [
				new NotFilter({
					filter: new EqualityFilter({ attribute: 'objectClass', value: 'computer' })
				}),
				...['top', 'person', 'user', 'organizationalPerson'].map(
					(value) => new EqualityFilter({ attribute: 'objectClass', value })
				)
			]
		});
		//filter for getting entries with q in sAMAccountName, givenName or sn
		const attributesFilter = new OrFilter({
			filters: ['sAMAccountName', 'givenName', 'sn'].map(
				(attribute) => new SubstringFilter({ attribute, any: [q] })
			)
		});
		return encodeURI(
			ldapFilterToUrlFilter(
				new AndFilter({ filters: [objectClassFilter, attributesFilter] }).toString()
			)
		);
	};

	const handleInput = async () => {
		abort();
		if (!q) {
			users = [];
			return;
		}
		abortController = new AbortController();
		const { signal } = abortController;
		loading = new Promise((r) =>
			window.setTimeout(() => {
				r(true);
			}, 200)
		);
		fetch(`/api/search?filter=${getFilter()}`, { signal })
			.then((r) => r.json())
			.then((data) => (users = data))
			.then(() => (loading = Promise.resolve(false)))
			.catch(() => (loading = Promise.resolve(false)))
			.then(() => (abortController = null));
	};
	const abort = () => {
		loading = Promise.resolve(false);
		abortController?.abort('Outdated');
	};
	let container: HTMLDivElement;
	$: input = container?.firstChild as HTMLInputElement;

	let usersContainer: HTMLDivElement;
	const dispatch = createEventDispatcher<{ select: User }>();
</script>

<div class="relative flex w-full flex-col gap-2">
	<div bind:this={container} class="relative">
		<Input
			placeholder="Search for users to add..."
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
		class:p-1={users.length}
		class:border={users.length}
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
		{#each users.filter(({ dn }) => !selected.find(({ distinguishedName }) => distinguishedName === dn)) as user (user.dn)}
			<button
				id={user.dn}
				transition:slide={{ duration: 200, axis: 'y' }}
				animate:flip={{ duration: 200 }}
				class="relative flex cursor-default select-none items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent disabled:pointer-events-none disabled:opacity-50 data-[highlighted]:text-accent-foreground"
				type="button"
				on:click={() => {
					dispatch('select', user);
					q = '';
					users = [];
					input?.focus();
				}}
			>
				{user.displayName || user.givenName || user.cn} ({user.sAMAccountName})
			</button>
		{:else}
			{#await loading then isLoading}
				{#if q && !isLoading}
					<div class="flex w-full justify-center items-center">--- No users to select ---</div>
				{/if}
			{/await}
		{/each}
	</div>
</div>
