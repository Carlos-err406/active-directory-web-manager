<script lang="ts">
	import { page } from '$app/stores';
	import ColumnsDropdown from '$lib/components/table/columns-dropdown.svelte';
	import DataTableCheckbox from '$lib/components/table/data-table-checkbox.svelte';
	import DataTable from '$lib/components/table/data-table.svelte';
	import ResetFiltersButton from '$lib/components/table/reset-filters-dropdown.svelte';
	import CreateUserDialog from '$lib/components/users/create-user-dialog.svelte';
	import DeleteManyUsersDialog from '$lib/components/users/delete-many-users-dialog.svelte';
	import UserTableActions from '$lib/components/users/user-table-actions.svelte';
	import type { User } from '$lib/types/user';
	import { DataBodyCell, createRender, createTable } from 'svelte-headless-table';
	import { addHiddenColumns, addSelectedRows, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
	const hidableCols: (keyof User)[] = [
		'sAMAccountName',
		'dn',
		'displayName',
		'mail',
		'sn',
		'givenName',
		'description'
	];

	$: ({ pagination } = data);

	$: table = createTable(readable(pagination.data), {
		sort: addSortBy({
			disableMultiSort: true
		}),
		hide: addHiddenColumns({
			initialHiddenColumnIds: $page.url.searchParams.get('hide')?.split(',') || []
		}),
		select: addSelectedRows()
	});

	$: columns = table.createColumns([
		table.column({
			accessor: 'distinguishedName',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'sAMAccountName',
			header: 'sAMAccountName'
		}),

		table.column({
			accessor: 'displayName',
			header: 'displayName',
			cell: ({ value }) => value ?? '-'
		}),

		table.column({
			accessor: 'givenName',
			header: 'givenName',
			cell: ({ value }) => value ?? '-'
		}),
		table.column({
			accessor: 'sn',
			header: 'sn',
			cell: ({ value }) => value ?? '-'
		}),
		table.column({
			accessor: 'dn',
			header: 'distinguishedName'
		}),
		table.column({
			accessor: 'mail',
			header: 'mail',
			cell: ({ value }) => value ?? '-'
		}),
		table.column({
			accessor: 'description',
			header: 'description',
			cell: ({ value }) => value ?? '-'
		}),
		table.column({
			accessor: ({ dn }) => dn,
			header: 'Actions',
			plugins: {
				sort: { disable: true }
			},
			cell: ({ value }) => {
				return createRender(UserTableActions, { id: value });
			}
		})
	]);

	$: ({ flatColumns, pluginStates, rows, ...viewModel } = table.createViewModel(columns));
	$: ({ selectedDataIds } = pluginStates.select);

	$: selectedDns = Object.keys($selectedDataIds)
		.map((id) => $rows.find((row) => row.id === id)!)
		.map((row) => (row.cellForId.distinguishedName as unknown as DataBodyCell<string>).value)
		.filter(Boolean) as string[];
</script>

<div class="w-full">
	<div class="my-2 flex w-full justify-end gap-4">
		<ResetFiltersButton />
		<ColumnsDropdown {hidableCols} {flatColumns} />
		<CreateUserDialog />
	</div>
	<DataTable viewModel={{ ...viewModel, flatColumns, rows, pluginStates }}>
		<svelte:fragment slot="selected-row-actions">
			<div transition:slide={{ axis: 'x' }}>
				<DeleteManyUsersDialog dns={selectedDns} />
			</div>
		</svelte:fragment>
	</DataTable>
</div>
