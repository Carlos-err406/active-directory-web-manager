<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	type $$Props = AvatarPrimitive.ImageProps;

	let className: $$Props['class'] = undefined;
	export let src: $$Props['src'] = undefined;
	export let alt: $$Props['alt'] = undefined;
	export { className as class };
	let objectUrl = '';
	onDestroy(() => objectUrl && URL.revokeObjectURL(objectUrl));
</script>

<button
	type="button"
	class="cursor-zoom-in"
	on:click={async () => {
		if (!src) {
			toast.error('Error loading the photo');
			return;
		}
		if (!objectUrl) {
			const blob = await fetch(src).then((r) => r.blob());
			objectUrl = URL.createObjectURL(blob);
		}
		window.open(objectUrl, '_blank');
	}}
>
	<AvatarPrimitive.Image
		{src}
		{alt}
		class={cn('aspect-square h-full w-full', className)}
		{...$$restProps}
	/>
</button>
