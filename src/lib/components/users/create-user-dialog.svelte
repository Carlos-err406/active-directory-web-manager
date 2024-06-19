<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		ALLOWED_FILE_TYPES,
		MAX_FILE_SIZE_MB,
		createUserSchema,
		type CreateUserSchema
	} from '$lib/schemas/user/create-user-schema';
	import { cn } from '$lib/utils';
	import Captions from '$lucide/captions.svelte';
	import Mail from '$lucide/mail.svelte';
	import { toast } from 'svelte-sonner';
	import ImageInput from '../form/image-input.svelte';
	let open: boolean;
	export let base = PUBLIC_BASE_DN;
	$: form = $page.data.createUserForm;

	const onChange: FormOptions<CreateUserSchema>['onChange'] = ({ get, set, target }) => {
		if (target?.name === 'sAMAccountName') {
			const sAMAccountName = get('sAMAccountName');
			if (sAMAccountName)
				set('mail', `${sAMAccountName.toLowerCase().split(' ').join('.')}@${PUBLIC_LDAP_DOMAIN}`);
			else set('mail', '');
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}>Create User</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create User</Dialog.Title>
			<Dialog.Description>Fill in the following data to create a new user</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={createUserSchema}
			loadingText="Creating user..."
			formProps={{ action: '/users?/createUser', enctype: 'multipart/form-data' }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toastError(result.error);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('User created successfully');
						invalidate('protected:users');
					}
				},
				onChange
			}}
		>
			<input hidden name="base" value={base} />
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
				<PasswordInput name="password" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">Password</svelte:fragment>
				</PasswordInput>
				<PasswordInput name="passwordConfirmation" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">Password Confirmation</svelte:fragment>
				</PasswordInput>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Create User</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
