<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/ui/loader.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { globalLoader } from '$lib/stores';
	import { ModeWatcher } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import '../app.pcss';

	afterNavigate(() => {
		const toastState = $page.state.toast;
		if (toastState) {
			toast[toastState.type](toastState.message, toastState.data);
		}
	});
</script>

<ModeWatcher defaultMode="light" />

<Toaster richColors theme="light" />

{#if $globalLoader}
	<div class="fixed z-50 flex h-screen w-full items-center justify-center backdrop-blur-sm">
		<Loader size="xl" />
	</div>
{/if}

<div class="flex h-full w-full">
	<slot />
</div>
