<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Content, Item, Root, Trigger } from '$lib/components/ui/dropdown-menu';
	export let base = $page.url.pathname;
	export let sizes = [10, 20, 50, 100, 150, 200];
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
			<Item class="p-0">
				<a
					class="h-full w-full py-1 px-3 rounded"
					class:bg-muted={size === $page.data.pagination?.pageSize}
					data-sveltekit-preload-data="hover"
					href="{base}?page=1&pageSize={size}">{size}</a
				>
			</Item>
		{/each}
	</Content>
</Root>
