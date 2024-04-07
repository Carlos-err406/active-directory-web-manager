<script>
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Code, PanelLeft, PanelRight, Settings } from 'lucide-svelte';
	import { items } from './navigation.svelte';
	import clsx from 'clsx';
	import { page } from '$app/stores';
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
			{#if builder['aria-expanded'] === false}
				<PanelLeft class="h-5 w-5" />
			{:else}
				<PanelRight />
			{/if}
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="left" class="sm:max-w-xs">
		<nav class="flex h-full flex-col gap-4 text-lg font-medium">
			<div class="flex items-center gap-4 px-2.5 text-foreground">
				<Code />
				Console
			</div>
			<hr class="w-full bg-muted" />
			{#each items as { name, icon, href }}
				<a
					data-sveltekit-preload-data="hover"
					{href}
					class={clsx(
						'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground transition-all py-3',
						$page.url.pathname.startsWith(href) && 'border-l-4 border-l-primary bg-accent shadow-lg !text-foreground'
					)}
				>
					<svelte:component this={icon} class="h-5 w-5" />
					{name}
				</a>
			{/each}
			<hr class="mt-auto w-full bg-muted" />
			<a
				data-sveltekit-preload-data="hover"
				href="/settings"
				class="flex items-center gap-4 justify-self-end px-2.5 text-muted-foreground hover:text-foreground"
			>
				<Settings class="h-5 w-5" />
				Settings
			</a>
		</nav>
	</Sheet.Content>
</Sheet.Root>
