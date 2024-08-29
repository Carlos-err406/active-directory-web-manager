<script lang="ts">
	import { goto } from '$app/navigation';
	import type { TreeEntry } from '$lib/types/tree';
	import { cn } from '$lib/utils';
	import Building2 from '$lucide/building-2.svelte';
	import Computer from '$lucide/computer.svelte';
	import Container from '$lucide/container.svelte';
	import FileQuestion from '$lucide/file-question.svelte';
	import User from '$lucide/user.svelte';
	import Users from '$lucide/users.svelte';
	import { onMount, setContext, tick } from 'svelte';
	import {
		isComputer,
		isContainer,
		isExpandedEntry,
		isGroup,
		isLastExpandedEntry,
		isOu,
		isUser
	} from '../utils';
	import PanelItemActions from './panel-item-actions.svelte';

	export let entry: TreeEntry;

	setContext('tree-entry', entry);

	const getIcon = () => {
		if (isComputer(entry)) return Computer;
		else if (isUser(entry)) return User;
		else if (isOu(entry)) return Building2;
		else if (isContainer(entry)) return Container;
		else if (isGroup(entry)) return Users;
		else return FileQuestion;
	};

	const mayHaveChildren = () => isOu(entry) || isContainer(entry) || isGroup(entry);
	const handleItemClick = async () => {
		const { distinguishedName } = entry;

		if (mayHaveChildren()) {
			const parts = distinguishedName.split(',');
			const RDNs = parts.reverse().slice(2); //removing PUBLIC_BASE_DN
			await goto(`/tree/${encodeURIComponent(RDNs.join('/'))}`, { invalidateAll: true });
		} else {
			if (isUser(entry)) {
				await goto(`/users/${encodeURIComponent(distinguishedName)}`, { invalidateAll: true });
			}
		}
	};

	let panelItemElement: HTMLButtonElement;
	onMount(() => {
		if (isLastExpandedEntry(entry)) {
			tick().then(() => panelItemElement.scrollIntoView({ behavior: 'auto', block: 'center' }));
			// tick().then(() => panelItemElement.scrollIntoView({ behavior: 'instant', block: 'center' }));
		}
	});
</script>

<button
	bind:this={panelItemElement}
	type="button"
	on:click|self={handleItemClick}
	data-active={isExpandedEntry(entry)}
	class={cn(
		'relative flex h-fit w-full min-w-80 cursor-pointer self-start', //positioning and size
		'rounded border-[1px] hover:shadow-md', //border
		'p-1 pl-10', //paddings
		'transition-all duration-200',
		'data-[active=true]:text-muted', //text color
		'data-[active=true]:bg-primary data-[active=false]:hover:bg-primary/10 data-[active=true]:hover:bg-primary/90 ' //bg
	)}
>
	<svelte:component
		this={getIcon()}
		class="pointer-events-none absolute left-2 top-1/2 flex size-6 flex-none origin-center -translate-y-1/2 font-light"
	/>
	<div class="absolute right-1 top-1 size-fit">
		<PanelItemActions />
	</div>
	<div class="pointer-events-none flex !w-full flex-col p-1">
		<p class="w-full text-start font-semibold">
			{entry.name}
		</p>
		<p
			data-active={isExpandedEntry(entry)}
			class="truncate text-start font-light text-muted-foreground data-[active=true]:text-muted/90"
		>
			{entry.dn}
		</p>
	</div>
</button>
