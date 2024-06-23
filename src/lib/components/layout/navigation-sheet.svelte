<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import Code from '$lucide/code.svelte';
	import PanelLeft from '$lucide/panel-left.svelte';
	import PanelRight from '$lucide/panel-right.svelte';
	import Settings from '$lucide/settings.svelte';
	import { getNavigationItems } from '.';
	import SheetNavigationItem from './sheet-navigation-item.svelte';
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
			{#if builder['aria-expanded'] === false}
				<PanelLeft class="size-5" />
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
			{#each getNavigationItems($page.data.config) as { name, icon, href }}
				<SheetNavigationItem {href}>
					<svelte:component this={icon} class="size-5" />
					{name}
				</SheetNavigationItem>
			{/each}
			<hr class="mt-auto w-full bg-muted" />
			<SheetNavigationItem href={'/settings'}>
				<Settings class="size-5" />
				Settings
			</SheetNavigationItem>
		</nav>
	</Sheet.Content>
</Sheet.Root>
