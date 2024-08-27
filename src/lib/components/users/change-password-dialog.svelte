<script lang="ts">
	import { applyAction } from '$app/forms';
	import { page } from '$app/stores';
	import { PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		changePasswordSchema,
		type ChangePasswordSchema
	} from '$lib/schemas/user/change-password-schema';
	import type { Session } from '$lib/types/session';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let dn: string;
	export let action = '/users?/changePassword';
	$: session = $page.data.session as Session;
	$: form = $page.data.changePasswordForm;
	$: isSelf = session.dn === dn;

	let toastId: number | string = NaN;

	const onSubmit: FormOptions<ChangePasswordSchema>['onSubmit'] = () => {
		toastId = toast.loading('Changing password...', { duration: 30_000 });
	};
	const onResult: FormOptions<ChangePasswordSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('Password changed successfully!', {
					id: toastId,
					duration: undefined
				});
				open = false;
				break;
			case 'error':
				toastError(result.error, toastId);
				break;
			case 'redirect':
				toast.dismiss(toastId);
				open = false;
				applyAction(result);
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Change password</Dialog.Title>
			<Dialog.Description>
				Fill in the following data to change {isSelf ? 'your' : 'the'} password
			</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={changePasswordSchema}
			formProps={{ action }}
			formOptions={{
				resetForm: false,
				onSubmit,
				onResult
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
				{#if !session.isAdmin}
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
