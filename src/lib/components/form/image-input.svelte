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
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { v4 } from 'uuid';
	import { Avatar, AvatarWithPreview } from '../ui/avatar';
	import { Button } from '../ui/button';

	export let methods: Methods;
	export let b64Name: keyof typeof $form;
	export let name: keyof typeof $form;
	export let inputProps: InputProps = {};
	export let imgClasses: ClassValue = '';
	export let addornmentClasses: ClassValue = '';
	export let addornmentRightClasses: ClassValue = '';
	export let addornmentLeftClasses: ClassValue = '';

	const { form } = methods;
	let fileList: FileList;
	let fileInput: HTMLInputElement;

	$: file = fileList?.[0];
	let src = ($form[b64Name] as string) || null;

	onMount(async () => {
		const url = $form[b64Name] as string;
		if (url) {
			const blob = await fetch(url).then((r) => r.blob());
			const f = new File([blob], v4(), { type: 'image/jpeg' });
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(f);
			fileList = dataTransfer.files;
			fileInput.files = fileList;
		}
	});

	const reset = () => {
		src = null;
		if (fileInput) {
			const dataTransfer = new DataTransfer();
			fileList = dataTransfer.files;
			fileInput.files = fileList;
		}
	};

	$: if (file) {
		const blob = new Blob([file], { type: file.type });
		blobToBase64(blob).then((value) => (src = value));
	}

	$: !open && reset();
</script>

<Form.Field form={methods} {name}>
	<Form.Control let:attrs>
		<Form.Label class={cn(inputProps.required && 'required')}><slot name="label" /></Form.Label>
		<slot {src} {file} base64={src}>
			<input
				hidden
				type="file"
				bind:this={fileInput}
				accept="image/*"
				bind:files={fileList}
				{...attrs}
				{...inputProps}
				{name}
			/>
		</slot>
		<input hidden type="text" name={b64Name} value={src} />
		<div class="flex items-center">
			<div class={cn('addornment', addornmentClasses, addornmentLeftClasses)}>
				<slot name="addornment-left" />
			</div>
			<div>
				{#if src}
					<div class="relative" in:slide={{ axis: 'y' }}>
						<Avatar class="size-32 rounded uppercase">
							<AvatarWithPreview alt="jpgPhoto" {src} class={cn(imgClasses)} />
							<div
								class="pointer-events-none absolute z-50 size-32 rounded-full border-2 border-dashed border-white"
							/>
						</Avatar>
					</div>
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
						<div in:slide={{ axis: 'y' }} class="ml-2 flex flex-col gap-3">
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
