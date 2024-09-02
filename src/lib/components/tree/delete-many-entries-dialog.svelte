<script lang="ts">
	import type { TreeEntry } from '$/lib/types/tree';
	import { getCorrectPluralization } from '$/lib/utils';
	import { applyAction } from '$app/forms';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteManySchema, type DeleteManySchema } from '$lib/schemas/delete-many-schema';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	export let open = false;
	export let entries: TreeEntry[] = [];
	$: form = $page.data.deleteManyEntriesForm;

	let toastId: string | number = NaN;
	const dispatch = createEventDispatcher<{ deleted: TreeEntry[] }>();
	const onSubmit: FormOptions<DeleteManySchema>['onSubmit'] = () => {
		toastId = toast.loading('Deleting entries...', { duration: 30_000 });
	};

	const onResult: FormOptions<DeleteManySchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('Entries deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				dispatch('deleted', entries);
				break;
			case 'redirect':
				toast.success('Entries deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				applyAction(result);
		}
		open = false;
	};
	const onError: FormOptions<DeleteManySchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
		open = false;
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="destructive">Delete selected entries</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl text-destructive">Delete selected entries</Dialog.Title>
			<Dialog.Description>
				This is a very dangerous action!
				<br /> You are deleting <strong>{entries.length}</strong>
				{getCorrectPluralization(entries, 'entries', 'entry')}
				{#if $page.data.config.directory.ous.allowNonLeafDelete}
					<strong>And all its possible children!</strong>
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Form
			let:loading
			bind:form
			schema={deleteManySchema}
			formProps={{ action: '/tree?/deleteMany' }}
			formOptions={{
				resetForm: false,
				invalidateAll: false,
				onSubmit,
				onError,
				onResult
			}}
		>
			{#each entries as { dn }}
				<input hidden name="dns" value={dn} />
			{/each}
			<div class="mb-5 text-lg">
				Are you sure you want to delete <strong>ALL</strong> selected entries?
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={loading}>Accept</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
