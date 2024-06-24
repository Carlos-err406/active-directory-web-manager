<script lang="ts">
	import { page } from '$app/stores';
	import { Avatar, AvatarFallback, AvatarWithPreview } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { ChangePasswordDialog, UpdateUserDialog } from '$lib/components/users';
	import { getCNFromDN, getUserAccountControls } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { UserAccountControlTypes } from '$lib/types/user';
	import LockKeyhole from '$lucide/lock-keyhole.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	export let data: PageData;

	let isChangePasswordDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	const { details: config } = $page.data.config.app.views.usersPage;
	$: ({ user, updateUserForm } = data);
	$: ({ jpegPhoto, sAMAccountName } = user);

	$: breadcrumbs.set([{ name: 'Users', link: '/users' }, { name: sAMAccountName }]);

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
				{#if config.jpegPhoto.show}
					<Avatar class="size-40 overflow-clip">
						<AvatarWithPreview alt="jpegPhoto" bind:src={jpegPhoto} />
						<AvatarFallback
							class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-6xl font-bold uppercase text-gray-100 dark:bg-gray-100 dark:text-gray-800"
						>
							{user.sAMAccountName.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
				{/if}
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
					{user.displayName || user.sAMAccountName}
				</h1>
			</div>
			<div class="user-info grid grid-cols-2 gap-y-3">
				{#if config.sAMAccountName.show}
					<span>{config.sAMAccountName.label}:</span>
					<span class="info-value">{user.sAMAccountName}</span>
				{/if}
				{#if config.displayName.show && user.displayName}
					<span>{config.displayName.label}:</span>
					<span class="info-value">{user.displayName}</span>
				{/if}
				{#if config.givenName.show && user.givenName}
					<span>{config.givenName.label}:</span>
					<span class="info-value">{user.givenName}</span>
				{/if}
				{#if config.sn.show && user.sn}
					<span> {config.sn.label}:</span>
					<span class="info-value">{user.sn}</span>
				{/if}
				{#if config.mail.show && user.mail}
					<span>{config.mail.label}:</span>
					<span class="info-value">{user.mail}</span>
				{/if}
				{#if config.description.show && user.description}
					<span>{config.description.label}:</span>
					<span class="info-value">{user.description}</span>
				{/if}
				{#if config.userAccountControl.show}
					<span>{config.userAccountControl.label}:</span>
					<span class="info-value">
						{getUserAccountControls(user.userAccountControl)
							.map((uac) => UserAccountControlTypes[uac])
							.join(', ')}
					</span>
				{/if}
				{#if config.whenCreated.show}
					<span>{config.whenCreated.label}:</span>
					<span class="info-value">
						{dayjs(user.whenCreated.replace('Z', '')).format('MMMM D, YYYY hh:mm:ss A')}
					</span>
				{/if}
				{#if config.whenChanged.show}
					<span>{config.whenChanged.label}:</span>
					<span class="info-value">
						{dayjs(user.whenChanged.replace('Z', '')).format('MMMM D, YYYY hh:mm:ss A')}
					</span>
				{/if}
				{#if config.distinguishedName.show}
					<span>{config.distinguishedName.label}:</span>
					<span class="info-value">{user.distinguishedName}</span>
				{/if}
				{#if config.memberOf.show}
					<span>{config.memberOf.label}:</span>
					<div class="info-value flex flex-wrap space-y-2">
						{#each (user.memberOf || []).sort( (a, b) => (a < b ? -1 : a > b ? 1 : 0) ) as groupDn, index}
							<a
								href="/groups/{groupDn}"
								data-sveltekit-preload-data="hover"
								class="text-primary hover:underline"
							>
								{config.memberOf.shortMemberOf ? getCNFromDN(groupDn) : groupDn}
							</a>
							{#if config.memberOf.shortMemberOf && index < user.memberOf.length - 1}
								<pre class="!mx-0 font-sans">, </pre>
							{/if}
						{:else}
							<span> - </span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="flex h-full w-full items-center justify-center gap-3 py-3">
		<Button class="flex items-center gap-2" on:click={onOpenEditClick}>
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
