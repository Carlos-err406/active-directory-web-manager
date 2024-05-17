<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createUserSchema } from '$lib/schemas/user/create-user-schema';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	$: form = $page.data.changePasswordForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Change password</Dialog.Title>
			<Dialog.Description>Fill in the following data to create a new user</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={createUserSchema}
			loadingText="Changing password..."
			formProps={{ action: paths.users.actions.changePassword }}
			formOptions={{
				resetForm: false,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('Password changed successfully');
					}
				}
			}}
		>
			<input hidden name="dn" value={dn} />
			<!-- This input is so user is prompted to save the password with this email on form submit instead of the dn-->
			<input
				hidden
				name="email"
				value="{dn.split('=')[1].split(',')[0].toLowerCase()}@{PUBLIC_LDAP_DOMAIN}"
			/>
			<div class="grid grid-cols-1 gap-4">
				{#if !$page.data.session.isAdmin}
					<PasswordInput name="oldPassword" inputProps={{ required: true }} {methods}>
						<svelte:fragment slot="label">Old password</svelte:fragment>
					</PasswordInput>
				{/if}
				<PasswordInput name="password" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">New Password</svelte:fragment>
				</PasswordInput>
				<PasswordInput name="passwordConfirmation" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">Password Confirmation</svelte:fragment>
				</PasswordInput>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Change password</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
