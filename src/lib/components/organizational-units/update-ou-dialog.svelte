<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type Data, type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { updateOuSchema, type UpdateOuSchema } from '$lib/schemas/ou/update-ou-schema';
	import type { NameChange } from '$lib/types';
	import Captions from '$lucide/captions.svelte';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	export let open = false;
	export let base = PUBLIC_BASE_DN;
	export let dn: string;
	export let action = `/ous/${dn}?/updateOu`;
	export let form: SuperValidated<Data>;

	let toastId: string | number = NaN;
	const dispatch = createEventDispatcher<{ 'name-change': NameChange }>();

	const onSubmit: FormOptions<UpdateOuSchema>['onSubmit'] = () => {
		toastId = toast.loading('Updating Organizational Unit...', { duration: 30_000 });
	};
	const onResult: FormOptions<UpdateOuSchema, { nameChange: NameChange }>['onResult'] = async ({
		result
	}) => {
		switch (result.type) {
			case 'success':
				open = false;
				toastId = toast.success('Organizational Unit updated successfully!', {
					id: toastId,
					duration: undefined
				});
				if (result.data?.nameChange) dispatch('name-change', result.data.nameChange);
				else invalidate('protected:ous');
				break;
			case 'redirect':
				open = false;
				toast.dismiss(toastId);
				applyAction(result);
		}
	};
	const onError: FormOptions<UpdateOuSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update Organizational Unit</Dialog.Title>
			<Dialog.Description>Update the values in the following form</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={updateOuSchema}
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				invalidateAll: false,
				onSubmit,
				onError,
				onResult
			}}
		>
			<input hidden name="base" value={base} />
			<input hidden name="dn" value={dn} />
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
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
