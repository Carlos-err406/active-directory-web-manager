<script lang="ts" context="module">
	import type { Table as HeadlessTable } from 'svelte-headless-table';
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type ViewModel = ReturnType<HeadlessTable<any>['createViewModel']>;
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import ChevronDown from '$lucide/chevron-down.svelte';
	import ChevronUp from '$lucide/chevron-up.svelte';
	import Chevrons from '$lucide/chevrons-up-down.svelte';
	import { Render, Subscribe } from 'svelte-headless-table';
	import { get } from 'svelte/store';

	export let viewModel: ViewModel;
	$: ({ tableAttrs, headerRows, tableBodyAttrs, pageRows, rows, pluginStates } = viewModel);
	$: ({ searchParams } = $page.url);
	$: ({ selectedDataIds } = pluginStates.select);
	const getSortAndOrderParams = (id: string) => {
		const params = new URLSearchParams(searchParams);
		params.set('order', searchParams.get('order') === 'asc' ? 'desc' : 'asc');
		params.set('sort', id);
		return params.toString();
	};
</script>

<div>
	<div class="flex h-fit max-h-[calc(100svh-220px)] min-h-48 w-full rounded-md border">
		<Table.Root {...$tableAttrs} class="h-fit">
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} props={cell.props()} let:attrs let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if props.sort.disabled}
											<Render of={cell.render()} />
										{:else}
											{@const search = getSortAndOrderParams(cell.id)}
											<Button
												variant="link"
												href="{$page.url.pathname}?{search}"
												class="text-inherit hover:no-underline"
												on:click={props.sort.toggle}
											>
												<Render of={cell.render()} />
												{#if searchParams.get('sort') === cell.id}
													{#if searchParams.get('order') === 'desc'}
														<ChevronUp class="ml-2 size-4" />
													{:else}
														<ChevronDown class="ml-2 size-4" />
													{/if}
												{:else}
													<Chevrons class="ml-2 size-4" />
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
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
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
	</div>
	<div class="flex w-full items-center justify-between py-4">
		<div class="hidden w-fit whitespace-nowrap text-sm text-muted-foreground md:block md:flex-1">
			{Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected.
		</div>
		<div class="mx-5 flex gap-5">
			{#if Object.keys($selectedDataIds).length}
				<slot name="selected-row-actions" />
			{/if}
		</div>
		<div>
			<Table.Pagination />
		</div>
	</div>
</div>
