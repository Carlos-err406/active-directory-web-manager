<script lang="ts">
	import { getNavigationItems } from '$/lib/components/layout/index.js';
	import type { Session } from '$/lib/types/session';
	import { page } from '$app/stores';
	import Header from '$lib/components/layout/header.svelte';
	import Navigation from '$lib/components/layout/navigation.svelte';
	import { derived } from 'svelte/store';
	const session = derived(page, (page) => page.data.session as Session);
	const config = derived(page, (page) => page.data.config);
	const items = derived([session, config], () => getNavigationItems($config, $session.isAdmin));
</script>

<div class="absolute h-full max-h-svh w-full overflow-y-auto rounded bg-muted/40">
	<Navigation />
	<div
		data-have-navigation={$items.length > 0}
		class="flex h-full w-full flex-col sm:gap-4 sm:py-4 data-[have-navigation=true]:sm:pl-12"
	>
		<Header />
		<main class="flex h-[calc(100svh-4rem-10px)] w-full rounded p-3">
			<slot />
		</main>
	</div>
</div>
