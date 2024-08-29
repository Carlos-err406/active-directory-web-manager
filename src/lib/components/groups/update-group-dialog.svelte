<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type Data, type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		updateGroupSchema,
		type UpdateGroupSchema
	} from '$lib/schemas/group/update-group-schema';
	import { GroupTypeSelect } from '$lib/types/group';
	import Captions from '$lucide/captions.svelte';
	import Mail from '$lucide/mail.svelte';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SelectInput from '../form/select-input.svelte';
	export let open = false;
	export let base = PUBLIC_BASE_DN;
	export let dn: string;
	export let action = '/groups?/updateGroup';
	export let form: SuperValidated<Data>;
	const onChange: FormOptions<UpdateGroupSchema>['onChange'] = ({ get, set, target }) => {
		if (target?.name === 'sAMAccountName') {
			const sAMAccountName = get('sAMAccountName');
			if (sAMAccountName)
				set('mail', `${sAMAccountName.split(' ').join('.').toLowerCase()}@${PUBLIC_LDAP_DOMAIN}`);
			else set('mail', '');
		}
	};

	let toastId: string | number = NaN;

	const onSubmit: FormOptions<UpdateGroupSchema>['onSubmit'] = () => {
		toastId = toast.loading('Updating group...', { duration: 30_000 });
	};
	const onResult: FormOptions<UpdateGroupSchema>['onResult'] = async ({ result }) => {
		invalidate('protected:groups');
		switch (result.type) {
			case 'success':
				open = false;
				toastId = toast.success('Group updated successfully!', {
					id: toastId,
					duration: undefined
				});
				break;
			case 'redirect':
				open = false;
				toast.dismiss(toastId);
				applyAction(result);
		}
	};
	const onError: FormOptions<UpdateGroupSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update Group</Dialog.Title>
			<Dialog.Description>Update the values in the following form</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			let:values
			bind:form
			schema={updateGroupSchema}
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onChange,
				onSubmit,
				onError,
				onResult
			}}
		>
			<input hidden name="base" value={base} />
			<input hidden name="dn" value={dn} />
			<div class="grid gap-4">
				<Input name="sAMAccountName" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">sAMAccountName</svelte:fragment>
				</Input>
				<SelectInput
					name="groupType"
					selectProps={{ required: true, placeholder: 'Select group type' }}
					options={GroupTypeSelect}
					{methods}
				>
					<svelte:fragment slot="label">groupType</svelte:fragment>
				</SelectInput>
				{#if values['groupType'] == 0}
					<div transition:slide={{ axis: 'y' }}>
						<Input name="mail" inputProps={{ required: true }} {methods}>
							<svelte:fragment slot="label">mail</svelte:fragment>
							<svelte:fragment slot="adornment-left">
								<Mail />
							</svelte:fragment>
							<svelte:fragment slot="description">Distribution list email</svelte:fragment>
						</Input>
					</div>
				{/if}
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
