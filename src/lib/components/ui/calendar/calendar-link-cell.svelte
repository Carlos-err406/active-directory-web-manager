<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils.js';
	import { getLocalTimeZone } from '@internationalized/date';
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import dayjs from 'dayjs';
	import { derived } from 'svelte/store';

	type $$Props = CalendarPrimitive.CellProps & { param?: string };

	export let date: $$Props['date'];
	let className: $$Props['class'] = undefined;
	export { className as class };
	export let param = 'date';

	const href = derived(page, ($page) => {
		const formatted = dayjs(date.toDate(getLocalTimeZone())).format('YYYY-MM-DD');
		const copy = $page.url.searchParams;
		copy.set(param, formatted);
		return `${$page.url.pathname}?${copy}`;
	});
</script>

<CalendarPrimitive.Cell
	{date}
	class={cn(
		'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 data-[disabled]:pointer-events-none data-[disabled]:cursor-default [&:has([data-selected])]:rounded-md [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50',
		className
	)}
	{...$$restProps}
>
	<a href={$href} data-sveltekit-preload-data="hover" class="size-full">
		<slot />
	</a>
</CalendarPrimitive.Cell>
