<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover/';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import { cn } from '$lib/utils';
	import { CalendarDate, DateFormatter, fromDate, getLocalTimeZone } from '@internationalized/date';
	import type { DateRange } from 'bits-ui';
	import dayjs from 'dayjs';
	import Calendar from 'lucide-svelte/icons/calendar';
	import { derived } from 'svelte/store';

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});
	const urlStartDate = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const strValue = searchParams.get('fromDate');
		if (!strValue) {
			const fromDate = $page.data.defaults.fromDate
				? dayjs($page.data.defaults.fromDate)
				: undefined;
			return fromDate
				? new CalendarDate(fromDate.year(), fromDate.month() + 1, fromDate.date())
				: undefined;
		} else {
			const value = dayjs(strValue);
			return new CalendarDate(value.year(), value.month() + 1, value.date());
		}
	});
	const urlEndDate = derived(page, ($page) => {
		const { searchParams } = $page.url;
		const strValue = searchParams.get('toDate');
		if (!strValue) {
			const toDate = $page.data.defaults.toDate ? dayjs($page.data.defaults.toDate) : undefined;
			return toDate
				? new CalendarDate(toDate.year(), toDate.month() + 1, toDate.date())
				: undefined;
		} else {
			const value = dayjs(strValue);
			return new CalendarDate(value.year(), value.month() + 1, value.date());
		}
	});
	$: value = {
		start: $urlStartDate,
		end: $urlEndDate
	} satisfies DateRange | undefined;
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn('w-[250px] justify-start text-left font-normal', !value && 'text-muted-foreground')}
			builders={[builder]}
		>
			<Calendar class="mr-2 size-4 flex-none" />
			{#if value && value.start}
				{#if value.end}
					{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
						value.end.toDate(getLocalTimeZone())
					)}
				{:else}
					{df.format(value.start.toDate(getLocalTimeZone()))}
				{/if}
			{:else}
				Pick a date
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<RangeCalendar
			bind:value
			onValueChange={async (value) => {
				const copy = new URLSearchParams($page.url.searchParams);
				if (value?.start) {
					const start = dayjs(value.start.toDate(getLocalTimeZone())).format('YYYY-MM-DD');
					copy.set('fromDate', start);
				} else copy.delete('fromDate');

				if (value?.end) {
					const end = dayjs(value.end.toDate(getLocalTimeZone())).format('YYYY-MM-DD');
					copy.set('toDate', end);
				} else copy.delete('toDate');
				await goto(`${$page.url.pathname}?${copy}`);
			}}
			initialFocus
			numberOfMonths={1}
			placeholder={value?.start}
			minValue={fromDate(dayjs($page.data.minDate).toDate(), getLocalTimeZone())}
			maxValue={fromDate(new Date(), getLocalTimeZone())}
		/>
	</Popover.Content>
</Popover.Root>
