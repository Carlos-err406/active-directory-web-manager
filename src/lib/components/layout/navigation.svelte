<script lang="ts">
	import { page } from '$app/stores';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { Session } from '$lib/types/session';
	import Code from 'lucide-svelte/icons/code';
	import Settings from 'lucide-svelte/icons/settings';
	import { getNavigationItems } from '.';
	import NavigationItem from './navigation-item.svelte';
	$: session = $page.data.session as Session;
</script>

<aside
	class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex"
	data-test="sideNavigation"
>
	<nav class="flex h-full flex-col items-center gap-4 px-2 py-4">
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<div use:builder.action {...builder}>
					<Code />
					<span class="sr-only">Console</span>
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Console</Tooltip.Content>
		</Tooltip.Root>
		<hr class="w-full bg-muted" />
		{#each getNavigationItems($page.data.config, session.isAdmin) as { href, icon, name }}
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<NavigationItem {href} {builder}>
						<svelte:component this={icon} class="size-5" />
						<span class="sr-only">{name}</span>
					</NavigationItem>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">{name}</Tooltip.Content>
			</Tooltip.Root>
		{/each}
		<hr class="mt-auto w-full bg-muted" />
		<nav class="flex flex-col items-center gap-4 px-2 py-4">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<NavigationItem href={'/settings'} {builder}>
						<Settings class="size-5" />
						<span class="sr-only">Settings</span>
					</NavigationItem>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Settings</Tooltip.Content>
			</Tooltip.Root>
		</nav>
	</nav>
</aside>
