<script lang="ts">
	import SearchForm from '$lib/components/form/search-form.svelte';
	import Avatar from './avatar.svelte';
	import NavigationSheet from './navigation-sheet.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { breadcrumbs } from '$lib/stores';
</script>

<header
	class="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
>
	<div class="flex items-center gap-4">
		<NavigationSheet />
		<SearchForm />
		<Breadcrumb.Root class="hidden md:flex">
			<Breadcrumb.List>
				{#each $breadcrumbs as item, index}
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
