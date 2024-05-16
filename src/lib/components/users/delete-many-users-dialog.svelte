<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createUserSchema } from '$lib/schemas/user/create-user-schema';
	import { toast } from 'svelte-sonner';
	let open: boolean;
	export let dns: string[] = [];
	$: form = $page.data.createUserForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="destructive">Delete all selected</Button>
	</Dialog.Trigger>
	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title class="text-xl text-destructive">Delete selected users</Dialog.Title>
			<Dialog.Description
				>This is a dangerous action!
				{#if dns.length > 1}
					<br /> You are deleting <strong>{dns.length}</strong> users!
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Form
			let:loading
			bind:form
			schema={createUserSchema}
			loadingText="Deleting users..."
			formProps={{ action: paths.users.actions.deleteMany }}
			formOptions={{
				resetForm: false,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					invalidate('protected:users');
					if (result.type === 'success') {
						open = false;
						toast.success('Users deleted successfully');
					}
				}
			}}
		>
			{#each dns as dn}
				<input hidden name="dns" value={dn} />
			{/each}
			<div class="mb-5 text-lg">
				Are you sure you want to delete <strong>ALL</strong> selected users?
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={loading}>Accept</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
