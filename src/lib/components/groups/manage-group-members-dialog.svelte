<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_API_KEY } from '$env/static/public';
	import { toastError } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
	import type { User } from '$lib/types/user';
	import Loader from '$lucide/loader.svelte';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';
	import { UsersSelect } from '../users';
	import UserChipList from '../users/chip/user-chip-list.svelte';
	export let open: boolean;
	export let dn: string;
	const action = `/groups/${dn}?/setMembers`;
	$: form = $page.data.setMembersForm;
	let users: User[] = [];
	let initializing = false;
	const onOpen = async () => {
		const params = new URLSearchParams({ dn });
		initializing = true;
		users = await fetch(`/api/group-members?${params}`, {
			headers: { Authorization: `Bearer ${PUBLIC_API_KEY}` }
		}).then((r) => r.json());
		initializing = false;
	};
	$: open && onOpen();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Manage group members</Dialog.Title>
			<Dialog.Description
				>Add or remove members in this group ({getCNFromDN(dn)})</Dialog.Description
			>
		</Dialog.Header>
		<UsersSelect selected={users} on:select={({ detail }) => (users = [...users, detail])} />
		<UserChipList bind:users>
			<svelte:fragment slot="empty-list">
				{#if !initializing}
					--- No members ---
				{/if}
			</svelte:fragment>
		</UserChipList>
		{#if initializing && !users.length}
			<div class="flex w-full justify-center" transition:slide={{ axis: 'y', duration: 200 }}>
				<Loader class="size-5 animate-spin" />
			</div>
		{/if}
		<Form
			let:loading
			bind:form
			schema={setMembersSchema}
			loadingText="Updating group members..."
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toastError(result.error);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('Group members updated');
						invalidate('protected:groups');
						invalidate('protected:users');
					}
				}
			}}
		>
			<input type="text" hidden value={dn} name="groupDn" />
			{#each users as user}
				<input hidden type="text" name="dns" value={user.dn} />
			{/each}
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
