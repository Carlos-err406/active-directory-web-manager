<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { DoorOpen, LogOut } from 'lucide-svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon" class="overflow-hidden rounded-full">
			<img
				src="/user-placeholder.jpg"
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
		<DropdownMenu.Item>Settings</DropdownMenu.Item>
		<DropdownMenu.Item>Support</DropdownMenu.Item>
		<DropdownMenu.Item class="justify-center p-0">
			<form method="post" action="/?/signOut" class="w-full">
				<Button type="submit" variant="destructive" class="w-full space-x-3">
					<span>Sign Out</span>
					<LogOut />
				</Button>
			</form>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
