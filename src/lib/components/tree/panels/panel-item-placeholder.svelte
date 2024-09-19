<script lang="ts">
	import { cn } from '$lib/utils';
	import Loader from 'lucide-svelte/icons/loader';
</script>

<div
	class={cn(
		'relative flex h-16 w-full min-w-80 cursor-progress items-center justify-center', //positioning and size
		'rounded border-[1px]', //border
		'p-1', //paddings
		'transition-all duration-200',
		'animate-pulse bg-accent' //bg
	)}
>
	<Loader class="flex size-6 animate-spin font-light" />
</div>
