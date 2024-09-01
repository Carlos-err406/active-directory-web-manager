<script lang="ts" context="module">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import type { Methods } from './form.svelte';
	export type InputProps = CheckboxPrimitive.Props;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { cn } from '$lib/utils';
	import { Checkbox } from '../ui/checkbox';
	export let methods: Methods;
	const { form } = methods;

	export let name: keyof typeof $form;
	export let inputProps: InputProps = {};
	let checked = $form[name] as boolean;
	$: $form[name] = checked;
</script>

<Form.Field form={methods} {name}>
	<Form.Control let:attrs>
		<div class="flex items-center gap-2">
			<Checkbox
				{...attrs}
				{...inputProps}
				bind:checked
				on:click
				on:keydown
				aria-labelledby="label-for-{name}"
				class="transition-all [&_svg]:transition-all"
			/>
			<input name={attrs.name} value={$form[name]} hidden />
			<div class="space-y-1 leading-none">
				<Form.Label id="label-for-{name}" class={cn(inputProps.required && 'required')}>
					<slot name="label" />
				</Form.Label>
			</div>
			<Form.Description><slot name="description" /></Form.Description>
		</div>
	</Form.Control>
	<Form.FieldErrors data-test={name + '-error'} />
</Form.Field>
