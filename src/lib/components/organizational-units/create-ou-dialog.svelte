<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createOuSchema, type CreateOuSchema } from '$lib/schemas/ou/create-ou-schema';
	import Captions from 'lucide-svelte/icons/captions';
	import { toast } from 'svelte-sonner';

	export let open = false;
	export let base = PUBLIC_BASE_DN;

	$: form = $page.data.createOuForm;

	let toastId: number | string = NaN;

	const onSubmit: FormOptions['onSubmit'] = () => {
		toastId = toast.loading('Creating Organizational Unit...', { duration: 30_000 });
	};

	const onResult: FormOptions<CreateOuSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toast.success('Organizational Unit created successfully', {
					id: toastId,
					duration: undefined
				});
				invalidate('protected:ous');
				open = false;
				break;
			case 'failure':
				toast.dismiss(toastId);
				break;
			case 'redirect':
				open = false;
				toast.dismiss(toastId);
				await applyAction(result);
				break;
		}
	};
	const onError: FormOptions<CreateOuSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create Organizational Unit</Dialog.Title>
			<Dialog.Description>
				Fill in the following data to create a new Organizational Unit
			</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={createOuSchema}
			formProps={{ action: '/ous?/createOu' }}
			formOptions={{
				resetForm: true,
				onError,
				onSubmit,
				onResult
			}}
		>
			<input hidden name="base" value={base} />
			<div class="grid gap-4">
				<Input name="name" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">name</svelte:fragment>
				</Input>
				<Input name="description" {methods}>
					<svelte:fragment slot="label">description</svelte:fragment>
					<svelte:fragment slot="adornment-left">
						<Captions />
					</svelte:fragment>
				</Input>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Create Organizational Unit</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
