<script>
	import '../app.pcss';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import Loader from '$lib/components/ui/loader.svelte';
	import { globalLoader } from '$lib/stores';
</script>

<ModeWatcher defaultMode="light" />

<Toaster richColors theme="light" />

{#if $globalLoader}
	<div class="fixed z-50 flex h-screen w-full items-center justify-center backdrop-blur-sm">
		<Loader size="xl" />
	</div>
{/if}

<slot />
