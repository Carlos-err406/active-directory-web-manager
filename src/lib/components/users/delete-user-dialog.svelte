<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
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
			formProps={{ action: paths.users.actions.delete }}
			formOptions={{
				resetForm: false,
				onError: ({ result }) => {
					toast.error(result.error.message);
					open = false;
				},
				onResult: async ({ result }) => {
					toast('asd', {});
					toast.success('User deleted successfully');
					if ($page.params.dn !== dn) await invalidate('protected:users');
					if (result.type === 'success') {
						open = false;
						if ($page.params.dn === dn) {
							await goto(paths.users.list, {
								state: {
									toast: {
										type: 'success',
										message: 'User deleted successfully'
									}
								}
							});
						}
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
