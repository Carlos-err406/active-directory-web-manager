<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { UserChipList, UsersSelect } from '$lib/components/users';
	import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
	import type { User } from '$lib/types/user';
	import { toast } from 'svelte-sonner';

	export let open = false;
	export let dn: string;
	const action = `/groups/${dn}?/setMembers`;
	let users: User[] = [];
	$: form = $page.data.setMembersForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl">Add members</Dialog.Title>
			<Dialog.Description>Select the users to be added to this group</Dialog.Description>
		</Dialog.Header>
		<UsersSelect
			bind:selected={users}
			on:select={({ detail }) => {
				users = [...users, detail];
			}}
		/>
		<UserChipList bind:users />
		<Form
			let:loading
			bind:form
			schema={createGroupSchema}
			loadingText="Adding members to group..."
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toastError(result.error);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('Selected users were added to group!');
						invalidate('protected:groups');
					}
				}
			}}
		>
			<input hidden value={dn} name="groupDn" />
			{#each users as user}
				<input hidden value={user.dn} name="dns" />
			{/each}
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="default" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
