<script lang="ts">
	import { InfoValue, MemberofInfoValue, ParentInfoValue } from '$/lib/components/info-value';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Avatar, AvatarFallback, AvatarWithPreview } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		ChangePasswordDialog,
		DeleteUserDialog,
		ManageUserMembershipDialog,
		UpdateUserDialog
	} from '$lib/components/users';
	import { getUserAccountControlMatches, getUserAccountControls } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { UserAccountControlTypes } from '$lib/types/user';
	import { buildBreadcrumbsFromDn, getTreeUrlFromDn } from '$lib/utils';
	import FolderTree from '$lucide/folder-tree.svelte';
	import LockKeyhole from '$lucide/lock-keyhole.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash2 from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
	import dayjs from 'dayjs';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let isChangePasswordDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	let isDeleteUserDialogOpen = false;
	let isManageMembershipDialogOpen = false;

	const { details: config } = $page.data.config.app.views.usersPage;
	setContext('config', config);

	$: ({ user, updateUserForm, session, parent, memberOf } = data);
	$: breadcrumbs.set([
		{ name: 'Users', link: '/users' },
		...buildBreadcrumbsFromDn(user.dn, 'users')
	]);

	const onOpenEditClick = () => {
		const { jpegPhoto, ...restAttributes } = user;
		const uacMatches = getUserAccountControlMatches(user.userAccountControl);

		updateUserForm.data = {
			...updateUserForm.data,
			...restAttributes,
			...uacMatches.reduce((acc, match) => ({ ...acc, [`uac.${match}`]: true }), {}),
			jpegPhotoBase64: jpegPhoto
		};
		isUpdateUserDialogOpen = true;
	};
</script>

<div class="flex h-full w-full flex-col py-12 md:py-16" data-test="usersDnPage">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				{#if config.jpegPhoto.show}
					<Avatar class="size-40 overflow-clip">
						<AvatarWithPreview alt="jpegPhoto" bind:src={user.jpegPhoto} />
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
	<div class="flex h-full w-full items-center justify-center gap-3 py-3">
		{#if $page.data.config.app.views.treePage.show && (session.isAdmin || $page.data.config.app.nonAdmin.allowAccessToTreePage)}
			<Button href={getTreeUrlFromDn(user.dn)} class="flex items-center gap-2">
				<FolderTree class="size-4 flex-none" />
				View in tree
			</Button>
		{/if}
		{#if data.session.isAdmin}
			<Button class="flex items-center gap-2" on:click={onOpenEditClick}>
				<PencilLine class="size-4 flex-none" />
				Edit
			</Button>
			<Button class="flex flex-nowrap gap-2" on:click={() => (isManageMembershipDialogOpen = true)}>
				<Users class="size-5" />
				Manage groups
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
		{/if}
	</div>
</div>
<DeleteUserDialog
	dn={user.distinguishedName}
	bind:open={isDeleteUserDialogOpen}
	on:deleted={() => goto('/users', { invalidateAll: true })}
/>
<ChangePasswordDialog dn={user.distinguishedName} bind:open={isChangePasswordDialogOpen} />
<UpdateUserDialog
	dn={user.dn}
	bind:open={isUpdateUserDialogOpen}
	bind:form={updateUserForm}
	on:name-change={async ({ detail }) => {
		await goto(`/users/${encodeURIComponent(detail.newDn)}`, { invalidateAll: true });
	}}
/>
<ManageUserMembershipDialog dn={user.distinguishedName} bind:open={isManageMembershipDialogOpen} />
