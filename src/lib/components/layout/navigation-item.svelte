<script lang="ts" context="module">
	import type { Icon } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';
	export interface NavigationItemType {
		name: string;
		href: string;
		icon: ComponentType<Icon>;
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import type { Builder } from 'bits-ui';

	export let href: string;
	export let builder: Builder;
</script>

<a
	{href}
	data-sveltekit-preload-data="hover"
	class={cn(
		'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:text-foreground md:h-8 md:w-8',
		$page.url.pathname.startsWith(href) &&
			'border-b-2 border-r-2 border-b-primary border-r-primary bg-accent !text-foreground shadow-lg'
	)}
	use:builder.action
	{...builder}
>
	<slot />
</a>
