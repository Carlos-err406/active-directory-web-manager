<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Navigation from '$lib/components/layout/navigation.svelte';
</script>

<div class="absolute h-full max-h-svh w-full overflow-y-auto rounded bg-muted/40">
	<Navigation />
	<div class="flex h-full w-full flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<Header />
		<main class="flex h-[calc(100svh-4rem-10px)] w-full rounded p-3">
			<slot />
		</main>
	</div>
</div>
