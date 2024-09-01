<script lang="ts">
	import { getContext } from 'svelte';

	export let key: keyof typeof config;
	const entry = getContext<Record<string, string>>('entry');
	const config = getContext<Record<string, { show: boolean; label: string }>>('config');
</script>

{#if config?.[key].show && entry[key]}
	<span class="justify-self-end">{config[key].label}:</span>
	<span class="info-value">
		<slot>
			{entry[key]}
		</slot>
	</span>
{/if}
