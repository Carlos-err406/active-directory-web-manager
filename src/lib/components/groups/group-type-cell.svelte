<script lang="ts">
	import { GroupTypes, type GroupType } from '$lib/types/group';
	export let groupType: number;
	$: types = Object.keys(GroupTypes).map(Number);
	$: match = types.filter((gt) => gt & groupType) as GroupType[];

	//according to
	/**@link https://learn.microsoft.com/en-us/windows/win32/adschema/a-grouptype#remarks*/
	// if is not a security group (2147483648) then is a distribution list (0)
	$: !match.includes(2147483648) && (match = [0, ...match]);
	$: value = match.map((gt) => GroupTypes[gt]).join(', ');
</script>

{value}
