<script lang="ts">
	import { UserAccountControlTypes } from '$/lib/types/user';
	import { applyAction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type Data, type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from '$lib/schemas/user/create-user-schema';
	import { updateUserSchema, type UpdateUserSchema } from '$lib/schemas/user/update-user-schema';
	import type { NameChange } from '$lib/types';
	import { cn } from '$lib/utils';
	import Captions from '$lucide/captions.svelte';
	import ChevronsDownUp from '$lucide/chevrons-down-up.svelte';
	import ChevronsUpDown from '$lucide/chevrons-up-down.svelte';
	import Mail from '$lucide/mail.svelte';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Checkbox from '../form/checkbox.svelte';
	import ImageInput from '../form/image-input.svelte';
	export let open = false;
	export let base = PUBLIC_BASE_DN;
	export let dn: string;
	export let form: SuperValidated<Data>;

	$: action = `/users/${dn}?/updateUser`;
	const dispatch = createEventDispatcher<{
		'name-change': NameChange;
	}>();
	const onChange: FormOptions<UpdateUserSchema>['onChange'] = ({ get, set, target }) => {
		if (target?.name === 'sAMAccountName') {
			const sAMAccountName = get('sAMAccountName');
			if (sAMAccountName) set('mail', `${sAMAccountName.toLowerCase()}@${PUBLIC_LDAP_DOMAIN}`);
			else set('mail', '');
		}
	};
	let toastId: string | number = NaN;

	const onSubmit: FormOptions<UpdateUserSchema>['onSubmit'] = () => {
		toastId = toast.loading('Updating user...', { duration: 30_000 });
	};

	const onResult: FormOptions<UpdateUserSchema, { nameChange: NameChange }>['onResult'] = async ({
		result
	}) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('User updated successfully!', {
					id: toastId,
					duration: undefined
				});
				open = false;
				if (result.data?.nameChange.newDn) dispatch('name-change', result.data.nameChange);
				else invalidate('protected:users');
				break;
			case 'error':
				toastError(result.error, toastId);
				break;
			case 'redirect':
				toast.dismiss(toastId);
				open = false;
				await applyAction(result);
				break;
		}
	};

	const onError: FormOptions<UpdateUserSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};

	let expandedUacFlags = false;
	$: {
		open;
		expandedUacFlags = false;
	}
	let anchorBottom: HTMLSpanElement;
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[calc(100svh-4rem)] !w-fit max-w-[calc(100vw-4rem)] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Update User</Dialog.Title>
			<Dialog.Description>Update the values in the following form</Dialog.Description>
		</Dialog.Header>
		<Form
			let:methods
			let:loading
			bind:form
			schema={updateUserSchema}
			formProps={{ action, enctype: 'multipart/form-data' }}
			formOptions={{
				resetForm: false,
				invalidateAll: false,
				onChange,
				onResult,
				onError,
				onSubmit
			}}
		>
			<input hidden name="base" value={base} />
			<div class="grid grid-cols-2 gap-4">
				<div class="col-span-2">
					<ImageInput
						name="jpegPhoto"
						b64Name="jpegPhotoBase64"
						{methods}
						adornmentRightClasses={cn('self-end')}
						inputProps={{ accept: ALLOWED_FILE_TYPES.join(',') }}
					>
						<svelte:fragment slot="label">jpegPhoto</svelte:fragment>
						<svelte:fragment slot="button-inner">Upload user profile picture</svelte:fragment>
						<svelte:fragment slot="description">
							Max file size {MAX_FILE_SIZE_MB}MB
						</svelte:fragment>
					</ImageInput>
				</div>
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
					<svelte:fragment slot="adornment-left">
						<Mail />
					</svelte:fragment>
				</Input>
				<div class="col-span-2">
					<Input name="description" {methods}>
						<svelte:fragment slot="label">description</svelte:fragment>
						<svelte:fragment slot="adornment-left">
							<Captions />
						</svelte:fragment>
					</Input>
				</div>
			</div>
			<Collapsible.Root
				bind:open={expandedUacFlags}
				onOpenChange={async () => {
					setTimeout(() => {
						anchorBottom.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}, 250);
				}}
			>
				<div class="flex items-center justify-start space-x-4">
					<Collapsible.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="sm" class="mb-2 gap-2">
							<h4 class="text-sm font-semibold">
								{#if expandedUacFlags}
									Hide user account control flags
								{:else}
									Show user account control flags
								{/if}
							</h4>
							<svelte:component
								this={expandedUacFlags ? ChevronsDownUp : ChevronsUpDown}
								class="size-4"
							/>
						</Button>
					</Collapsible.Trigger>
				</div>
				<Collapsible.Content>
					<div class="grid grid-cols-2 gap-2">
						{#each Object.entries(UserAccountControlTypes) as [uac, label]}
							<Checkbox name="uac.{uac}" {methods} inputProps={{ value: uac }}>
								<svelte:fragment slot="label">{label}</svelte:fragment>
							</Checkbox>
						{/each}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
			<Dialog.Footer>
				<Button type="button" variant="outline" on:click={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>Save</Button>
			</Dialog.Footer>
		</Form>
		<span bind:this={anchorBottom} />
	</Dialog.Content>
</Dialog.Root>
