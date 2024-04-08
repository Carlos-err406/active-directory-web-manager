<script lang="ts" context="module">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Methods } from './form.svelte';
	export type InputProps = Partial<Omit<HTMLInputAttributes, 'value' | 'name'>>;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import clsx from 'clsx';
	import { Input } from '../ui/input';
	export let methods: Methods;
	const { form } = methods;

	export let name: keyof typeof $form;
	export let inputProps: InputProps = {};
</script>

<Form.Field form={methods} {name}>
	<Form.Control let:attrs>
		<Form.Label class={clsx(inputProps.required && 'required')}><slot name="label" /></Form.Label>
		<div class="relative">
			<div class="addornment absolute left-2 top-2.5">
				<slot name="addornment-left" />
			</div>
			<Input
				class={clsx(
					!!$$slots['addornment-left'] && 'pl-10',
					!!$$slots['addornment-right'] && 'pr-10',
					'w-full'
				)}
				on:input
				on:change
				on:keydown
				on:keypress
				on:keyup
				bind:value={$form[name]}
				{...inputProps}
				{...attrs}
			/>
			<div class="addornment absolute right-2 top-2.5">
				<slot name="addornment-right" />
			</div>
		</div>
	</Form.Control>
	<Form.Description><slot name="description" /></Form.Description>
	<Form.FieldErrors />
</Form.Field>
