<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_API_KEY } from '$env/static/public';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
	import type { Group } from '$lib/types/group';
	import { Loader } from 'lucide-svelte';
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
			schema={updateUserSchema}
			loadingText="Updating user membership..."
			formProps={{ action, enctype: 'multipart/form-data' }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('User membership updated');
						invalidate('protected:groups');
						invalidate('protected:users');
					}
				}
			}}
		>
			<input type="text" hidden value={dn} name="userDn" />
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
