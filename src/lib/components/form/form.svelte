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

	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type ResultType<T extends ZodSchema = ZodSchema, K = Record<any, any>> = {
		result: ActionResult<{ form: SuperValidated<Infer<T>> } & K>;
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
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type FormOptions<T extends ZodSchema = ZodSchema, K = any> = Partial<
		Omit<_FormOptions, 'validators' | 'onResult' | 'onChange'>
	> & {
		onResult?: (event: ResultType<T, K>) => void;
		onChange?: (event: ChangeType<T>) => void;
	};
</script>

<script lang="ts">
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type ValidationAdapter } from 'sveltekit-superforms/adapters';

	export let schema: ZodSchema;
	export let formProps: Partial<Omit<HTMLFormAttributes, 'novalidate' | 'method'>> = {};
	export let formOptions: FormOptions<typeof schema>;
	export let form: Data | SuperValidated<Data>;
	export let formElement: HTMLFormElement | undefined = undefined;

	const methods = superForm(form, {
		validators: zodClient(schema),
		...(formOptions as _FormOptions),
		onChange: (event) => {
			if (formOptions.onChange) formOptions.onChange(event as ChangeType<typeof schema>);
		}
	});
	const { enhance, submitting, delayed, timeout, form: values } = methods;
</script>

<form bind:this={formElement} novalidate method="post" {...formProps} use:enhance>
	<slot {methods} loading={$submitting || $delayed || $timeout} values={$values} />
</form>
