<script lang="ts">
	import type { ParentDetailsConfig } from '$/app.config';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { getEntryDetailedUrl, getEntryIcon, type EntryWithObjectClass } from '$lib/utils';
	import Loader from '$lucide/loader.svelte';
	import { getContext } from 'svelte';
	const config = getContext<Record<'parent', ParentDetailsConfig>>('config');
	export let parent: Promise<EntryWithObjectClass> | null;
</script>

{#if config.parent.show}
	{#await parent}
		<span>{config.parent.label}:</span>
		<span class="info-value">
			<div class="flex w-full items-center gap-5">
				<Loader class="animate-spin" />
				<p>Loading parent</p>
			</div>
		</span>
	{:then parent}
		{#if parent}
			<span>{config.parent.label}:</span>
			<span class="info-value">
				{#if parent.dn === PUBLIC_BASE_DN}
					Root
				{:else}
					<svelte:element
						this={config.parent.asLink ? 'a' : 'p'}
						data-sveltekit-preload-data="hover"
						data-isLink={config.parent.asLink}
						data-isShort={config.parent.shortParent}
						class="flex items-center gap-x-2 data-[isLink=true]:text-primary data-[isLink=true]:hover:underline"
						href={getEntryDetailedUrl(parent)}
					>
						<svelte:component this={getEntryIcon(parent)} />
						{config.parent.shortParent ? getCNFromDN(parent.dn) : parent.dn}
					</svelte:element>
				{/if}
			</span>
		{/if}
	{/await}
{/if}
