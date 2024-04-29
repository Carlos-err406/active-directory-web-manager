<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import Code from '$lucide/code.svelte';
	import PanelLeft from '$lucide/panel-left.svelte';
	import PanelRight from '$lucide/panel-right.svelte';
	import Settings from '$lucide/settings.svelte';
	import clsx from 'clsx';
	import { items } from './navigation.svelte';
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
						'flex items-center gap-4 px-2.5 py-3 text-muted-foreground transition-all hover:text-foreground',
						$page.url.pathname.startsWith(href) &&
							'border-l-4 border-l-primary bg-accent !text-foreground shadow-lg'
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
