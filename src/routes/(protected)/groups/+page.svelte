<script lang="ts">
	import { page } from '$app/stores';
	import {
		CreateGroupDialog,
		DeleteManyGroupsDialog,
		GroupTableActions
	} from '$lib/components/groups';
	import GroupTypeCell from '$lib/components/groups/group-type-cell.svelte';
	import {
		ColumnsDropdown,
		CreatedAtCell,
		DataTable,
		DataTableCheckbox,
		ResetFiltersDropdown
	} from '$lib/components/table';
	import { breadcrumbs } from '$lib/stores';
	import type { Group } from '$lib/types/group';
	import { DataBodyCell, createRender, createTable } from 'svelte-headless-table';
	import { addHiddenColumns, addSelectedRows, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
	export let data: PageData;
	breadcrumbs.set([{ name: 'Groups' }]);

	const hidableCols: (keyof Group)[] = [
		'dn',
		'sAMAccountName',
		'groupType',
		'description',
		'whenCreated'
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
			accessor: 'dn',
			header: 'distinguishedName'
		}),
		table.column({
			accessor: 'description',
			header: 'description',
			cell: ({ value }) => value ?? '-'
		}),
		table.column({
			accessor: 'groupType',
			header: 'groupType',
			cell: ({ value }) => {
				return createRender(GroupTypeCell, {
					groupType: Number(value)
				});
			}
		}),
		table.column({
			accessor: 'whenCreated',
			header: 'whenCreated',
			cell: ({ value }) => {
				return createRender(CreatedAtCell, {
					whenCreated: value
				});
			}
		})
	]);
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
					return createRender(GroupTableActions, { id: value });
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
		<ResetFiltersDropdown />
		<ColumnsDropdown {hidableCols} {flatColumns} />
		<CreateGroupDialog />
	</div>
	<DataTable viewModel={{ ...viewModel, flatColumns, rows, pluginStates }}>
		<svelte:fragment slot="selected-row-actions">
			<div transition:slide={{ axis: 'x' }}>
				<DeleteManyGroupsDialog dns={selectedDns} />
			</div>
		</svelte:fragment>
	</DataTable>
</div>
