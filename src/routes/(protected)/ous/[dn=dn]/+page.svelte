<script lang="ts">
	import { InfoValue, MemberInfoValue, ParentInfoValue } from '$/lib/components/info-value';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { DeleteOuDialog, UpdateOuDialog } from '$lib/components/organizational-units';
	import { Button } from '$lib/components/ui/button';
	import { breadcrumbs } from '$lib/stores';
	import { buildBreadcrumbsFromDn, getTreeUrlFromDn } from '$lib/utils';
	import FolderTree from '$lucide/folder-tree.svelte';
	import PencilLine from '$lucide/pencil-line.svelte';
	import Trash2 from '$lucide/trash-2.svelte';
	import dayjs from 'dayjs';
	import { setContext } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	const { details: config } = $page.data.config.app.views.ousPage;
	setContext('config', config);
	$: ({ ou, members, updateOuForm, session, parent } = data);

	$: breadcrumbs.set([
		{ name: 'Organizational Units', link: '/ous' },
		...buildBreadcrumbsFromDn(ou.dn, 'ous')
	]);

	let isUpdateOuDialogOpen = false;
	let isDeleteOuDialogOpen = false;
	const onOpenEditClick = () => {
		updateOuForm.data = {
			...updateOuForm.data,
			...ou
		};
		isUpdateOuDialogOpen = true;
	};
</script>

<div class="flex h-full w-full flex-col gap-4 py-12 md:p-16" data-test="groupsDnPage">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">
					{ou.name}
				</h1>
			</div>
			<div class="group-info grid grid-cols-2 gap-4">
				<InfoValue entry={ou} key="name" />
				<InfoValue entry={ou} key="description" />
				<InfoValue entry={ou} key="distinguishedName" />
				<InfoValue entry={ou} key="whenCreated">
					{dayjs(ou.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</InfoValue>
				<InfoValue entry={ou} key="whenChanged">
					{dayjs(ou.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</InfoValue>
				<ParentInfoValue {parent} />
				<MemberInfoValue {members} />
			</div>
		</div>
	</div>
	<div class="flex h-full w-full items-center justify-center gap-3 py-5">
		{#if $page.data.config.app.views.treePage.show && (session.isAdmin || $page.data.config.app.nonAdmin.allowAccessToTreePage)}
			<Button href={getTreeUrlFromDn(ou.dn)} class="flex items-center gap-2">
				<FolderTree class="size-4 flex-none" />
				View in tree
			</Button>
		{/if}
		<Button class="flex items-center gap-2" on:click={onOpenEditClick}>
			<PencilLine class="size-4 flex-none" />
			Edit
		</Button>
		<Button
			variant="destructive"
			class="flex items-center gap-2"
			on:click={() => (isDeleteOuDialogOpen = true)}
		>
			<Trash2 class="size-4 flex-none" />
			Delete Organizational Unit
		</Button>
	</div>
</div>

<DeleteOuDialog
	dn={ou.distinguishedName}
	bind:open={isDeleteOuDialogOpen}
	on:deleted={() => {
		goto('/ous', { invalidateAll: true });
	}}
/>
<UpdateOuDialog
	dn={ou.distinguishedName}
	bind:open={isUpdateOuDialogOpen}
	bind:form={updateOuForm}
	on:name-change={async ({ detail }) => {
		await goto(`/ous/${encodeURIComponent(detail.newDn)}`, { invalidateAll: true });
	}}
/>
