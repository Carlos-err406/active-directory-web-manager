<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { UserChipList, UsersSelect } from '$lib/components/users';
	import { setMembersSchema, type SetMembersSchema } from '$lib/schemas/group/set-members-schema';
	import type { User } from '$lib/types/user';
	import { toast } from 'svelte-sonner';

	export let open = false;
	export let dn: string;
	const action = `/groups/${dn}?/setMembers`;
	let users: User[] = [];
	$: form = $page.data.setMembersForm;
	let toastId: string | number = NaN;

	const onSubmit: FormOptions<SetMembersSchema>['onSubmit'] = () => {
		toastId = toast.loading('Adding members to group...', { duration: 30_000 });
	};

	const onResult: FormOptions<SetMembersSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('Selected users were added to the group!', {
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
			schema={setMembersSchema}
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onSubmit,
				onResult
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
