<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { breadcrumbs } from '$lib/stores';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	breadcrumbs.set([{ name: `Error (${$page.status})` }]);
</script>

<div
	class="flex size-full flex-col items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800"
	data-test="errorCard"
>
	<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
		<div class="z-10 flex flex-col items-center space-y-4">
			<TriangleAlert class="size-12 text-red-500" />
			<div class="text-center">
				<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Something went wrong</h2>
				<p class="text-gray-600 dark:text-gray-400" data-test="errorStatus">
					Error code: {$page.status}
				</p>
			</div>
			<p class="font-semibold text-gray-600 dark:text-gray-400">
				{#if $page.error?.message}
					{$page.error.message}
				{:else}
					We apologize for the inconvenience. Please try again later or report the issue to our
					support team.
				{/if}
			</p>
			{#if $page.error?.errorId}
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Error ID: {$page.error.errorId}
				</p>
			{/if}
			<div class="flex space-x-4">
				<a
					target="_blank"
					class="inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
					href={`https://github.com/carlos-err406/active-directory-web-manager/issues/new?title=Error%20report&body=
					${$page.error?.errorId || ''}: ${$page.error?.message || ''}`}
				>
					Report Issue
				</a>

				<Button on:click={() => window.location.reload()}>Refresh</Button>
			</div>
		</div>
	</div>
</div>
