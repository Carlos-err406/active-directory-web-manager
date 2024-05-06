<script lang="ts">
	import { page } from '$app/stores';
	import UserTableActions from '$lib/components/table/user-table-actions.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import ChevronUp from '$lucide/chevron-up.svelte';
	import ChevronDown from '$lucide/chevron-down.svelte';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import { addSortBy } from 'svelte-headless-table/plugins';
	import { get, readable } from 'svelte/store';
	import type { PageData } from './$types';
	export let data: PageData;

	$: ({ pagination } = data);
	$: table = createTable(readable(pagination.data), {
		sort: addSortBy({
			disableMultiSort: true
		})
	});

	$: columns = table.createColumns([
		table.column({
			accessor: 'sAMAccountName',
			header: 'sAMAccountName'
		}),
		table.column({
			accessor: 'distinguishedName',
			header: 'Distinguished Name'
		}),
		table.column({
			accessor: 'mail',
			header: 'Mail',
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

	$: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns));
	$: ({ searchParams } = $page.url);

	const setSortAndOrder = (id: string) => {
		const currentParams = new URLSearchParams(searchParams);
		currentParams.set('order', searchParams.get('order') === 'asc' ? 'desc' : 'asc');
		currentParams.set('sort', id);
		return currentParams;
	};
</script>

<div class="w-full rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs let:props props={cell.props()}>
								<Table.Head {...attrs}>
									{#if props.sort.disabled}
										<Render of={cell.render()} />
									{:else}
										{@const currentParams = setSortAndOrder(cell.id)}
										<Button
											variant="link"
											href="/users?{currentParams.toString()}"
											class="text-inherit hover:no-underline"
											on:click={props.sort.toggle}
										>
											<Render of={cell.render()} />
											{#if searchParams.get('sort') === cell.id && searchParams.get('order') === 'desc'}
												<ChevronUp class="ml-2 size-4" />
											{:else if searchParams.get('sort') === cell.id}
												<ChevronDown class="ml-2 size-4" />
											{:else}
												<span class="ml-2 size-4" />
											{/if}
										</Button>
									{/if}
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									{#if cell.state?.data && get(cell.state.data) && cell.dataRowColId()}
										<Render of={cell.render()} />
									{:else}
										-
									{/if}
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
	<Table.Pagination />
</div>
