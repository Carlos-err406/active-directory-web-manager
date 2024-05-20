<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
	import type { User } from '$lib/types/user';
	import { toast } from 'svelte-sonner';
	import Input from '../form/input.svelte';
	export let open = false;
	export let base = PUBLIC_BASE_DN;
	export let dn: string;
	$: form = $page.data.updateUserForm;
	const onOpen = () => {
		const paginationData: User[] = $page.data.pagination.data;
		const user = paginationData.find(({ distinguishedName }) => distinguishedName === dn);
		console.log(user);
		form.data = {
			...form.data,
			dn,
			base,
			sAMAccountName: user?.sAMAccountName,
			givenName: user?.givenName,
			mail: user?.mail,
			description: user?.description,
			jpegPhotoBase64: user?.jpegPhoto,
			sn: user?.sn
		};
	};
	const onClose = () => {};

	$: open ? onOpen() : onClose();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Manage user membership</Dialog.Title>
			<Dialog.Description>Manage the groups where the user belongs to</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={updateUserSchema}
			loadingText="Updatting user membership..."
			formProps={{ action: paths.users.actions.update, enctype: 'multipart/form-data' }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('User membership updated successfully');
						invalidate('protected:users');
						invalidate('protected:groups');
					}
				}
			}}
		>
			<input hidden name="dn" value={dn} />
			<Input name="search" {methods} />
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
