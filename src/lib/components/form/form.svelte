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
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type ValidationAdapter } from 'sveltekit-superforms/adapters';
	import { derived } from 'svelte/store';

	export let schema: ZodSchema;
	export let formProps: Partial<Omit<HTMLFormAttributes, 'novalidate' | 'method'>> = {};
	export let formOptions: FormOptions<typeof schema>;
	export let form: Data | SuperValidated<Data>;
	export let formElement: HTMLFormElement | undefined = undefined;
	export let loadingText = 'Submitting...';
	const methods = superForm(form, {
		validators: zodClient(schema),
		...(formOptions as _FormOptions)
	});
	const { enhance, delayed, submitting, timeout } = methods;
	const loading = derived(
		[delayed, submitting, timeout],
		([$delayed, $submitting, $timeout]) => $delayed || $submitting || $timeout
	);

	let toastId: string | number | undefined = undefined;
	$: if ($loading) {
		toastId = toast.loading(loadingText, {
			dismissable: false,
			important: true
		});
	} else {
		toast.dismiss(toastId);
		toastId = undefined;
	}
</script>

<form bind:this={formElement} {...formProps} novalidate method="post" use:enhance>
	<slot {methods} loading={$loading} />
</form>
