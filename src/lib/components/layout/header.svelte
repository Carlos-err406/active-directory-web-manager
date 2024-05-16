<script lang="ts">
	import { page } from '$app/stores';
	import SearchForm from '$lib/components/form/search-form.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { breadcrumbs } from '$lib/stores';
	import Avatar from './avatar.svelte';
	import NavigationSheet from './navigation-sheet.svelte';
</script>

<header
	class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
>
	<div class="flex w-full items-center gap-4">
		<NavigationSheet />
		{#if $page.data.showSearch}
			<SearchForm />
		{/if}
		<Breadcrumb.Root class="hidden md:flex">
			<Breadcrumb.List class="!flex-nowrap">
				{#each $breadcrumbs as item, index (item.name)}
					<Breadcrumb.Item>
						{#if item.link}
							<Breadcrumb.Link href={item.link}>{item.name}</Breadcrumb.Link>
						{:else}
							<Breadcrumb.Page>{item.name}</Breadcrumb.Page>
						{/if}
					</Breadcrumb.Item>
					{#if index < $breadcrumbs.length - 1}
						<Breadcrumb.Separator />
					{/if}
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
	<Avatar />
</header>
