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
	export type ChangeType<T extends ZodSchema, K extends Data = Infer<T>> = ChangeEvent<K>;
	export type SubmitType = SubmitFunctionEventArg;
	export type FormOptions<T extends ZodSchema> = Partial<
		Omit<_FormOptions, 'validators' | 'onResult'>
	> & {
		onResult?: (event: ResultType<T>) => void;
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
	const triggerToast = () =>
		toast.loading(loadingText, {
			dismissable: true,
			important: false
		});
	const methods = superForm(form, {
		validators: zodClient(schema),
		...(formOptions as _FormOptions),
		onSubmit: (input) => {
			toastId = triggerToast();
			if (formOptions?.onSubmit) formOptions.onSubmit(input);
		}
	});
	const { enhance, submitting, delayed, timeout } = methods;
	const loading = derived(
		[submitting, delayed, timeout],
		([$submitting, $delayed, $timeout]) => $submitting || $delayed || $timeout
	);

	$: if (!$loading) killToast();
</script>

<form bind:this={formElement} {...formProps} novalidate method="post" use:enhance>
	<slot {methods} loading={$loading} />
</form>
