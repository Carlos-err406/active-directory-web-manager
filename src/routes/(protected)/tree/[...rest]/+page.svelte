<script lang="ts">
	import { breadcrumbs } from '$lib/stores';
	// import type { PageData } from './$types';
	// export let data: PageData;
	$: breadcrumbs.set([{ name: 'Tree view' }]);
</script>

<div data-test="treePage">under construction</div>
