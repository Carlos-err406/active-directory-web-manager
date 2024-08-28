<script>
	import { cn } from '$lib/utils';
</script>

<div
	class={cn(
		'flex flex-col items-center gap-2 p-2 ',
		'transition-all duration-200',
		'overflow-y-auto overflow-x-hidden',
		'border-r-2 border-muted-foreground',
		'h-full max-h-[calc(100svh-87px)] w-full min-w-[23rem]'
	)}
>
	<slot></slot>
</div>
