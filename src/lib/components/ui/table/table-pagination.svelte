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
	const getPageParams = (value: string | number) => {
		const pageParams = new URLSearchParams(searchParams);
		pageParams.set('page', String(value));
		return pageParams;
	};
</script>

<Root
	class="mt-4"
	page={pagination.page}
	count={pagination.totalEntries}
	perPage={pagination.pageSize}
	let:pages
>
	<Content class="flex w-full justify-end">
		<PageSize />
		<Item>
			<PrevButton disabled={!pagination.previousPage} href={pagination.previousPage} />
		</Item>
		{#each pages as pageObject (pageObject.key)}
			{#if pageObject.type === 'ellipsis'}
				<Item>
					<Ellipsis />
				</Item>
			{:else}
				{@const pageParams = getPageParams(pageObject.value)}
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
						href="{$page.url.pathname}?{pageParams.toString()}"
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
