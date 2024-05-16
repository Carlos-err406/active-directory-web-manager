<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	export let href: string;
</script>

<a
	data-sveltekit-preload-data="hover"
	{href}
	class={cn(
		'flex items-center gap-4 px-2.5 py-3 text-muted-foreground transition-all hover:text-foreground',
		$page.url.pathname.startsWith(href) &&
			'border-l-4 border-l-primary bg-accent !text-foreground shadow-lg'
	)}
>
	<slot />
</a>
