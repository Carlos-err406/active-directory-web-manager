<script lang="ts">
	import { page } from '$app/stores';
	import {
		Content,
		Ellipsis,
		Item,
		NextButton,
		PageSize,
		PrevButton,
		Root
	} from '$lib/components/ui/pagination';
	import type { PaginationWithUrls } from '$lib/pagination';
	import { cn } from '$lib/utils';
	import { Button } from '../button';
	$: pagination = $page.data.pagination as PaginationWithUrls<unknown>;
	$: ({ searchParams } = $page.url);
</script>

<Root
	class="mt-4"
	page={pagination.page}
	count={pagination.totalEntries}
	perPage={pagination.pageSize}
	let:pages
>
	<Content>
		<PageSize />
		<Item>
			<PrevButton disabled={!pagination.previousPage} href={pagination.previousPage} />
		</Item>
		{#each pages as pageObject (pageObject.key)}
			{@const pageParams = new URLSearchParams(searchParams)}
			{@const _ = pageParams.set('page', pageObject.value.toString())}
			{#if pageObject.type === 'ellipsis'}
				<Item>
					<Ellipsis />
				</Item>
			{:else}
				<Item>
					<Button
						class={cn(
							'size-9',
							pageObject.value === pagination.page && 'border',
							'hover:no-underline',
							'hover:border',
							'text-inherit'
						)}
						variant="link"
						href={new URL(
							`${$page.url.pathname}?${pageParams.toString()}`,
							$page.url.origin
						).toString()}
					>
						{pageObject.value}
					</Button>
				</Item>
			{/if}
		{/each}
		<Item>
			<NextButton disabled={!pagination.nextPage} href={pagination.nextPage} />
		</Item>
	</Content>
</Root>
