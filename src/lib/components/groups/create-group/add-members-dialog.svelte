<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { paths } from '$lib';
	import Form, { type Data } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let open = false;
	export let form: Data | SuperValidated<Data>;
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl">Add members</Dialog.Title>
			<Dialog.Description>Select the users to be added to this group</Dialog.Description>
		</Dialog.Header>
		<!-- let:methods
		let:loading -->
		<Form
			bind:form
			schema={createGroupSchema}
			loadingText="Adding members to group..."
			formProps={{ action: paths.groups.actions.create }}
			formOptions={{
				resetForm: true,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						toast.success('Selected users were added to group!');
						invalidate('protected:groups');
					}
				}
			}}
		>
			hiii
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="default">Save</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
