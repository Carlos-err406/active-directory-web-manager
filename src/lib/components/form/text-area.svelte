<script lang="ts" context="module">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { Methods } from './form.svelte';
	export type TextAreaProps = Partial<Omit<HTMLTextareaAttributes, 'value' | 'name'>>;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { cn } from '$lib/utils';
	import { Textarea } from '../ui/textarea';
	export let methods: Methods;
	const { form } = methods;
	export let name: keyof typeof $form;
	export let textAreaProps: TextAreaProps = {};
</script>

<Form.Field form={methods} {name}>
	<Form.Control let:attrs>
		<Form.Label class={cn(textAreaProps.required && 'required')}><slot name="label" /></Form.Label>
		<div class="relative">
			<div class="adornment absolute left-2 top-2.5">
				<slot name="adornment-left" />
			</div>
			<Textarea
				class={cn(
					!!$$slots['adornment-left'] && 'pl-10',
					!!$$slots['adornment-right'] && 'pr-10',
					'w-full'
				)}
				on:input
				on:keydown
				on:keypress
				on:keyup
				bind:value={$form[name]}
				{...textAreaProps}
				{...attrs}
			/>
			<div class="adornment absolute right-2 top-2.5">
				<slot name="adornment-right" />
			</div>
		</div>
	</Form.Control>
	<Form.Description><slot name="description" /></Form.Description>
	<Form.FieldErrors data-test={name + '-error'} />
</Form.Field>
