<script lang="ts">
	import { page } from '$app/stores';
	import {
		ColumnsDropdown,
		CreatedAtCell,
		DataTable,
		DataTableCheckbox,
		ResetFiltersDropdown
	} from '$lib/components/table';
	import {
		CreateUserDialog,
		DeleteManyUsersDialog,
		UserPhotoCell,
		UserTableActions
	} from '$lib/components/users';
	import UserAccountControlCell from '$lib/components/users/user-account-control-cell.svelte';
	import { breadcrumbs } from '$lib/stores';
	import { DataBodyCell, createRender, createTable } from 'svelte-headless-table';
	import { addHiddenColumns, addSelectedRows, addSortBy } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';
	export let data: PageData;
	breadcrumbs.set([{ name: 'Users' }]);

	$: ({ columns: configColumns } = $page.data.config.app.views.usersPage.table);

	$: hidableCols = [
		'jpegPhoto',
		'sAMAccountName',
		'dn',
		'displayName',
		'mail',
		'sn',
		'givenName',
		'description',
		'userAccountControl',
		'whenCreated'
	].filter((col) =>
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
				accessor: 'jpegPhoto',
				header: configColumns.jpegPhoto.header,
				cell: ({ value, row }) => {
					return createRender(UserPhotoCell, {
						jpegPhoto: value,
						sAMAccountName: (row.cellForId.sAMAccountName as unknown as { value: string }).value
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
				header: configColumns.sAMAccountName.header
			}),

			table.column({
				accessor: 'displayName',
				header: configColumns.displayName.header,
				cell: ({ value }) => value ?? '-'
			}),

			table.column({
				accessor: 'givenName',
				header: configColumns.givenName.header,
				cell: ({ value }) => value ?? '-'
			}),
			table.column({
				accessor: 'sn',
				header: configColumns.sn.header,
				cell: ({ value }) => value ?? '-'
			}),
			table.column({
				accessor: 'dn',
				header: configColumns.dn.header
			}),
			table.column({
				accessor: 'mail',
				header: configColumns.mail.header,
				cell: ({ value }) => value ?? '-'
			}),
			table.column({
				accessor: 'description',
				header: configColumns.description.header,
				cell: ({ value }) => value ?? '-'
			}),
			table.column({
				accessor: 'userAccountControl',
				header: configColumns.userAccountControl.header,
				cell: ({ value }) => {
					return createRender(UserAccountControlCell, {
						userAccountControl: Number(value)
					});
				}
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

<div class="w-full" data-test="usersPage">
	<div class="my-2 flex w-full justify-end gap-4">
		<ResetFiltersDropdown />
		<ColumnsDropdown hidableCols={hidableCols.map(String)} {flatColumns} />
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
