<script lang="ts">
	import { UserAccountControlTypes, type UserAccountControl } from '$lib/types/user';
	export let userAccountControl: number;
	$: flags = Object.keys(UserAccountControlTypes).map(Number);
	$: match = flags.filter((uac) => uac & userAccountControl) as UserAccountControl[];

	$: value = match.map((uac) => UserAccountControlTypes[uac]).join(', ');
</script>

{value}
