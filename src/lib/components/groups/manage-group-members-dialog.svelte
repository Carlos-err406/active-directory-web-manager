<script lang="ts">
	import type { EntryWithObjectClass } from '$/lib/utils';
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_API_KEY } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { setMembersSchema, type SetMembersSchema } from '$lib/schemas/group/set-members-schema';
	import Loader from 'lucide-svelte/icons/loader';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';
	import EntryChipList from '../entries/entry-chip-list.svelte';
	import MemberSelect from './member-select.svelte';
	export let open: boolean;
	export let dn: string;
	const action = `/groups/${dn}?/setMembers`;
	$: form = $page.data.setMembersForm;
	let members: EntryWithObjectClass[] = [];
	let initializing = false;
	const onOpen = async () => {
		const params = new URLSearchParams({ dn });
		initializing = true;
		members = await fetch(`/api/group-members?${params}`, {
			headers: { Authorization: `Bearer ${PUBLIC_API_KEY}` }
		}).then((r) => r.json());
		initializing = false;
	};
	$: open && onOpen();

	let toastId: string | number = NaN;

	const onSubmit: FormOptions<SetMembersSchema>['onSubmit'] = () => {
		toastId = toast.loading('Deleting group...', { duration: 30_000 });
	};

	const onResult: FormOptions<SetMembersSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('Group members updated successfully!', {
					id: toastId,
					duration: undefined
				});
				invalidate('protected:groups');
				invalidate('protected:users');
				open = false;
				break;
			case 'error':
				toastError(result.error, toastId);
				break;
			case 'redirect':
				toast.dismiss(toastId);
				open = false;
				applyAction(result);
		}
	};
	const onError: FormOptions<SetMembersSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Manage group members</Dialog.Title>
			<Dialog.Description>
				Add or remove members in this group ({getCNFromDN(dn)})
			</Dialog.Description>
		</Dialog.Header>
		<MemberSelect selected={members} on:select={({ detail }) => (members = [...members, detail])} />
		<EntryChipList bind:entries={members}>
			<svelte:fragment slot="empty-list">
				{#if !initializing}
					--- No members ---
				{/if}
			</svelte:fragment>
		</EntryChipList>
		{#if initializing && !members.length}
			<div class="flex w-full justify-center" transition:slide={{ axis: 'y', duration: 200 }}>
				<Loader class="size-5 animate-spin" />
			</div>
		{/if}
		<Form
			let:loading
			bind:form
			schema={setMembersSchema}
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onResult,
				onError,
				onSubmit
			}}
		>
			<input type="text" hidden value={dn} name="groupDn" />
			{#each members as user}
				<input hidden type="text" name="dns" value={user.dn} />
			{/each}
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
