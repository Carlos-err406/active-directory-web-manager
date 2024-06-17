<script lang="ts">
	import { DeleteGroupDialog } from '$lib/components/groups';
	import ManageGroupMembersDialog from '$lib/components/groups/manage-group-members-dialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getGroupTypes } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { GroupTypes } from '$lib/types/group';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash2 from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	export let data: PageData;

	// let _isUpdateGroupDialogOpen = false;
	let isManageMembersDialogOpen = false;
	let isDeleteGroupDialogOpen = false;
	$: ({ group } = data);

	$: breadcrumbs.set([{ name: 'Groups', link: '/groups' }, { name: group.cn }]);
</script>

<div class="flex h-full w-full flex-col py-12 md:py-16">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
					{group.sAMAccountName}
				</h1>
			</div>
			<div class="group-info grid grid-cols-2 gap-y-3">
				<span>sAMAccountName:</span>
				<span class="info-value">{group.sAMAccountName}</span>
				{#if group.cn}
					<span>cn:</span>
					<span class="info-value">{group.cn}</span>
				{/if}

				{#if group.description}
					<span>description:</span>
					<span class="info-value">{group.description}</span>
				{/if}

				{#if group.mail}
					<span>mail:</span>
					<span class="info-value">{group.mail}</span>
				{/if}
				{#if group.distinguishedName}
					<span>distinguishedName:</span>
					<span class="info-value">{group.distinguishedName}</span>
				{/if}
				{#if group.groupType}
					<span>groupType:</span>
					<span class="info-value">
						{getGroupTypes(group.groupType)
							.map((gt) => GroupTypes[gt])
							.join(', ')}
					</span>
				{/if}
				<span>whenCreated:</span>
				<span class="info-value">
					{dayjs(group.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>whenChanged:</span>
				<span class="info-value">
					{dayjs(group.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>member:</span>
				<div class="info-value flex flex-wrap space-y-2">
					{#each group.member || [] as memberDn}
						<span>
							{memberDn}
						</span>
					{:else}
						<span> - </span>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<div class="flex h-full w-full items-center justify-center gap-3">
		<!-- on:click={() => (_isUpdateGroupDialogOpen = true)} -->
		<Button class="flex items-center gap-2">
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
	action="/groups/{group.distinguishedName}?/deleteGroup"
	bind:open={isDeleteGroupDialogOpen}
/>
<!-- form={data.updateGroupForm} -->
<!-- <UpdateGroupDialog
	dn={group.distinguishedName}
	bind:open={_isUpdateGroupDialogOpen}
	action="/groups/{group.distinguishedName}?/updateGroup"
/> -->
