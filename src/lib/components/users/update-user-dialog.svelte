<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { paths } from '$lib';
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

	const onChange: FormOptions<UpdateUserSchema>['onChange'] = ({ get, set, target }) => {
		if (target?.name === 'sAMAccountName') {
			const sAMAccountName = get('sAMAccountName');
			if (sAMAccountName) set('mail', `${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`);
			else set('mail', '');
		}
	};
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
			loadingText="Updatting user..."
			formProps={{ action: paths.users.actions.update, enctype: 'multipart/form-data' }}
			formOptions={{
				resetForm: true,
				onChange,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					invalidate('protected:users');
					if (result.type === 'success') {
						open = false;
						toast.success('User updated successfully');
					}
				}
			}}
		>
			<input hidden name="base" value={base} />
			<input hidden name="dn" value={dn} />
			<div class="grid grid-cols-2 gap-4">
				<div class="col-span-2">
					<ImageInput
						name="jpegPhoto"
						b64Name="jpegPhotoBase64"
						{methods}
						addornmentRightClasses={cn('self-end')}
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
					<svelte:fragment slot="addornment-left">
						<Mail />
					</svelte:fragment>
				</Input>
				<div class="col-span-2">
					<Input name="description" {methods}>
						<svelte:fragment slot="label">description</svelte:fragment>
						<svelte:fragment slot="addornment-left">
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