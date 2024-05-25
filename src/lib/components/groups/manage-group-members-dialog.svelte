<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
	import { toast } from 'svelte-sonner';
	export let open: boolean;
	$: form = $page.data.createGroupForm;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}><slot>Manage group members</slot></Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create Group</Dialog.Title>
			<Dialog.Description>Fill in the following data to update group members</Dialog.Description>
		</Dialog.Header>
		<!-- let:methods -->
		<Form
			let:loading
			bind:form
			schema={createGroupSchema}
			loadingText="Updating group members..."
			formProps={{ action: paths.groups.actions.create }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('Group members updated');
						invalidate('protected:groups');
					}
				}
			}}
		>
			hello
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
