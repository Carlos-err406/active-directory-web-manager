<script lang="ts">
	import InfoValue from '$/lib/components/info-value.svelte';
	import ParentInfoValue from '$/lib/components/parent-info-value.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Avatar, AvatarFallback, AvatarWithPreview } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { ChangePasswordDialog, DeleteUserDialog, UpdateUserDialog } from '$lib/components/users';
	import { getCNFromDN, getUserAccountControls } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { UserAccountControlTypes } from '$lib/types/user';
	import { buildBreadcrumbsFromDn, getTreeUrlFromDn } from '$lib/utils';
	import FolderTree from '$lucide/folder-tree.svelte';
	import LockKeyhole from '$lucide/lock-keyhole.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash2 from '$lucide/trash-2.svelte';
	import dayjs from 'dayjs';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let isChangePasswordDialogOpen = false;
	let isUpdateUserDialogOpen = false;
	let isDeleteUserDialogOpen = false;
	const { details: config } = $page.data.config.app.views.usersPage;
	setContext('config', config);
	setContext('entry', data.user);

	$: ({ user, updateUserForm, session, parent } = data);
	$: breadcrumbs.set([
		{ name: 'Users', link: '/users' },
		...buildBreadcrumbsFromDn(user.dn, 'users')
	]);

	const onOpenEditClick = () => {
		const { jpegPhoto, ...restAttributes } = user;
		updateUserForm.data = {
			...updateUserForm.data,
			...restAttributes,
			jpegPhotoBase64: jpegPhoto
		};
		isUpdateUserDialogOpen = true;
	};
	const showGroupsAsLinks =
		data.session.isAdmin || $page.data.config.app.nonAdmin.allowAccessToGroupsPage;
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
			<div class="user-info grid grid-cols-2 gap-y-3">
				<InfoValue key="sAMAccountName" />
				<InfoValue key="displayName" />
				<InfoValue key="givenName" />
				<InfoValue key="sn" />
				<InfoValue key="mail" />
				<InfoValue key="description" />
				<InfoValue key="userAccountControl">
					{getUserAccountControls(user.userAccountControl)
						.map((uac) => UserAccountControlTypes[uac])
						.join(', ')}
				</InfoValue>
				<InfoValue key="whenCreated">
					{dayjs(user.whenCreated.replace('Z', '')).format('MMMM D, YYYY hh:mm:ss A')}
				</InfoValue>
				<InfoValue key="whenChanged">
					{dayjs(user.whenChanged.replace('Z', '')).format('MMMM D, YYYY hh:mm:ss A')}
				</InfoValue>
				<InfoValue key="distinguishedName" />
				<ParentInfoValue {parent} />

				{#if config.memberOf.show}
					<span>{config.memberOf.label}:</span>
					<div class="info-value flex flex-wrap space-y-2">
						{#each (user.memberOf || []).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) as dn, index}
							<svelte:element
								this={showGroupsAsLinks ? 'a' : 'span'}
								data-sveltekit-preload-data="hover"
								data-isLink={showGroupsAsLinks}
								class="data-[isLink=true]:text-primary data-[isLink=true]:hover:underline"
								href={showGroupsAsLinks ? `/groups/${encodeURIComponent(dn)}` : '#'}
							>
								{config.memberOf.shortMemberOf ? getCNFromDN(dn) : dn}
							</svelte:element>
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
