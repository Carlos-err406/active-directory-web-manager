<script lang="ts">
	import type { MemberDetailsConfig } from '$/app.config';
	import { getCNFromDN } from '$lib/ldap/utils';
	import { getEntryDetailedUrl, getEntryIcon, type EntryWithObjectClass } from '$lib/utils';
	import Loader from '$lucide/loader.svelte';
	import { getContext } from 'svelte';

	const config = getContext<Record<'memberOf', MemberDetailsConfig>>('config');
	export let memberOf: Promise<EntryWithObjectClass[]> | null;
</script>

{#if config.memberOf.show}
	{#await memberOf}
		<span>{config.memberOf.label}:</span>
		<div class="info-value flex flex-col gap-y-2" data-test="memberOf">
			<div class="flex w-full items-center gap-5">
				<Loader class="animate-spin" />
				<p>Loading membership</p>
			</div>
		</div>
	{:then memberOf}
		{#if memberOf}
			{@const sorted = memberOf.sort((a, b) => (a.dn < b.dn ? -1 : a.dn > b.dn ? 1 : 0))}
			<span>{config.memberOf.label}:</span>
			<div class="info-value flex flex-col gap-y-2" data-test="member">
				{#each sorted as member}
					{@const href = getEntryDetailedUrl(member)}
					<svelte:element
						this={config.memberOf.asLinks ? 'a' : 'p'}
						data-sveltekit-preload-data="hover"
						data-isLink={config.memberOf.asLinks}
						data-isShort={config.memberOf.shortMember}
						class="flex items-center gap-x-2 data-[isLink=true]:text-primary data-[isLink=true]:hover:underline"
						{href}
					>
						<svelte:component this={getEntryIcon(member)} class="size-6" />
						{config.memberOf.shortMember ? getCNFromDN(member.dn) : member.dn}
					</svelte:element>
				{:else}
					<span> - </span>
				{/each}
			</div>
		{/if}
	{/await}
{/if}
