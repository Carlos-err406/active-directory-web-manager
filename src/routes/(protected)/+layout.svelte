<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import Header from '$lib/components/layout/header.svelte';
	import Navigation from '$lib/components/layout/navigation.svelte';
	import { breadcrumbs } from '$lib/stores';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	const showSearch = writable<boolean>(true);
	setContext('showSearch', showSearch);
	afterNavigate(() => {
		switch ($page.url.pathname) {
			case paths.groups.list:
				breadcrumbs.set([{ name: 'Groups' }]);
				break;
			case paths.users.list:
				breadcrumbs.set([{ name: 'Users' }]);
				break;
			case paths.users.me:
				breadcrumbs.set([{ name: 'Users', link: '/users' }, { name: 'Me' }]);
				break;
			case paths.ous.list:
				breadcrumbs.set([{ name: 'Organizational Units' }]);
				break;
			case paths.logs.list:
				breadcrumbs.set([{ name: 'Logs' }]);
				break;
			case paths.settings:
				breadcrumbs.set([{ name: 'Settings' }]);
				break;
			default:
				breadcrumbs.set([]);
		}
	});
</script>

<div class="absolute h-full w-full rounded bg-muted/40">
	<Navigation />
	<div class="flex h-full w-full flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<Header />
		<main class="flex h-full w-full rounded p-3">
			<slot />
		</main>
	</div>
</div>
