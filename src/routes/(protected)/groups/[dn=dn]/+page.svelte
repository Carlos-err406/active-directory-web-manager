<script lang="ts">
	import { page } from '$app/stores';
	import { DeleteGroupDialog, UpdateGroupDialog } from '$lib/components/groups';
	import ManageGroupMembersDialog from '$lib/components/groups/manage-group-members-dialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getCNFromDN, getGroupTypes } from '$lib/ldap/utils';
	import { breadcrumbs } from '$lib/stores';
	import { GroupFlags, GroupTypes } from '$lib/types/group';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash2 from '$lucide/trash-2.svelte';
	import Users from '$lucide/users.svelte';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	export let data: PageData;
	$: breadcrumbs.set([{ name: 'Groups', link: '/groups' }, { name: group.cn }]);
	const { details: config } = $page.data.config.app.views.groupsPage;
	let isUpdateGroupDialogOpen = false;
	let isManageMembersDialogOpen = false;
	let isDeleteGroupDialogOpen = false;
	$: ({ group, updateGroupForm } = data);
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

<div class="flex h-full w-full flex-col py-12 md:py-16">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
					{group.sAMAccountName}
				</h1>
			</div>
			<div class="group-info grid grid-cols-2 gap-y-3">
				{#if config.sAMAccountName.show}
					<span>{config.sAMAccountName.label}:</span>
					<span class="info-value">{group.sAMAccountName}</span>
				{/if}
				{#if config.cn.show && group.cn}
					<span>{config.cn.label}:</span>
					<span class="info-value">{group.cn}</span>
				{/if}

				{#if config.description.show && group.description}
					<span>{config.description.label}:</span>
					<span class="info-value">{group.description}</span>
				{/if}

				{#if config.mail.show && group.mail}
					<span>{config.mail.label}:</span>
					<span class="info-value">{group.mail}</span>
				{/if}
				{#if config.distinguishedName.show && group.distinguishedName}
					<span>{config.distinguishedName.label}:</span>
					<span class="info-value">{group.distinguishedName}</span>
				{/if}
				{#if config.groupType.show && group.groupType}
					<span>{config.groupType.label}:</span>
					<span class="info-value">
						{getGroupTypes(group.groupType)
							.map((gt) => GroupTypes[gt])
							.join(', ')}
					</span>
				{/if}
				{#if config.whenCreated.show}
					<span>{config.whenCreated.label}:</span>
					<span class="info-value">
						{dayjs(group.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
					</span>
				{/if}
				{#if config.whenChanged.show}
					<span>{config.whenChanged.label}:</span>
					<span class="info-value">
						{dayjs(group.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
					</span>
				{/if}
				{#if config.member.show}
					<span>{config.member.label}:</span>
					<div
						data-isShort={config.member.shortMember}
						class="info-value flex flex-wrap data-[isShort=false]:gap-2"
					>
						{#each (group.member || []).sort( (a, b) => (a < b ? -1 : a > b ? 1 : 0) ) as userDn, index}
							<a
								href="/users/{userDn}"
								data-sveltekit-preload-data="hover"
								class="text-primary hover:underline"
							>
								{config.member.shortMember ? getCNFromDN(userDn) : userDn}
							</a>
							{#if config.member.shortMember && index < group.member.length - 1}
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
	<div class="flex h-full w-full items-center justify-center gap-3">
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
	action="/groups/{group.distinguishedName}?/deleteGroup"
	bind:open={isDeleteGroupDialogOpen}
/>
<UpdateGroupDialog
	dn={group.distinguishedName}
	bind:open={isUpdateGroupDialogOpen}
	bind:form={updateGroupForm}
	action="/groups/{group.distinguishedName}?/updateGroup"
/>
