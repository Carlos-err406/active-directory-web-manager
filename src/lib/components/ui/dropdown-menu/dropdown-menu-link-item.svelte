<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type $$Props = HTMLAnchorAttributes & {
		disabled?: boolean;
	};
	type $$Events = DropdownMenuPrimitive.ItemEvents;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<a
	data-sveltekit-preload-data="hover"
	class={cn(
		'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50',
		className,
		$$restProps.disabled && 'pointer-events-none !cursor-not-allowed opacity-70'
	)}
	on:focusin
	on:focusout
	on:pointerdown
	on:pointerleave
	on:pointermove
	href={$$props.href}
	{...$$restProps}
>
	<slot />
</a>
