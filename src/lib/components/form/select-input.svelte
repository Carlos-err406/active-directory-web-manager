<script lang="ts" context="module">
	import type { Methods } from './form.svelte';
	export type SelectProps = Partial<{ placeholder: string; required: boolean }>;
	export type SelectOption<T = unknown> = { label: string; value: T };
	/** creates a {label, value} array from an object, suitable to use at the options prop of SelectInput*/
	export const getSelectOptions = <T extends object>(options: T) =>
		Object.entries(options).map(([value, label]) => ({
			label: String(label) as T[keyof T],
			value: value as keyof T
		}));
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	export let methods: Methods;
	const { form } = methods;

	export let name: keyof typeof $form;
	export let selectProps: SelectProps = {};
	export let options: SelectOption[] = [];

	$: ({ placeholder, required } = selectProps);
</script>

<Form.Field form={methods} {name}>
	<Form.Control let:attrs>
		<Form.Label class={cn(required && 'required')}><slot name="label" /></Form.Label>
		<div class="relative">
			<div class="addornment absolute left-2 top-2.5">
				<slot name="addornment-left" />
			</div>
			<Select.Root
				selected={options.find((o) => o.value === $form[name])}
				onSelectedChange={(v) => v && ($form[name] = v.value)}
			>
				<Select.Trigger
					class={cn(
						!!$$slots['addornment-left'] && 'pl-10',
						!!$$slots['addornment-right'] && 'pr-10',
						'w-full'
					)}
					{...attrs}
				>
					<Select.Value {placeholder} />
				</Select.Trigger>
				<Select.Content>
					{#each options as { value, label }}
						<Select.Item {value} {label} />
					{:else}
						<p class="text-center">---No items to select---</p>
					{/each}
				</Select.Content>
			</Select.Root>
			<input hidden bind:value={$form[name]} name={attrs.name} />
			<div class="addornment absolute right-2 top-2.5">
				<slot name="addornment-right" />
			</div>
		</div>
	</Form.Control>
	<Form.Description><slot name="description" /></Form.Description>
	<Form.FieldErrors />
</Form.Field>