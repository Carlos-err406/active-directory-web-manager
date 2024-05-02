<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Session } from '$lib/types/session';
	import LogOut from '$lucide/log-out.svelte';
	$: ({ jpegPhoto } = $page.data.session as Session);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon" class="overflow-hidden rounded-full">
			<img
				src={jpegPhoto.length ? jpegPhoto : '/user-placeholder.jpg'}
				width={36}
				height={36}
				alt="Avatar"
				class="overflow-hidden"
			/>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>My Account</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item disabled={$page.url.pathname === paths.users.me}>
			<a data-sveltekit-preload-data href={paths.users.me}> See profile </a>
		</DropdownMenu.Item>
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
