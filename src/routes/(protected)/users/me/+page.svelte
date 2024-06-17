<script lang="ts">
	import { Avatar, AvatarFallback, AvatarWithPreview } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { ChangePasswordDialog, UpdateUserDialog } from '$lib/components/users';
	import { breadcrumbs } from '$lib/stores';
	import LockKeyhole from '$lucide/lock-keyhole.svelte';
	import PencilLine from '$lucide/pen-line.svelte';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ user, updateUserForm } = data);
	$: ({ jpegPhoto, ...rest } = user);
	breadcrumbs.set([{ name: 'Users', link: '/users' }, { name: 'Me' }]);
	let isChangePasswordDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	const handleEditButtonClicked = () => {
		updateUserForm.data = {
			...updateUserForm.data,
			...rest,
			jpegPhotoBase64: jpegPhoto
		};
		isUpdateUserDialogOpen = true;
	};
</script>

<div class="flex h-full w-full flex-col py-12 md:py-16">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<Avatar class="size-40 overflow-clip uppercase">
					<AvatarWithPreview alt="jpgPhoto" src={jpegPhoto} />
					<AvatarFallback
						class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-6xl font-bold text-gray-100 dark:bg-gray-100 dark:text-gray-800"
					>
						{user.sAMAccountName.slice(0, 2)}
					</AvatarFallback>
				</Avatar>
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">{user.sAMAccountName}</h1>
			</div>
			<div class="user-info grid grid-cols-2 gap-y-3">
				<span>sAMAccountName:</span>
				<span class="info-value">{user.sAMAccountName}</span>
				{#if user.displayName}
					<span>displayName:</span>
					<span class="info-value">{user.displayName}</span>
				{/if}
				{#if user.givenName}
					<span>givenName:</span>
					<span class="info-value">{user.givenName}</span>
				{/if}
				{#if user.sn}
					<span>sn:</span>
					<span class="info-value">{user.sn}</span>
				{/if}
				{#if user.description}
					<span>description:</span>
					<span class="info-value">{user.description}</span>
				{/if}
				<span>whenCreated:</span>
				<span class="info-value">
					{dayjs(user.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>whenChanged:</span>
				<span class="info-value">
					{dayjs(user.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>distinguishedName:</span>
				<span class="info-value">{user.distinguishedName}</span>
				<span>memberOf:</span>
				<div class="info-value flex flex-wrap space-y-2">
					{#each user.memberOf || [] as groupDn}
						<span>
							{groupDn}
						</span>
					{:else}
						<span> - </span>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<div class="flex h-full w-full items-center justify-center gap-3 py-3">
		<Button class="flex items-center gap-2" on:click={handleEditButtonClicked}>
			<PencilLine class="size-4 flex-none" />
			Edit
		</Button>
		<Button class="flex items-center gap-2" on:click={() => (isChangePasswordDialogOpen = true)}>
			<LockKeyhole class="size-4 flex-none" />
			Change password
		</Button>
	</div>
</div>
<UpdateUserDialog
	dn={user.distinguishedName}
	bind:open={isUpdateUserDialogOpen}
	bind:form={updateUserForm}
/>
<ChangePasswordDialog dn={user.distinguishedName} bind:open={isChangePasswordDialogOpen} />
