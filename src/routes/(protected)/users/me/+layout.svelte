<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const showSearch = getContext<Writable<boolean>>('showSearch');
	showSearch.set(false);
	beforeNavigate((navigation) => {
		showSearch.set(navigation.to?.url.pathname !== $page.url.pathname);
	});
</script>

<slot />
