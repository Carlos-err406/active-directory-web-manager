<script lang="ts" context="module">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Methods } from './form.svelte';
	export type InputProps = Partial<Omit<HTMLInputAttributes, 'value' | 'name'>>;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { blobToBase64 } from '$lib/transforms';
	import { cn } from '$lib/utils';
	import Image from '$lucide/image.svelte';
	import Trash from '$lucide/trash-2.svelte';
	import type { ClassValue } from 'clsx';
	import { scale, slide } from 'svelte/transition';
	import { Button } from '../ui/button';

	export let methods: Methods;
	const { form } = methods;

	export let b64Name: keyof typeof $form;
	export let name: keyof typeof $form;
	export let inputProps: InputProps = {};
	export let imgClasses: ClassValue = '';
	export let addornmentClasses: ClassValue = '';
	export let addornmentRightClasses: ClassValue = '';
	export let addornmentLeftClasses: ClassValue = '';
	let fileList: FileList;
	$: file = fileList?.[0];
	let src: string | null = null;
	let fileInput: HTMLInputElement;
	let base64: string | null = null;
	const reset = () => {
		src = null;
		base64 = null;
		fileInput && (fileInput.value = '');
	};
	$: if (file) {
		const blob = new Blob([file], { type: file.type });
		src = URL.createObjectURL(blob);
		blobToBase64(blob).then((value) => (base64 = value));
	} else reset();

	$: !open && reset();
</script>

<Form.Field form={methods} {name}>
	<Form.Control let:attrs>
		<Form.Label class={cn(inputProps.required && 'required')}><slot name="label" /></Form.Label>
		<slot {src} {file} {base64}>
			<input
				hidden
				type="file"
				bind:this={fileInput}
				accept="image/*"
				bind:files={fileList}
				{...attrs}
				{...inputProps}
			/>
		</slot>
		<input hidden type="text" name={b64Name} value={base64} />
		<div class="flex items-center">
			<div class={cn('addornment', addornmentClasses, addornmentLeftClasses)}>
				<slot name="addornment-left" />
			</div>
			<div>
				{#if src}
					<img
						transition:scale={{ duration: 200 }}
						{src}
						class={cn('size-28', imgClasses)}
						alt="jpeg"
					/>
				{:else}
					<div in:slide={{ axis: 'y', duration: 200, delay: 200 }}>
						<Button on:click={() => fileInput.click()}>
							<slot name="button-inner" />
						</Button>
					</div>
				{/if}
			</div>
			<div class={cn('addornment', addornmentClasses, addornmentRightClasses)}>
				{#if src}
					<slot name="addornment-right">
						<div in:slide={{ axis: 'x' }} class="ml-2 flex flex-col gap-3">
							<Button on:click={() => fileInput.click()} class="w-fit">
								<Image />
							</Button>
							<Button on:click={reset} variant="outline" class="w-fit">
								<Trash />
							</Button>
						</div>
					</slot>
				{/if}
			</div>
		</div>
	</Form.Control>
	<Form.Description><slot name="description" /></Form.Description>
	<Form.FieldErrors />
</Form.Field>
