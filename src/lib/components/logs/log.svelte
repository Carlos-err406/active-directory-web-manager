<script lang="ts">
	import { isErrorLog } from './utils';
	export let log: string;

	const [date] = log.split('--');
	const content = log.split('--')[1].trim();
	const isError = isErrorLog(log);
</script>

<li class="w-full">
	<span
		class="font-mono font-semibold data-[is-error=false]:text-muted-foreground data-[is-error=true]:text-destructive"
		data-is-error={isError}
	>
		{date}
	</span>
	<span
		data-is-error={isError}
		class="font-semibold data-[is-error=false]:text-slate-700 data-[is-error=true]:text-destructive dark:data-[is-error=false]:text-slate-200"
	>
		{content}
	</span>
	<hr />
</li>
