<script lang="ts">
	import { page } from '$app/stores';
	import { CreateOuDialog, DeleteManyOusDialog } from '$lib/components/organizational-units';
	import OuTableActions from '$lib/components/organizational-units/ou-table-actions.svelte';
	import {
		ColumnsDropdown,
		CreatedAtCell,
		DataTable,
		DataTableCheckbox,
		ResetFiltersDropdown
	} from '$lib/components/table';
	import { Button } from '$lib/components/ui/button';
	import { breadcrumbs } from '$lib/stores';
	import { DataBodyCell, createRender, createTable } from 'svelte-headless-table';
	import { addHiddenColumns, addSelectedRows, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
	export let data: PageData;
	breadcrumbs.set([{ name: 'Organizational Units' }]);
	$: ({ columns: configColumns } = $page.data.config.app.views.ousPage.table);

	$: hidableCols = ['name', 'dn', 'description', 'whenCreated'].filter((col) =>
		Object.entries(configColumns).some(([key, value]) => key === col && value.show && value.hidable)
	);

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

	$: columns = table.createColumns(
		[
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
				accessor: 'name',
				header: configColumns.name.header
			}),

			table.column({
				accessor: 'dn',
				header: configColumns.dn.header
			}),
			table.column({
				accessor: 'description',
				header: configColumns.description.header,
				cell: ({ value }) => value ?? '-'
			}),
			table.column({
				accessor: 'whenCreated',
				header: configColumns.whenCreated.header,
				cell: ({ value }) => {
					return createRender(CreatedAtCell, {
						whenCreated: value
					});
				}
			})
		].filter(
			(col) =>
				col.id === 'distinguishedName' ||
				Object.entries(configColumns).some(([key, value]) => key === col.id && value.show)
		)
	);
	$: data.session.isAdmin &&
		(columns = [
			...columns,
			table.column({
				accessor: ({ dn }) => dn,
				header: 'Actions',
				plugins: {
					sort: { disable: true }
				},
				cell: ({ value }) => {
					return createRender(OuTableActions, { dn: value });
				}
			})
		]);
	$: ({ flatColumns, pluginStates, rows, ...viewModel } = table.createViewModel(columns));
	$: ({ selectedDataIds } = pluginStates.select);

	$: selectedDns = Object.keys($selectedDataIds)
		.map((id) => $rows.find((row) => row.id === id)!)
		.map((row) => (row.cellForId.distinguishedName as unknown as DataBodyCell<string>).value)
		.filter(Boolean) as string[];

	let ouCreateDialogOpen = false;
</script>

<div class="w-full" data-test="ousPage">
	<div class="my-2 flex w-full justify-end gap-4">
		<ResetFiltersDropdown />
		<ColumnsDropdown {hidableCols} {flatColumns} />
		<Button on:click={() => (ouCreateDialogOpen = true)}>Create Organizational Unit</Button>
	</div>
	<DataTable viewModel={{ ...viewModel, flatColumns, rows, pluginStates }}>
		<svelte:fragment slot="selected-row-actions">
			<div transition:slide={{ axis: 'x' }}>
				<DeleteManyOusDialog dns={selectedDns} />
			</div>
		</svelte:fragment>
	</DataTable>
</div>

<CreateOuDialog bind:open={ouCreateDialogOpen} />
