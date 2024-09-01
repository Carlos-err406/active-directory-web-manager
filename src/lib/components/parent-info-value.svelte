<script lang="ts">
	import type { ParentDetailsConfig } from '$/app.config';
	import { PUBLIC_BASE_DN } from '$env/static/public';
	import Loader from '$lucide/loader.svelte';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { getCNFromDN } from '../ldap/utils';
	import { getEntryDetailedUrl, type EntryWithObjectClass } from '../utils';
	const config = getContext<Record<'parent', ParentDetailsConfig>>('config');
	export let parent: Promise<EntryWithObjectClass> | null;
</script>

{#if config.parent.show}
	{#await parent}
		<span>{config.parent.label}:</span>
		<span class="info-value">
			<div transition:slide={{ axis: 'y', duration: 200 }} class="flex w-full items-center gap-5">
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
						class="data-[isShort=true]:!mt-0 data-[isLink=true]:text-primary data-[isLink=true]:hover:underline"
						href={getEntryDetailedUrl(parent)}
					>
						{config.parent.shortParent ? getCNFromDN(parent.dn) : parent.dn}
					</svelte:element>
				{/if}
			</span>
		{/if}
	{/await}
{/if}
