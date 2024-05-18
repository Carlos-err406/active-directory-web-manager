<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Content, Item, Root, Trigger } from '$lib/components/ui/dropdown-menu';
	export let base = $page.url.pathname;
	export let sizes = [10, 20, 50, 100, 150, 200];

	$: ({ searchParams } = $page.url);
	const getSizeParams = (pageSize: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', '1');
		params.set('pageSize', String(pageSize));
		return params.toString();
	};
</script>

<Root>
	<Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			size="icon"
			class="relative w-fit border px-3 py-1"
		>
			<span>Page size <slot>{$page.data.pagination?.pageSize || sizes[0]}</slot></span>
		</Button>
	</Trigger>
	<Content>
		{#each sizes as size}
			{@const sizeParams = getSizeParams(size)}
			<Item class="p-0">
				<a
					class="h-full w-full rounded px-3 py-1"
					class:bg-muted={size === $page.data.pagination?.pageSize}
					data-sveltekit-preload-data="hover"
					href="{base}?{sizeParams.toString()}"
				>
					{size}
				</a>
			</Item>
		{/each}
	</Content>
</Root>
