<script lang="ts" context="module">
	import {
		type ChangeEvent,
		type Infer,
		type SuperForm,
		type FormOptions as _FormOptions
	} from 'sveltekit-superforms';
	import type { ZodSchema } from 'zod';

	type SubmitFunctionEventArg = Parameters<SubmitFunction>[0] & {
		jsonData: (data: Data) => void;
		validators: (validators: Exclude<ValidatorsOption<Data>, 'clear'>) => void;
	};
	export type Data = Record<string, unknown>;
	export type Methods<T extends Data = Data> = SuperForm<T, unknown>;
	export type ValidatorsOption<T extends Data> =
		| ValidationAdapter<Partial<T>, Data>
		| false
		| 'clear';

	export type ResultType<T extends ZodSchema> = {
		result: ActionResult<{ form: SuperValidated<Infer<T>> }>;
		formEl: HTMLFormElement;
		formElement: HTMLFormElement;
		cancel: () => void;
	};
	export type ChangeType<T extends ZodSchema, K extends Data = Infer<T>> = Omit<
		ChangeEvent<K>,
		'target'
	> & {
		target?: HTMLInputElement;
	};

	export type SubmitType = SubmitFunctionEventArg;
	export type FormOptions<T extends ZodSchema> = Partial<
		Omit<_FormOptions, 'validators' | 'onResult' | 'onChange'>
	> & {
		onResult?: (event: ResultType<T>) => void;
		onChange?: (event: ChangeType<T>) => void;
	};
</script>

<script lang="ts">
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { derived } from 'svelte/store';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type ValidationAdapter } from 'sveltekit-superforms/adapters';

	export let schema: ZodSchema;
	export let formProps: Partial<Omit<HTMLFormAttributes, 'novalidate' | 'method'>> = {};
	export let formOptions: FormOptions<typeof schema>;
	export let form: Data | SuperValidated<Data>;
	export let formElement: HTMLFormElement | undefined = undefined;
	export let loadingText = 'Submitting...';

	let toastId: string | number | undefined = undefined;
	const killToast = () => {
		toast.dismiss(toastId);
		toastId = undefined;
	};
	const triggerToast = () => {
		toastId = toast.loading(loadingText, {
			dismissable: true,
			important: false
		});
	};
	const methods = superForm(form, {
		validators: zodClient(schema),
		...(formOptions as _FormOptions),
		onSubmit: (input) => {
			triggerToast();
			if (formOptions?.onSubmit) formOptions.onSubmit(input);
		},
		onChange: (event) => {
			if (formOptions.onChange) formOptions.onChange(event as ChangeType<typeof schema>);
		}
	});
	const { enhance, submitting, delayed, timeout, form: methodsForm } = methods;

	const loading = derived(
		[submitting, delayed, timeout],
		([$submitting, $delayed, $timeout]) => $submitting || $delayed || $timeout
	);

	const changed = derived(methodsForm, ($methodsForm) => {
		let diff = false;
		const formData = Object(form.data);
		const formEntries = Object.entries(formData);
		for (let i = 0; i < formEntries.length; i++) {
			const [key, value] = formEntries[i];
			diff = JSON.stringify($methodsForm[key]) !== JSON.stringify(value);
			if (diff) return true;
		}
		const methodEntries = Object.entries($methodsForm);
		for (let i = 0; i < methodEntries.length; i++) {
			const [key, value] = methodEntries[i];
			diff = JSON.stringify(formData[key]) !== JSON.stringify(value);
			if (diff) return true;
		}
		return false;
	});
	$: if (!$loading) killToast();
</script>

<form bind:this={formElement} novalidate method="post" {...formProps} use:enhance>
	<slot {methods} loading={$loading} changed={$changed} />
</form>
