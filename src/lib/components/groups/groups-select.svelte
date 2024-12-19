<script lang="ts">
	import type { EntryWithObjectClass } from '$/lib/utils';
	import { AndFilter, EqualityFilter, OrFilter, SubstringFilter } from '$lib/ldap/filter';
	import type { Group } from '$lib/types/group';
	import { createEventDispatcher } from 'svelte';
	import EntrySelect from '../entries/entry-select.svelte';
	export let selected: EntryWithObjectClass<Group>[] = [];
	const dispatch = createEventDispatcher<{ select: EntryWithObjectClass<Group> }>();
	const onSelect = ({ detail }: CustomEvent) => dispatch('select', detail);
</script>

<EntrySelect
	on:select={onSelect}
	bind:selected
	getFilter={(q) => {
		const objectClassFilter = new EqualityFilter({ attribute: 'objectClass', value: 'group' });
		//filter for getting entries with q in sAMAccountName, givenName or sn
		const attributesFilter = new OrFilter({
			filters: ['sAMAccountName', 'givenName', 'sn'].map(
				(attribute) => new SubstringFilter({ attribute, any: [q] })
			)
		});
		return new AndFilter({ filters: [objectClassFilter, attributesFilter] });
	}}
>
	<svelte:fragment slot="no-entries">--- No groups to select ---</svelte:fragment>
</EntrySelect>
