<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	const action = `/users/${dn}?/deleteUser`;
	$: form = $page.data.deleteUserForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl text-destructive">Delete User</Dialog.Title>
			<Dialog.Description>This is a dangerous action!</Dialog.Description>
		</Dialog.Header>
		<Form
			let:loading
			bind:form
			schema={deleteUserSchema}
			loadingText="Deleting user..."
			formProps={{ action }}
			formOptions={{
				resetForm: false,
				applyAction: false,
				onError: ({ result }) => {
					toastError(result.error);
					open = false;
				},
				onResult: ({ result }) => {
					open = false;
					if (result.type === 'success') {
						invalidate('protected:users');
						toast.success('User deleted successfully');
					} else if (result.type === 'redirect') {
						goto(result.location, {
							invalidateAll: true,
							state: {
								toast: {
									type: 'success',
									message: 'User deleted successfully'
								}
							}
						});
					}
				}
			}}
		>
			<input hidden name="dn" value={dn} />
			<div class="mb-5 text-lg">Are you sure you want to delete this user?</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={loading}>Accept</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
