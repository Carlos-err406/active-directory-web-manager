<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createUserSchema } from '$lib/schemas/user/create-user-schema';
	import Mail from '$lucide/mail.svelte';
	import Captions from '$lucide/captions.svelte';
	import { toast } from 'svelte-sonner';
	let open: boolean;
	export let base = PUBLIC_BASE_DN;
	$: form = $page.data.createUserForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}>Create User</Button>
	</Dialog.Trigger>
	<Dialog.Content class="">
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
			formProps={{ action: paths.users.actions.create }}
			formOptions={{
				resetForm: false,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('User created successfully');
						invalidate('protected:users');
					}
				}
			}}
		>
			<input hidden name="base" value={base} />
			<div class="grid grid-cols-2 gap-4">
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
