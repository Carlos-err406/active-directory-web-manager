<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils';
	import Building2 from '$lucide/building-2.svelte';
	import Plus from '$lucide/plus.svelte';
	import User from '$lucide/user.svelte';
	import Users from '$lucide/users.svelte';
	import { createEventDispatcher } from 'svelte';
	export let open = false;
	const dispatch = createEventDispatcher();
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button size="icon" builders={[builder]}>
			<span class="sr-only">create entry</span>
			<Plus />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl">What kind of entry would you like to create?</Dialog.Title>
			<Dialog.Description>Select a type of entry to create in {'base'}</Dialog.Description>
		</Dialog.Header>
		<div class="grid grid-cols-3 place-items-center gap-2">
			<Button
				variant="ghost"
				on:click={() => {
					open = false;
					dispatch('create-user');
				}}
				type="button"
				class={cn(
					'flex aspect-square size-full flex-col gap-3 rounded px-3',
					'border-2 border-muted',
					'transition-all duration-200',
					'hover:-translate-x-2 hover:-translate-y-2 hover:border-primary hover:shadow-xl'
				)}
			>
				<User class="size-16" />
				<span class="text-xl">User</span>
			</Button>
			<Button
				variant="ghost"
				on:click={() => {
					open = false;
					dispatch('create-group');
				}}
				type="button"
				class={cn(
					'flex aspect-square size-full flex-col gap-3 rounded px-3',
					'border-2 border-muted',
					'transition-all duration-200',
					'hover:-translate-y-2 hover:border-primary hover:shadow-xl'
				)}
			>
				<Users class="size-16" />
				<span class="text-xl">Group</span>
			</Button>
			<Button
				variant="ghost"
				on:click={() => {
					open = false;
					dispatch('create-ou');
				}}
				type="button"
				class={cn(
					'flex aspect-square size-full flex-col gap-3 rounded px-3',
					'border-2 border-muted',
					'transition-all duration-200',
					'hover:-translate-y-2 hover:translate-x-2 hover:border-primary hover:shadow-xl'
				)}
			>
				<Building2 class="size-16" />
				<span class="text-xl">Organizational Unit</span>
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
