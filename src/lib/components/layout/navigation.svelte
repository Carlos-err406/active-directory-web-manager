<script lang="ts" context="module">
	export interface NavigationItem {
		name: string;
		href: string;
		icon: typeof SvelteComponent;
	}
	import { Building2, Code, FileTextIcon, Settings, User, Users } from 'lucide-svelte';
	import type { SvelteComponent } from 'svelte';
	export const items: NavigationItem[] = [
		{ href: '/users', name: 'Users', icon: User as typeof SvelteComponent },
		{ href: '/groups', name: 'Groups', icon: Users as typeof SvelteComponent },
		{ href: '/ous', name: 'Organizational Units', icon: Building2 as typeof SvelteComponent },
		{ href: '/logs', name: 'Logs', icon: FileTextIcon as typeof SvelteComponent }
	];
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import clsx from 'clsx';
</script>

<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
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
		{#each items as { href, icon, name }}
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						{href}
						data-sveltekit-preload-data="hover"
						class={clsx(
							'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
							$page.url.pathname.startsWith(href) &&
								'border-l-2 border-l-primary bg-accent !text-foreground shadow-lg'
						)}
						use:builder.action
						{...builder}
					>
						<svelte:component this={icon} class="h-5 w-5" />
						<span class="sr-only">{name}</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">{name}</Tooltip.Content>
			</Tooltip.Root>
		{/each}
		<hr class="mt-auto w-full bg-muted" />
		<nav class="flex flex-col items-center gap-4 px-2 py-4">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						data-sveltekit-preload-data="hover"
						href="/settings"
						class={clsx(
							'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
							$page.url.pathname === '/settings' &&
								'border-l-2 border-l-primary bg-accent !text-foreground shadow-lg'
						)}
						use:builder.action
						{...builder}
					>
						<Settings class="h-5 w-5" />
						<span class="sr-only">Settings</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Settings</Tooltip.Content>
			</Tooltip.Root>
		</nav>
	</nav>
</aside>
