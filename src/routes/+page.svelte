<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { globalLoader } from '$lib/stores';

	$globalLoader = true;

	afterNavigate(() => {
		$globalLoader = false;
	});
</script>
