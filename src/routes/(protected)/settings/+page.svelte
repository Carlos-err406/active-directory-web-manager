<script lang="ts">
	import Checkbox from '$/lib/components/form/checkbox.svelte';
	import type { FormOptions } from '$/lib/components/form/form.svelte';
	import Form from '$/lib/components/form/form.svelte';
	import Input from '$/lib/components/form/input.svelte';
	import TextArea from '$/lib/components/form/text-area.svelte';
	import { Button } from '$/lib/components/ui/button';
	import { toastError } from '$/lib/index.js';
	import { saveConfigSchema, type SaveConfigSchema } from '$/lib/schemas/settings/save-schema';
	import { applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { breadcrumbs } from '$lib/stores';
	import Info from 'lucide-svelte/icons/info';
	import { toast } from 'svelte-sonner';
	breadcrumbs.set([{ name: 'Settings' }]);
	export let data;
	$: form = data.saveConfigForm;

	let toastId: string | number = NaN;

	const onSubmit: FormOptions<SaveConfigSchema>['onSubmit'] = () => {
		toastId = toast.loading('Saving config...', { duration: 30_000 });
	};

	const onResult: FormOptions<SaveConfigSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				toastId = toast.success('Config updated successfully!', {
					id: toastId,
					duration: undefined
				});
				await invalidateAll();
				await applyAction(result);
				break;
			case 'failure':
				toast.dismiss(toastId);
				break;
			case 'error':
				toastError(result.error, toastId);
				break;
			case 'redirect':
				toast.dismiss(toastId);
				applyAction(result);
		}
	};
	const onError: FormOptions<SaveConfigSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<Form
	let:loading
	let:methods
	bind:form
	schema={saveConfigSchema}
	formProps={{ action: '?/saveConfig', class: 'w-full space-y-5' }}
	formOptions={{
		resetForm: true,
		invalidateAll: true,
		onResult,
		onError,
		onSubmit
	}}
>
	<fieldset class="w-full border-t p-5">
		<legend class="px-1 text-center text-lg"> Captcha configuration </legend>
		<div class="grid w-full grid-cols-3 gap-4">
			<TextArea name="app_captcha_charPreset" {methods}>
				<svelte:fragment slot="label">
					<span>Captcha character preset</span>
				</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4 flex-none" />
						<span> All characters that can be used to generate the captcha.</span>
					</div>
				</svelte:fragment>
			</TextArea>
			<TextArea name="app_captcha_ignoreChars" {methods}>
				<svelte:fragment slot="label">
					<span>Captcha characters to avoid</span>
				</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> All characters that will be avoided in the captcha generation </span>
					</div>
				</svelte:fragment>
			</TextArea>
			<Input inputProps={{ type: 'number' }} name="app_captcha_size" {methods}>
				<svelte:fragment slot="label">
					<span>Captcha size</span>
				</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Amount of characters to use in the captcha </span>
					</div>
				</svelte:fragment>
			</Input>
		</div>
	</fieldset>

	<fieldset class="w-full border-t p-5">
		<legend class="px-1 text-center text-lg">Non admin permissions </legend>
		<div class="grid w-full grid-cols-3 gap-4">
			<Checkbox {methods} name="app_nonAdmin_allowSelfEdit">
				<svelte:fragment slot="label">Allow self edit</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Allow the users to edit their profile's data </span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_nonAdmin_allowAccessToGroupsPage">
				<svelte:fragment slot="label">Can access groups list</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Allow the users access the group pages </span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_nonAdmin_allowAccessToUsersPage">
				<svelte:fragment slot="label">Allow to see other user pages</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Allow the users see other user's pages besides its own profile</span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_nonAdmin_allowAccessToOUsPage">
				<svelte:fragment slot="label">Allow access to OU pages</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Allow the users access the OU pages </span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_nonAdmin_allowAccessToTreePage">
				<svelte:fragment slot="label">Allow access to Tree page</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Allow users to access the Tree page </span>
					</div>
				</svelte:fragment>
			</Checkbox>
		</div>
	</fieldset>
	<fieldset class="w-full border-t p-5">
		<legend class="px-1 text-center text-lg">Pages </legend>
		<div class="grid grid-cols-2 gap-4">
			<Checkbox {methods} name="app_groups_show">
				<svelte:fragment slot="label">Show groups page</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Show <a href="/groups" class="underline">groups</a> in the sidebar </span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_ous_show">
				<svelte:fragment slot="label">Show OUs page</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Show <a href="/ous" class="underline">OUs</a> in the sidebar </span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_tree_show">
				<svelte:fragment slot="label">Show tree page</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Show <a href="/tree" class="underline">tree</a> in the sidebar </span>
					</div>
				</svelte:fragment>
			</Checkbox>
			<Checkbox {methods} name="app_logs_show">
				<svelte:fragment slot="label">Show logs page</svelte:fragment>
				<svelte:fragment slot="description">
					<div class="flex items-center gap-2">
						<Info class="size-4" />
						<span> Show <a href="/logs" class="underline">logs</a> in the sidebar </span>
					</div>
				</svelte:fragment>
			</Checkbox>
		</div>
	</fieldset>
	<div class="flex w-full justify-end">
		<Button type="submit" disabled={loading}>Save</Button>
	</div>
</Form>
