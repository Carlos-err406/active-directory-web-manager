<script lang="ts">
	import { page } from '$app/stores';
	import ColumnsDropdown from '$lib/components/table/columns-dropdown.svelte';
	import DataTable from '$lib/components/table/data-table.svelte';
	import * as Table from '$lib/components/ui/table';
	import UserTableActions from '$lib/components/users/user-table-actions.svelte';
	import { createRender, createTable } from 'svelte-headless-table';
	import { addHiddenColumns, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import type { PageData } from './$types';
	export let data: PageData;

	$: ({ pagination } = data);

	$: table = createTable(readable(pagination.data), {
		sort: addSortBy({
			disableMultiSort: true
		}),
		hide: addHiddenColumns({
			initialHiddenColumnIds: $page.url.searchParams.get('hide')?.split(',') || []
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

	$: ({ flatColumns, ...viewModel } = table.createViewModel(columns));
	const hidableCols = ['sAMAccountName', 'distinguishedName', 'mail', 'sn', 'givenName'];
</script>

<div class="w-full">
	<div class="my-2 flex w-full justify-end">
		<ColumnsDropdown {hidableCols} {flatColumns} />
	</div>
	<div class="rounded-md border">
		<DataTable viewModel={{ ...viewModel, flatColumns }} />
	</div>
	<Table.Pagination />
</div>
