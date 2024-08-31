<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteOuSchema, type DeleteOuSchema } from '$lib/schemas/ou/delete-ou-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	export let action = '/ous?/deleteOu';
	$: form = $page.data.deleteOuForm;
	const { allowNonLeafDelete } = $page.data.config.directory.ous;
	let toastId: string | number = NaN;

	const onSubmit: FormOptions<DeleteOuSchema>['onSubmit'] = () => {
		toastId = toast.loading('Deleting ou...', { duration: 30_000 });
	};

	const onResult: FormOptions<DeleteOuSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				invalidate('protected:ous');
				toastId = toast.success('Organizational Unit deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				open = false;
				break;

			case 'redirect':
				await goto(result.location, {
					state: {
						toast: {
							data: { id: toastId, duration: undefined },
							type: 'success',
							message: 'Organizational Unit deleted successfully!'
						}
					}
				});
				break;
		}
	};
	const onError: FormOptions<DeleteOuSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
		open = false;
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl text-destructive">Delete Organizational Unit</Dialog.Title>
			<Dialog.Description>
				<p>This is a dangerous action!</p>
			</Dialog.Description>
		</Dialog.Header>
		<Form
			let:loading
			bind:form
			schema={deleteOuSchema}
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
			{#if allowNonLeafDelete}
				<p class="text-lg">Are you sure you want to delete this Organizational Unit</p>
				<p class="text-lg text-destructive">and all entries inside it?</p>
			{:else}
				<p class="text-lg">Are you sure you want to delete this Organizational Unit?</p>
				<p class="text-muted-foreground">deletion will fail if it's not empty</p>
			{/if}

			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={loading}>Accept</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
