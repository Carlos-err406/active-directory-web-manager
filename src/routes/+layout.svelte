<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/ui/loader.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { globalLoader } from '$lib/stores';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import NProgress from 'nprogress';
	import { toast } from 'svelte-sonner';
	import '../app.pcss';
	import '../nprogress.pcss';

	NProgress.configure({
		// Full list: https://github.com/rstacruz/nprogress#configuration
		minimum: 0.16,
		showSpinner: false,
		trickleSpeed: 100
	});

	beforeNavigate(() => {
		NProgress.start();
	});
	afterNavigate(() => {
		NProgress.done();
		const toastState = $page.state.toast;
		if (toastState) {
			toast[toastState.type](toastState.message, toastState.data);
		}
	});

	setMode('light');
</script>

<svelte:head>
	<title>Open Active Directory Manager</title>
</svelte:head>

<ModeWatcher defaultMode="light" track={false} disableTransitions={true} />
<Toaster richColors theme="light" />

{#if $globalLoader}
	<div
		class="fixed z-50 flex size-full items-center justify-center backdrop-blur-[2px] transition-all duration-200"
	>
		<Loader size="xl" />
	</div>
{/if}

<div class="flex h-full w-full">
	<slot />
</div>
