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
			case paths.logs:
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

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<Navigation />
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<Header />
		<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			<slot />
		</main>
	</div>
</div>
