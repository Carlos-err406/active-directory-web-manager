<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_API_KEY } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { getCNFromDN } from '$lib/ldap/utils';
	import {
		updateMembershipSchema,
		type UpdateMembershipSchema
	} from '$lib/schemas/user/update-membership';
	import type { Group } from '$lib/types/group';
	import Loader from '$lucide/loader.svelte';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';
	import GroupChipList from '../groups/chip/group-chip-list.svelte';
	import GroupsSelect from '../groups/groups-select.svelte';
	export let open = false;
	export let dn: string;
	const action = `/users/${dn}?/updateMembership`;
	$: form = $page.data.updateUserForm;
	let groups: Group[] = [];
	let initializing = false;

	const onOpen = async () => {
		const params = new URLSearchParams({ dn });
		initializing = true;
		groups = await fetch(`/api/user-groups?${params}`, {
			headers: { Authorization: `Bearer ${PUBLIC_API_KEY}` }
		}).then((r) => r.json());
		initializing = false;
	};

	$: open && onOpen();

	let toastId: string | number = NaN;

	const onSubmit: FormOptions<UpdateMembershipSchema>['onSubmit'] = () => {
		toastId = toast.loading('Updating user membership...', { duration: 30_000 });
	};

	const onResult: FormOptions<UpdateMembershipSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				invalidate('protected:users');
				invalidate('protected:groups');
				toastId = toast.success('User membership updated successfully!', {
					id: toastId,
					duration: undefined
				});
				break;
			case 'redirect':
				await goto(result.location, {
					state: {
						toast: {
							type: 'success',
							message: 'Group deleted successfully!'
						}
					}
				});
				break;
		}
		open = false;
	};

	const onError: FormOptions<UpdateMembershipSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Manage user membership</Dialog.Title>
			<Dialog.Description>Manage the groups where {getCNFromDN(dn)} belongs to</Dialog.Description>
		</Dialog.Header>
		<GroupsSelect
			bind:selected={groups}
			on:select={({ detail }) => (groups = [...groups, detail])}
		/>
		<GroupChipList bind:groups>
			<svelte:fragment slot="empty-list">
				{#if !initializing}
					--- No groups ---
				{/if}
			</svelte:fragment>
		</GroupChipList>
		{#if initializing && !groups.length}
			<div class="flex w-full justify-center" transition:slide={{ axis: 'y', duration: 200 }}>
				<Loader class="size-5 animate-spin" />
			</div>
		{/if}
		<Form
			let:loading
			bind:form
			schema={updateMembershipSchema}
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onSubmit,
				onError,
				onResult
			}}
		>
			{#each groups as group}
				<input hidden type="text" name="dns" value={group.dn} />
			{/each}
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
