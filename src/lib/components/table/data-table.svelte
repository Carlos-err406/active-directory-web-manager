<script lang="ts" context="module">
	import type { Table as HeadlessTable } from 'svelte-headless-table';
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
	import { derived, get } from 'svelte/store';

	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let viewModel: ViewModel;
	$: ({ tableAttrs, headerRows, tableBodyAttrs, pageRows } = viewModel);

	const pageParams = derived(page, ($page) => $page.url.searchParams);

	const setSortAndOrder = (id: string) => {
		const currentParams = derived(pageParams, ($pageParams) => {
			const params = new URLSearchParams($pageParams);
			params.set('order', $pageParams.get('order') === 'asc' ? 'desc' : 'asc');
			params.set('sort', id);
			return params;
		});
		return currentParams;
	};
</script>

<Table.Root {...$tableAttrs}>
	<Table.Header>
		{#each $headerRows as headerRow}
			<Subscribe rowAttrs={headerRow.attrs()}>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} props={cell.props()} let:attrs let:props>
							<Table.Head {...attrs}>
								{#if props.sort.disabled}
									<Render of={cell.render()} />
								{:else}
									{@const currentParams = setSortAndOrder(cell.id)}
									<Button
										variant="link"
										href="{$page.url.pathname}?{get(currentParams).toString()}"
										class="text-inherit hover:no-underline"
										on:click={props.sort.toggle}
									>
										<Render of={cell.render()} />
										{#if $pageParams.get('sort') === cell.id}
											{#if $pageParams.get('order') === 'desc'}
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
