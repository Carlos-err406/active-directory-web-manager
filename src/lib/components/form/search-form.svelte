<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import Search from 'lucide-svelte/icons/search';
	import { onDestroy, tick } from 'svelte';
	import { Input } from '../ui/input';
	import Timer from '../ui/timer/timer.svelte';

	let timer: number;
	let showTimer = false;
	let q = $page.url.searchParams.get('q');
	afterNavigate(() => {
		q = $page.url.searchParams.get('q');
	});

	const submit = async () => {
		const { searchParams: search } = $page.url;
		if (q) {
			search.set('q', q);
			if (!$page.data.withoutPages) search.set('page', '1');
		} else search.delete('q');
		await goto(`${$page.url.pathname}?${search}`, { invalidateAll: true });
	};

	const handleInput = async () => {
		clearTimeout(timer);

		if (showTimer) {
			showTimer = false;
			await tick();
			showTimer = true;
		} else showTimer = true;

		timer = window.setTimeout(() => {
			showTimer = false;
			submit();
		}, 1000);
	};

	onDestroy(() => {
		clearTimeout(timer);
		showTimer = false;
	});
</script>

<div class="relative">
	<div class="adornment absolute left-2 top-2.5">
		<Search />
	</div>
	<Input
		class={cn('px-10', 'w-full')}
		data-test="searchInput"
		name="q"
		bind:value={q}
		placeholder="Search"
		on:input={() => handleInput()}
		on:keydown={(event) => {
			if (event.key === 'Enter') {
				clearTimeout(timer);
				showTimer = false;
				submit();
			}
		}}
	/>
	<div class="adornment absolute right-2 top-2.5">
		{#if showTimer}
			<Timer timeout={1000} />
		{/if}
	</div>
</div>
