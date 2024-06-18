<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
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
	import { toastError } from '$lib';
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
			loadingText="Updating group..."
			formProps={{ action }}
			formOptions={{
				resetForm: true,
				onChange,
				onError: ({ result }) => {
					toastError(result.error);
				},
				onResult: ({ result }) => {
					invalidate('protected:groups');
					if (result.type === 'success') {
						open = false;
						toast.success('Group updated successfully');
					}
				}
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
							<svelte:fragment slot="addornment-left">
								<Mail />
							</svelte:fragment>
							<svelte:fragment slot="description">Distribution list email</svelte:fragment>
						</Input>
					</div>
				{/if}
				<Input name="description" {methods}>
					<svelte:fragment slot="label">description</svelte:fragment>
					<svelte:fragment slot="addornment-left">
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
