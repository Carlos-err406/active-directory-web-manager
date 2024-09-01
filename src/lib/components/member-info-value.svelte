<script lang="ts">
	import type { MemberDetailsConfig } from '$/app.config';
	import Loader from '$lucide/loader.svelte';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { getCNFromDN } from '../ldap/utils';
	import { getEntryDetailedUrl, type EntryWithObjectClass } from '../utils';

	const config = getContext<Record<'member', MemberDetailsConfig>>('config');
	export let members: Promise<EntryWithObjectClass[]>;
</script>

{#if config.member.show}
	<span>{config.member.label}:</span>
	<div class="info-value flex flex-wrap space-y-2" data-test="member">
		{#await members}
			<div transition:slide={{ axis: 'y', duration: 200 }} class="flex w-full items-center gap-5">
				<Loader class="animate-spin" />
				<p>Loading members</p>
			</div>
		{:then members}
			{#each members.sort((a, b) => (a.dn < b.dn ? -1 : a.dn > b.dn ? 1 : 0)) as member, index}
				<!-- <svelte:element this={getEntryIcon(member)} /> -->
				{@const href = getEntryDetailedUrl(member)}
				<svelte:element
					this={config.member.asLinks ? 'a' : 'p'}
					data-sveltekit-preload-data="hover"
					data-isLink={config.member.asLinks}
					data-isShort={config.member.shortMember}
					class="data-[isShort=true]:!mt-0 data-[isLink=true]:text-primary data-[isLink=true]:hover:underline"
					{href}
				>
					{config.member.shortMember ? getCNFromDN(member.dn) : member.dn}
				</svelte:element>
				{#if config.member.shortMember && index < members.length - 1}
					<pre
						data-isShort={config.member.shortMember}
						class="!mx-0 font-sans data-[isShort=true]:!mt-0">, </pre>
				{/if}
			{:else}
				<span> - </span>
			{/each}
		{/await}
	</div>
{/if}
