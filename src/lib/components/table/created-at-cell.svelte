<script lang="ts">
	export let whenCreated: string;
	import dayjs from 'dayjs';
	$: value = dayjs(whenCreated.replace('Z', '')).format('MMMM D, YYYY. hh:mm:ss A');
</script>

{value || '-'}
