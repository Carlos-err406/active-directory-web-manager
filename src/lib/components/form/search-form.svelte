<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { searchSchema } from '$lib/schemas/search-schema';
	import { Search } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Timer from '../ui/timer/timer.svelte';
	import Input from './input.svelte';

	let timer: number;
	let showTimer = false;
	let formElement: HTMLFormElement;
	let q = $page.url.searchParams.get('q') || '';

	afterNavigate(() => {
		q = $page.url.searchParams.get('q') || '';
	});

	$: methods = superForm(
		{ q },
		{
			validators: zodClient(searchSchema),
			clearOnSubmit: 'errors',

			onSubmit: async (event) => {
				const q = event.formData.get('q') as string;
				const search = $page.url.searchParams;
				if (q) search.set('q', q);
				else search.delete('q');
				await goto($page.url.pathname + '?' + search.toString());
			}
		}
	);
	$: ({ form: formData, submit, enhance } = methods);

	const handleInput = () => {
		clearTimeout(timer);
		if (showTimer) {
			showTimer = false;
			setTimeout(() => (showTimer = true), 10);
		} else showTimer = true;
		timer = setTimeout(() => {
			showTimer = false;
			submit(formElement);
		}, 1000);
	};
	const handleEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			clearTimeout(timer);
			showTimer = false;
			submit(formElement);
		}
	};
	onDestroy(() => {
		clearTimeout(timer);
		showTimer = false;
	});
</script>

<form
	bind:this={formElement}
	class="w-full min-w-fit max-w-96"
	action="?/search"
	method="post"
	use:enhance
>
	<Input
		name="q"
		{methods}
		bind:value={$formData.q}
		on:input={handleInput}
		on:keydown={handleEnter}
		inputProps={{ type: 'text', placeholder: 'Search' }}
	>
		<svelte:fragment slot="addornment-left">
			<Search />
		</svelte:fragment>
		<svelte:fragment slot="addornment-right">
			{#if showTimer}
				<Timer timeout={1000} />
			{/if}
		</svelte:fragment>
	</Input>
</form>
