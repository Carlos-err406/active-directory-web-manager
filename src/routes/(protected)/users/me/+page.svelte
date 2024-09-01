<script lang="ts">
	import { InfoValue, MemberofInfoValue } from '$/lib/components/info-value';
	import ParentInfoValue from '$/lib/components/info-value/parent-info-value.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Avatar, AvatarFallback, AvatarWithPreview } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { ChangePasswordDialog, UpdateUserDialog } from '$lib/components/users';
	import { getUserAccountControls } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { UserAccountControlTypes } from '$lib/types/user';
	import { getTreeUrlFromDn } from '$lib/utils';
	import FolderTree from '$lucide/folder-tree.svelte';
	import Info from '$lucide/info.svelte';
	import LockKeyhole from '$lucide/lock-keyhole.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import dayjs from 'dayjs';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let isChangePasswordDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	const { details: config } = $page.data.config.app.views.usersPage;
	setContext('config', config);
	$: ({ user, updateUserForm, session, memberOf, parent } = data);
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
	$: canSelfEdit = $page.data.config.app.nonAdmin.allowSelfEdit || session.isAdmin;
</script>

<div class="flex h-full w-full flex-col py-12 md:py-16" data-test="usersMePage">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				{#if config.jpegPhoto.show}
					<Avatar class="size-40 overflow-clip" data-test="userAvatar">
						<AvatarWithPreview alt="jpegPhoto" bind:src={jpegPhoto} />
						<AvatarFallback
							class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-6xl font-bold uppercase text-gray-100 dark:bg-gray-100 dark:text-gray-800"
						>
							{user.sAMAccountName.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
				{/if}
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl" data-test="userName">
					{user.displayName || user.sAMAccountName}
				</h1>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<InfoValue entry={user} key="sAMAccountName" />
				<InfoValue entry={user} key="displayName" />
				<InfoValue entry={user} key="givenName" />
				<InfoValue entry={user} key="sn" />
				<InfoValue entry={user} key="mail" />
				<InfoValue entry={user} key="description" />
				<InfoValue entry={user} key="userAccountControl">
					{getUserAccountControls(user.userAccountControl)
						.map((uac) => UserAccountControlTypes[uac])
						.join(', ')}
				</InfoValue>
				<InfoValue entry={user} key="whenCreated">
					{dayjs(user.whenCreated.replace('Z', '')).format('MMMM D, YYYY hh:mm:ss A')}
				</InfoValue>
				<InfoValue entry={user} key="whenChanged">
					{dayjs(user.whenChanged.replace('Z', '')).format('MMMM D, YYYY hh:mm:ss A')}
				</InfoValue>
				<InfoValue entry={user} key="distinguishedName" />
				<ParentInfoValue {parent} />
				<MemberofInfoValue {memberOf} />
			</div>
		</div>
	</div>
	<div class="mt-auto flex w-full items-center justify-center gap-3 py-3">
		{#if $page.data.config.app.views.treePage.show && ($page.data.config.app.nonAdmin.allowAccessToTreePage || session.isAdmin)}
			<Button href={getTreeUrlFromDn(user.dn)} class="flex items-center gap-2">
				<FolderTree class="size-4 flex-none" />
				View in tree
			</Button>
		{/if}
		<Button
			disabled={!canSelfEdit}
			class="flex items-center gap-2"
			on:click={onOpenEditClick}
			data-test="userEdit"
		>
			<PencilLine class="size-4 flex-none" />
			Edit
		</Button>
		<Button
			disabled={!canSelfEdit}
			class="flex items-center gap-2"
			on:click={() => (isChangePasswordDialogOpen = true)}
			data-test="userChangePassword"
		>
			<LockKeyhole class="size-4 flex-none" />
			Change password
		</Button>
	</div>
	{#if !canSelfEdit}
		<div
			class="flex w-full items-center justify-center gap-3 text-muted-foreground"
			data-test="disabledSelfUpdate"
		>
			<Info /> Self update is disabled by configuration for non-admin users
		</div>
	{/if}
</div>
<UpdateUserDialog
	dn={user.distinguishedName}
	bind:open={isUpdateUserDialogOpen}
	bind:form={updateUserForm}
	on:name-change={() => invalidateAll()}
/>
<ChangePasswordDialog dn={user.distinguishedName} bind:open={isChangePasswordDialogOpen} />
