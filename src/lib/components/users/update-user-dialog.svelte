<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type Data, type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from '$lib/schemas/user/create-user-schema';
	import { updateUserSchema, type UpdateUserSchema } from '$lib/schemas/user/update-user-schema';
	import { cn } from '$lib/utils';
	import Captions from '$lucide/captions.svelte';
	import Mail from '$lucide/mail.svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import ImageInput from '../form/image-input.svelte';
	export let open = false;
	export let base = PUBLIC_BASE_DN;
	export let dn: string;
	export let form: SuperValidated<Data>;
	const action = `/users/${dn}?/updateUser`;
	const onChange: FormOptions<UpdateUserSchema>['onChange'] = ({ get, set, target }) => {
		if (target?.name === 'sAMAccountName') {
			const sAMAccountName = get('sAMAccountName');
			if (sAMAccountName) set('mail', `${sAMAccountName.toLowerCase()}@${PUBLIC_LDAP_DOMAIN}`);
			else set('mail', '');
		}
	};
	let toastId: string | number = NaN;

	const onSubmit: FormOptions<UpdateUserSchema>['onSubmit'] = () => {
		toastId = toast.loading('Updating user...', { duration: 30_000 });
	};

	const onResult: FormOptions<UpdateUserSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				invalidate('protected:users');
				toastId = toast.success('User updated successfully!', {
					id: toastId,
					duration: undefined
				});
				open = false;
				break;
			case 'error':
				toastError(result.error, toastId);
				open = false;
				break;
			case 'redirect':
				toast.dismiss(toastId);
				applyAction(result);
				break;
		}
	};

	// TODO: UAC flags!
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update User</Dialog.Title>
			<Dialog.Description>Update the values in the following form</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={updateUserSchema}
			formProps={{ action, enctype: 'multipart/form-data' }}
			formOptions={{
				resetForm: false,
				onChange,
				onResult,
				onSubmit
			}}
		>
			<input hidden name="base" value={base} />
			<div class="grid grid-cols-2 gap-4">
				<div class="col-span-2">
					<ImageInput
						name="jpegPhoto"
						b64Name="jpegPhotoBase64"
						{methods}
						adornmentRightClasses={cn('self-end')}
						inputProps={{ accept: ALLOWED_FILE_TYPES.join(',') }}
					>
						<svelte:fragment slot="label">jpegPhoto</svelte:fragment>
						<svelte:fragment slot="button-inner">Upload user profile picture</svelte:fragment>
						<svelte:fragment slot="description">
							Max file size {MAX_FILE_SIZE_MB}MB
						</svelte:fragment>
					</ImageInput>
				</div>
				<Input name="sAMAccountName" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">sAMAccountName</svelte:fragment>
				</Input>
				<Input name="givenName" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">givenName</svelte:fragment>
				</Input>
				<Input name="sn" {methods}>
					<svelte:fragment slot="label">sn</svelte:fragment>
				</Input>
				<Input name="mail" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">mail</svelte:fragment>
					<svelte:fragment slot="adornment-left">
						<Mail />
					</svelte:fragment>
				</Input>
				<div class="col-span-2">
					<Input name="description" {methods}>
						<svelte:fragment slot="label">description</svelte:fragment>
						<svelte:fragment slot="adornment-left">
							<Captions />
						</svelte:fragment>
					</Input>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
