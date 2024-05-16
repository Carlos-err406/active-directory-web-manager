<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { searchSchema as schema, type SearchSchema } from '$lib/schemas/search-schema';
	import Search from '$lucide/search.svelte';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Timer from '../ui/timer/timer.svelte';
	import Form, { type Methods, type ResultType } from './form.svelte';
	import Input from './input.svelte';

	let timer: number;
	let showTimer = false;
	let formElement: HTMLFormElement;
	$: ({ searchForm } = $page.data);
	let q = $page.url.searchParams.get('q');

	const onResult = async (event: ResultType<SearchSchema>) => {
		const { result } = event;
		if (result.type === 'success') {
			const { data } = result;
			if (!data) return;
			q = data.form.data.q || null;
			const { searchParams } = $page.url;
			const search = new URLSearchParams(searchParams);
			if (q) search.set('q', q);
			else search.delete('q');
			await goto(`${$page.url.pathname}?${search.toString()}`);
		} else {
			toast.error('Something went wrong', { description: `Status: ${result.status}` });
		}
	};

	const handleInput = (submit: Methods['submit']) => {
		clearTimeout(timer);

		if (showTimer) {
			showTimer = false;
			window.setTimeout(() => (showTimer = true), 10);
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

<Form
	bind:formElement
	let:methods
	bind:form={searchForm}
	{schema}
	loadingText="Searching..."
	formProps={{ action: '?/search' }}
	formOptions={{
		delayMs: 4000,
		resetForm: false,
		validationMethod: 'oninput',
		onResult
	}}
>
	<Input
		name="q"
		{methods}
		inputProps={{ placeholder: 'Search' }}
		on:input={() => handleInput(methods.submit)}
		on:keydown={(event) => {
			if (event.key === 'Enter') {
				clearTimeout(timer);
				showTimer = false;
				methods.submit(formElement);
			}
		}}
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
</Form>
