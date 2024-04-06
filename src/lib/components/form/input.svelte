<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import clsx from 'clsx';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SuperForm } from 'sveltekit-superforms';
	import { Input } from '../ui/input';
	export let name: string;
	export let form: SuperForm<any>;
	export let value: HTMLInputAttributes['value'];
	export let inputProps: Partial<HTMLInputAttributes> = {};
</script>

<Form.Field {form} {name}>
	<Form.Control let:attrs>
		<Form.Label><slot name="label" /></Form.Label>
		<div class="relative">
			<div class="absolute left-2 top-1">
				<slot name="addornment-left" />
			</div>
			<Input
				class={clsx(
					!!$$slots['addornment-left'] && 'pl-10',
					!!$$slots['addornment-right'] && 'pr-10'
				)}
				bind:value
				{...inputProps}
				{...attrs}
			/>
			<div class="absolute right-2 top-1">
				<slot name="addornment-right" />
			</div>
		</div>
	</Form.Control>
	<Form.Description><slot name="description" /></Form.Description>
	<Form.FieldErrors />
</Form.Field>
