<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		deleteGroupSchema,
		type DeleteGroupSchema
	} from '$lib/schemas/group/delete-group-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	export let action = '/groups?/deleteGroup';
	$: form = $page.data.deleteGroupForm;
	let toastId: string | number = NaN;

	const onSubmit: FormOptions<DeleteGroupSchema>['onSubmit'] = () => {
		toastId = toast.loading('Deleting group...', { duration: 30_000 });
	};

	const onResult: FormOptions<DeleteGroupSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				invalidate('protected:groups');
				toastId = toast.success('Group deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				open = false;
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
	};
	const onError: FormOptions<DeleteGroupSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
		open = false;
	};
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
			formProps={{ action }}
			formOptions={{
				resetForm: false,
				applyAction: false,
				onError,
				onSubmit,
				onResult
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
