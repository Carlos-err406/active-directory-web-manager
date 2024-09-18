<script lang="ts">
	import { InfoValue, MemberInfoValue, ParentInfoValue } from '$/lib/components/info-value';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { DeleteGroupDialog, UpdateGroupDialog } from '$lib/components/groups';
	import ManageGroupMembersDialog from '$lib/components/groups/manage-group-members-dialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getGroupTypes } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { GroupFlags, GroupTypes } from '$lib/types/group';
	import { buildBreadcrumbsFromDn, getTreeUrlFromDn } from '$lib/utils';
	import dayjs from 'dayjs';
	import FolderTree from 'lucide-svelte/icons/folder-tree';
	import PencilLine from 'lucide-svelte/icons/pencil-line';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Users from 'lucide-svelte/icons/users';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ group, updateGroupForm, members, session, parent } = data);
	$: breadcrumbs.set([
		{ name: 'Groups', link: '/groups' },
		...buildBreadcrumbsFromDn(group.dn, 'groups')
	]);
	const { details: config } = $page.data.config.app.views.groupsPage;
	setContext('config', config);
	let isUpdateGroupDialogOpen = false;
	let isManageMembersDialogOpen = false;
	let isDeleteGroupDialogOpen = false;
	const onOpenEditClick = () => {
		const [match] = getGroupTypes(group.groupType).filter(
			(gt) => gt !== GroupFlags['Global Scope']
		);
		updateGroupForm.data = {
			...updateGroupForm.data,
			...group,
			groupType: match
		};
		isUpdateGroupDialogOpen = true;
	};
</script>

<div class="flex h-full w-full flex-col gap-4 py-12 md:p-10" data-test="groupsDnPage">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
					{group.sAMAccountName}
				</h1>
			</div>
			<div class="group-info grid grid-cols-2 gap-4">
				<InfoValue entry={group} key="sAMAccountName" />
				<InfoValue entry={group} key="cn" />
				<InfoValue entry={group} key="description" />
				<InfoValue entry={group} key="mail" />
				<InfoValue entry={group} key="distinguishedName" />
				<InfoValue entry={group} key="groupType">
					{getGroupTypes(group.groupType)
						.map((gt) => GroupTypes[gt])
						.join(', ')}
				</InfoValue>
				<InfoValue entry={group} key="whenCreated">
					{dayjs(group.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</InfoValue>
				<InfoValue entry={group} key="whenChanged">
					{dayjs(group.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</InfoValue>
				<ParentInfoValue {parent} />
				<MemberInfoValue {members} />
			</div>
		</div>
	</div>
	<div class="flex h-full w-full items-center justify-center gap-3 py-5">
		{#if $page.data.config.app.views.treePage.show && (session.isAdmin || $page.data.config.app.nonAdmin.allowAccessToTreePage)}
			<Button href={getTreeUrlFromDn(group.dn)} class="flex items-center gap-2">
				<FolderTree class="size-4 flex-none" />
				View in tree
			</Button>
		{/if}
		<Button class="flex items-center gap-2" on:click={onOpenEditClick}>
			<PencilLine class="size-4 flex-none" />
			Edit
		</Button>
		<Button class="flex items-center gap-2" on:click={() => (isManageMembersDialogOpen = true)}>
			<Users class="size-4 flex-none" />
			Manage members
		</Button>
		<Button
			variant="destructive"
			class="flex items-center gap-2"
			on:click={() => (isDeleteGroupDialogOpen = true)}
		>
			<Trash2 class="size-4 flex-none" />
			Delete group
		</Button>
	</div>
</div>

<ManageGroupMembersDialog dn={group.distinguishedName} bind:open={isManageMembersDialogOpen} />
<DeleteGroupDialog
	dn={group.distinguishedName}
	bind:open={isDeleteGroupDialogOpen}
	on:deleted={() => goto('/groups', { invalidateAll: true })}
/>
<UpdateGroupDialog
	dn={group.distinguishedName}
	bind:open={isUpdateGroupDialogOpen}
	bind:form={updateGroupForm}
	on:name-change={async ({ detail }) => {
		await goto(`/groups/${encodeURIComponent(detail.newDn)}`, { invalidateAll: true });
	}}
/>
