<script lang="ts">
	import { LogDateFilter, LogFilterReset, LogTypeFilter } from '$lib/components/logs/filters';
	import Log from '$lib/components/logs/log.svelte';
	import LogsSkeleton from '$lib/components/logs/logs-skeleton.svelte';
	import { getLogDate } from '$lib/components/logs/utils';
	import { breadcrumbs } from '$lib/stores';
	import type { PageData } from './$types';
	breadcrumbs.set([{ name: 'Logs' }]);
	export let data: PageData;
</script>

<div class="size-full space-y-2">
	<div class="flex w-full justify-end gap-2 pr-2">
		<LogFilterReset />
		<LogDateFilter />
		<LogTypeFilter />
	</div>
	{#await data.promise.logs}
		<LogsSkeleton />
	{:then logs}
		<ul class="flex h-[calc(100svh-142px)] w-full flex-col gap-1 overflow-y-auto text-xl">
			{#each logs as log, index}
				{@const date = getLogDate(log)}
				{@const prevDate = index !== 0 ? getLogDate(logs[index - 1]) : getLogDate(log)}
				{#if !date.isSame(prevDate, 'day') || index === 0}
					<p class="py-4 font-mono font-semibold text-muted-foreground first-of-type:pt-0">
						{date.format('MMMM DD, YYYY')}
					</p>
				{/if}
				<Log {log} />
			{/each}
		</ul>
	{/await}
</div>
