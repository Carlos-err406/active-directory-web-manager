<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { searchSchema } from '$lib/schemas/search-schema';
	import { Search } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Input from './input.svelte';
	const methods = superForm($page.data.form || { q: '' }, {
		validators: zodClient(searchSchema)
	});
	const { form: formData } = methods;
</script>

<form class="min-w-fit max-w-64" action="?/search" method="post" use:enhance>
	<Input
		name="q"
		{methods}
		value={$formData.q}
		inputProps={{ type: 'search', placeholder: 'Search' }}
	>
		<svelte:fragment slot="addornment-left">
			<Search />
		</svelte:fragment>
	</Input>
</form>
