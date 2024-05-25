<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { paths } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import SelectInput from '$lib/components/form/select-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		createGroupSchema,
		type CreateGroupSchema
	} from '$lib/schemas/group/create-group-schema';
	import { GroupTypeSelect } from '$lib/types/group';
	import Captions from '$lucide/captions.svelte';
	import Mail from '$lucide/mail.svelte';
	import { toast } from 'svelte-sonner';
	import AddMembersDialog from './add-members-dialog.svelte';
	import AddMembersSurveyDialog from './add-members-survey-dialog.svelte';

	let open: boolean;
	let isManageMembersSurveyDialogOpen = false;
	let isAddMembersDialogOpen = false;
	export let base = PUBLIC_BASE_DN;
	$: form = $page.data.createGroupForm;

	const onChange: FormOptions<CreateGroupSchema>['onChange'] = ({ get, set, target }) => {
		if (target?.name === 'sAMAccountName') {
			const sAMAccountName = get('sAMAccountName');
			if (sAMAccountName)
				set('mail', `${sAMAccountName.split(' ').join('.').toLowerCase()}@${PUBLIC_LDAP_DOMAIN}`);
			else set('mail', '');
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}>Create Group</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create Group</Dialog.Title>
			<Dialog.Description>Fill in the following data to create a new group</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={createGroupSchema}
			loadingText="Creating group..."
			formProps={{ action: paths.groups.actions.create }}
			formOptions={{
				resetForm: true,
				onChange,
				onError: ({ result }) => {
					toast.error(result.error.message);
				},
				onResult: ({ result }) => {
					if (result.type === 'success') {
						open = false;
						isManageMembersSurveyDialogOpen = true;
						toast.success('Group created successfully');
						invalidate('protected:groups');
					}
				}
			}}
		>
			<input hidden name="base" value={base} />
			<div class="grid gap-4">
				<Input name="sAMAccountName" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">sAMAccountName</svelte:fragment>
				</Input>
				<Input name="mail" inputProps={{ required: true }} {methods}>
					<svelte:fragment slot="label">mail</svelte:fragment>
					<svelte:fragment slot="addornment-left">
						<Mail />
					</svelte:fragment>
				</Input>
				<SelectInput
					name="groupType"
					selectProps={{ required: true, placeholder: 'Select group type' }}
					options={GroupTypeSelect}
					{methods}
				>
					<svelte:fragment slot="label">groupType</svelte:fragment>
				</SelectInput>
				<Input name="description" {methods}>
					<svelte:fragment slot="label">description</svelte:fragment>
					<svelte:fragment slot="addornment-left">
						<Captions />
					</svelte:fragment>
				</Input>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Create Group</Button>
			</Dialog.Footer>
		</Form>
	</Dialog.Content>
</Dialog.Root>

<AddMembersSurveyDialog
	bind:open={isManageMembersSurveyDialogOpen}
	on:open-add-members={() => (isAddMembersDialogOpen = true)}
/>

<AddMembersDialog bind:open={isAddMembersDialogOpen} bind:form />
