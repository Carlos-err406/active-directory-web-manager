<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Session } from '$lib/types/session';
	import LogOut from '$lucide/log-out.svelte';
	import { Avatar } from '../ui/avatar';
	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte';
	import AvatarImage from '../ui/avatar/avatar-image.svelte';
	$: ({ jpegPhoto } = $page.data);
	$: session = $page.data.session as Session;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			size="icon"
			class="h-fit w-fit overflow-hidden rounded-full"
		>
			<Avatar class="flex size-10 items-center justify-center">
				<AvatarImage class="size-full" src={jpegPhoto} />
				<AvatarFallback
					class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-xl font-bold text-gray-100 dark:bg-gray-100 dark:text-gray-800"
				>
					{session.sAMAccountName.slice(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>My Account</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.LinkItem href={paths.users.me} disabled={$page.url.pathname === paths.users.me}>
			See profile
		</DropdownMenu.LinkItem>
		<DropdownMenu.Separator class="my-2" />
		<DropdownMenu.Item class="justify-center p-0">
			<form method="post" action={paths.auth.actions.signOut} class="w-full" use:enhance>
				<Button type="submit" variant="destructive" class="w-full space-x-3">
					<span>Sign Out</span>
					<LogOut />
				</Button>
			</form>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
