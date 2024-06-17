<script lang="ts">
	import {
		AndFilter,
		EqualityFilter,
		NotFilter,
		OrFilter,
		SubstringFilter
	} from '$lib/ldap/filter';
	import type { User } from '$lib/types/user';
	import { createEventDispatcher } from 'svelte';
	import EntrySelect from '../entries/entry-select.svelte';
	export let selected: User[] = [];
	const dispatch = createEventDispatcher<{ select: User }>();
	const onSelect = ({ detail }: CustomEvent) => dispatch('select', detail);
</script>

<EntrySelect
	on:select={onSelect}
	bind:selected
	getFilter={(q) => {
		const objectClassFilter = new AndFilter({
			filters: [
				new NotFilter({
					filter: new EqualityFilter({ attribute: 'objectClass', value: 'computer' })
				}),
				...['top', 'person', 'user', 'organizationalPerson'].map(
					(value) => new EqualityFilter({ attribute: 'objectClass', value })
				)
			]
		});
		//filter for getting entries with q in sAMAccountName, givenName or sn
		const attributesFilter = new OrFilter({
			filters: ['sAMAccountName', 'givenName', 'sn'].map(
				(attribute) => new SubstringFilter({ attribute, any: [q] })
			)
		});
		return new AndFilter({ filters: [objectClassFilter, attributesFilter] });
	}}
>
	<svelte:fragment slot="no-entries">--- No users to select ---</svelte:fragment>
</EntrySelect>
