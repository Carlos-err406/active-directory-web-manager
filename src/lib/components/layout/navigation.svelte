<script lang="ts" context="module">
	import Building2 from '$lucide/building-2.svelte';
	import Code from '$lucide/code.svelte';
	import FileTextIcon from '$lucide/file-text.svelte';
	import FolderTree from '$lucide/folder-tree.svelte';
	import Settings from '$lucide/settings.svelte';
	import User from '$lucide/user.svelte';
	import Users from '$lucide/users.svelte';

	export const items: NavigationItemType[] = [
		{ href: '/users', name: 'Users', icon: User },
		{ href: '/groups', name: 'Groups', icon: Users },
		{
			href: '/ous',
			name: 'Organizational Units',
			icon: Building2
		},
		{ href: '/tree', name: 'Tree view', icon: FolderTree },
		{
			href: `/logs?fromDate=${dayjs().subtract(2, 'days').format('YYYY-MM-DD')}&toDate=${dayjs().format('YYYY-MM-DD')}`,
			name: 'Logs',
			icon: FileTextIcon
		}
	];
</script>

<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import NavigationItem, { type NavigationItemType } from './navigation-item.svelte';
	import dayjs from 'dayjs';
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
