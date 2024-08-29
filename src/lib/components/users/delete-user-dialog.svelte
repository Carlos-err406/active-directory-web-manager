<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteUserSchema, type DeleteUserSchema } from '$lib/schemas/user/delete-user-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	const action = `/users/${dn}?/deleteUser`;
	$: form = $page.data.deleteUserForm;

	let toastId: string | number = NaN;

	const onSubmit: FormOptions<DeleteUserSchema>['onSubmit'] = () => {
		toastId = toast.loading('Deleting user...', { duration: 30_000 });
	};

	const onResult: FormOptions<DeleteUserSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				invalidate('protected:users');
				toastId = toast.success('User deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				open = false;
				break;
			case 'redirect':
				if ($page.url.pathname.startsWith('/tree')) {
					toast.success('User deleted successfully!', { id: toastId });
					await invalidateAll();
				} else {
					await goto(result.location, {
						state: {
							toast: {
								data: { id: toastId },
								type: 'success',
								message: 'User deleted successfully!'
							}
						}
					});
				}
				break;
		}
	};
	const onError: FormOptions<DeleteUserSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
		open = false;
	};
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
			formProps={{ action }}
			formOptions={{
				resetForm: false,
				applyAction: false,
				onResult,
				onError,
				onSubmit
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
