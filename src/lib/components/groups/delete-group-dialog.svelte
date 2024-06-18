<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	export let action = '/groups?/deleteGroup';
	$: form = $page.data.deleteGroupForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl text-destructive">Delete Group</Dialog.Title>
			<Dialog.Description>This is a dangerous action!</Dialog.Description>
		</Dialog.Header>
		<Form
			let:loading
			bind:form
			schema={deleteGroupSchema}
			loadingText="Deleting group..."
			formProps={{ action }}
			formOptions={{
				resetForm: false,
				applyAction: false,
				onError: ({ result }) => {
					toastError(result.error);
					open = false;
				},
				onResult: async ({ result }) => {
					if (result.type === 'success') {
						invalidate('protected:groups');
						toast.success('Group deleted successfully');
						open = false;
					} else if (result.type === 'redirect') {
						goto(result.location, {
							state: {
								toast: {
									type: 'success',
									message: 'Group deleted successfully'
								}
							}
						});
					}
				}
			}}
		>
			<input hidden name="dn" value={dn} />
			<div class="mb-5 text-lg">Are you sure you want to delete this group?</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={loading}>Accept</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
