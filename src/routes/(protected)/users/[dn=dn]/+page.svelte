<script lang="ts">
	import { paths } from '$lib';
	import { Avatar, AvatarFallback, AvatarWithPreview } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import ChangePasswordDialog from '$lib/components/users/change-password-dialog.svelte';
	import DeleteUserDialog from '$lib/components/users/delete-user-dialog.svelte';
	import UpdateUserDialog from '$lib/components/users/update-user-dialog.svelte';
	import { breadcrumbs } from '$lib/stores';
	import LockKeyhole from '$lucide/lock-keyhole.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import dayjs from 'dayjs';
	import { Trash2 } from 'lucide-svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let isChangePasswordDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	let isDeleteUserDialogOpen = false;

	$: ({ user, updateUserForm } = data);
	$: ({ jpegPhoto, sAMAccountName } = user);

	$: breadcrumbs.set([{ name: 'Users', link: paths.users.list }, { name: sAMAccountName }]);

	const onOpenEditClick = () => {
		const { jpegPhoto, ...restAttributes } = user;
		updateUserForm.data = {
			...updateUserForm.data,
			...restAttributes,
			jpegPhotoBase64: jpegPhoto
		};
		isUpdateUserDialogOpen = true;
	};
</script>

<div class="flex h-full w-full flex-col py-12 md:py-16">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<Avatar class="size-40 overflow-clip">
					<AvatarWithPreview alt="jpegPhoto" bind:src={jpegPhoto} />
					<AvatarFallback
						class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-6xl font-bold uppercase text-gray-100 dark:bg-gray-100 dark:text-gray-800"
					>
						{user.sAMAccountName.slice(0, 2)}
					</AvatarFallback>
				</Avatar>
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
					{user.displayName || user.sAMAccountName}
				</h1>
			</div>
			<div class="user-info grid grid-cols-2 gap-y-3">
				<span>sAMAccountName:</span>
				<span class="user-info-value">{user.sAMAccountName}</span>
				{#if user.displayName}
					<span>displayName:</span>
					<span class="user-info-value">{user.displayName}</span>
				{/if}
				{#if user.givenName}
					<span>givenName:</span>
					<span class="user-info-value">{user.givenName}</span>
				{/if}
				{#if user.sn}
					<span>sn:</span>
					<span class="user-info-value">{user.sn}</span>
				{/if}
				{#if user.description}
					<span>description:</span>
					<span class="user-info-value">{user.description}</span>
				{/if}
				<span>whenCreated:</span>
				<span class="user-info-value">
					{dayjs(user.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>whenChanged:</span>
				<span class="user-info-value">
					{dayjs(user.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>distinguishedName:</span>
				<span class="user-info-value">{user.distinguishedName}</span>
				<span>memberOf:</span>
				<div class="user-info-value flex flex-wrap space-y-2">
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
	<div class="flex h-full w-full items-center justify-center gap-3">
		<Button class="flex items-center gap-2" on:click={onOpenEditClick}>
			<PencilLine class="size-4 flex-none" />
			Edit
		</Button>
		<Button class="flex items-center gap-2" on:click={() => (isChangePasswordDialogOpen = true)}>
			<LockKeyhole class="size-4 flex-none" />
			Change password
		</Button>
		<Button
			variant="destructive"
			class="flex items-center gap-2"
			on:click={() => (isDeleteUserDialogOpen = true)}
		>
			<Trash2 class="size-4 flex-none" />
			Delete user
		</Button>
	</div>
</div>
<DeleteUserDialog dn={user.distinguishedName} bind:open={isDeleteUserDialogOpen} />
<ChangePasswordDialog dn={user.distinguishedName} bind:open={isChangePasswordDialogOpen} />
<UpdateUserDialog
	dn={user.distinguishedName}
	bind:open={isUpdateUserDialogOpen}
	bind:form={updateUserForm}
/>
