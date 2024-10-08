<script lang="ts">
	import { getCorrectPluralization } from '$/lib/utils';
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { deleteManySchema, type DeleteManySchema } from '$lib/schemas/delete-many-schema';
	import { toast } from 'svelte-sonner';
	let open: boolean;
	export let dns: string[] = [];
	$: form = $page.data.deleteManyOusForm;

	let toastId: string | number = NaN;

	const onSubmit: FormOptions<DeleteManySchema>['onSubmit'] = () => {
		toastId = toast.loading('Deleting Organizational Units...', { duration: 30_000 });
	};

	const onResult: FormOptions<DeleteManySchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('Organizational Units deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				break;
			case 'redirect':
				toast.success('Organizational Units deleted successfully!', {
					id: toastId,
					duration: undefined
				});
				applyAction(result);
		}
		open = false;
		invalidate('protected:ous');
	};
	const onError: FormOptions<DeleteManySchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
		open = false;
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="destructive">Delete all selected</Button>
	</Dialog.Trigger>
	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title class="text-xl text-destructive"
				>Delete selected Organizational Units</Dialog.Title
			>
			<Dialog.Description
				>This is a dangerous action!
				{#if dns.length > 1}
					<br /> You are deleting <strong>{dns.length}</strong>
					{getCorrectPluralization(dns, 'Organizational Units', 'Organizational Unit')}!
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Form
			let:loading
			bind:form
			schema={deleteManySchema}
			formProps={{ action: '/ous?/deleteManyOus' }}
			formOptions={{
				resetForm: false,
				onSubmit,
				onError,
				onResult
			}}
		>
			{#each dns as dn}
				<input hidden name="dns" value={dn} />
			{/each}
			<div class="mb-5 text-lg">
				Are you sure you want to delete <strong>ALL</strong> selected Organizational Units?
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={loading}>Accept</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>
