<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import dayjs from 'dayjs';
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ user } = data);
</script>

<div class="h-full w-full py-12 md:py-16">
	<div class="container px-4 md:px-6">
		<div class="mx-auto max-w-3xl space-y-6">
			<div class="flex w-full items-center justify-center gap-10">
				<Avatar class="size-40 overflow-clip uppercase">
					{#if user.jpegPhoto?.length}
						{@const [, photoContent] = user.jpegPhoto.split('base64,')}
						<AvatarImage alt="jpgPhoto" src={photoContent} />
					{/if}
					<AvatarFallback
						class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-6xl font-bold text-gray-100 dark:bg-gray-100 dark:text-gray-800"
					>
						{user.sAMAccountName.slice(0, 2)}
					</AvatarFallback>
				</Avatar>
				<h1 class="text-3xl font-bold tracking-tight md:text-4xl">{user.sAMAccountName}</h1>
			</div>
			<div class="grid grid-cols-2 gap-y-3">
				{#if user.description}
					<span>Description</span>
					<span class="text-gray-500 dark:text-gray-400">{user.description}</span>
				{/if}
				<span>Account Created on:</span>
				<span class="text-gray-500 dark:text-gray-400">
					{dayjs(user.whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>Account Last Updated on:</span>
				<span class="text-gray-500 dark:text-gray-400">
					{dayjs(user.whenChanged.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A')}
				</span>
				<span>Member of:</span>
				<div class="flex flex-wrap space-y-2 text-gray-500 dark:text-gray-400">
					{#each user.memberOf || [] as groupDn}
						<span>
							{groupDn}
						</span>
					{:else}
						<span> - </span>
					{/each}
				</div>
				<span>Distinguished Name</span>
				<span class="text-gray-500 dark:text-gray-400">{user.dn}</span>
			</div>
		</div>
	</div>
</div>
