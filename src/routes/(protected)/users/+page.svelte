<script lang="ts">
	import { page } from '$app/stores';
	import ColumnsDropdown from '$lib/components/table/columns-dropdown.svelte';
	import DataTable from '$lib/components/table/data-table.svelte';
	import UserTableActions from '$lib/components/table/user-table-actions.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addHiddenColumns, addSortBy } from 'svelte-headless-table/plugins';
	import { derived, readable } from 'svelte/store';
	import type { PageData } from './$types';
	export let data: PageData;

	$: ({ pagination } = data);
	const hiddenColumnIds = derived(
		page,
		($page) => $page.url.searchParams.get('hide')?.split(',') || []
	);

	$: table = createTable(readable(pagination.data), {
		sort: addSortBy({
			disableMultiSort: true
		}),
		hide: addHiddenColumns({
			initialHiddenColumnIds: $hiddenColumnIds
		})
	});

	$: columns = table.createColumns([
		table.column({
			accessor: 'sAMAccountName',
			header: 'sAMAccountName'
		}),
		table.column({
			accessor: 'distinguishedName',
			header: 'DistinguishedName'
		}),
		table.column({
			accessor: 'mail',
			header: 'Mail',
			cell: ({ value }) => value ?? '-'
		}),
		table.column({
			accessor: ({ dn }) => dn,
			header: '',
			plugins: {
				sort: { disable: true }
			},
			cell: ({ value }) => {
				return createRender(UserTableActions, { id: value });
			}
		})
	]);

	$: ({ flatColumns, ...rest } = table.createViewModel(columns));
	const hidableCols = ['sAMAccountName', 'distinguishedName', 'mail'];
</script>

<div class="w-full">
	<div class="my-2 flex w-full justify-end">
		<ColumnsDropdown {hidableCols} {flatColumns} />
	</div>
	<div class="w-full rounded-md border">
		<DataTable {...rest} />
	</div>
	<Table.Pagination />
</div>
