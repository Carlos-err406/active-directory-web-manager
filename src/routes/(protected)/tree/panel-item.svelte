<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import type { TreeEntry } from '$lib/types/tree';
	import { cn } from '$lib/utils';
	import { Building, Computer, Container, FileQuestion, User, Users } from '$lucide';
	import type { Action } from 'svelte/action';
	export let entry: TreeEntry;

	const isComputer = () => entry.objectClass.includes('computer');
	const isUser = () => entry.objectClass.includes('organizationalPerson');
	const isOu = () => entry.objectClass.includes('organizationalUnit');
	const isContainer = () => entry.objectClass.includes('container');
	const isGroup = () => entry.objectClass.includes('group');

	const getIcon = () => {
		if (isComputer()) {
			return Computer;
		} else if (isUser()) {
			return User;
		} else if (isOu()) {
			return Building;
		} else if (isContainer()) {
			return Container;
		} else if (isGroup()) {
			return Users;
		} else {
			return FileQuestion;
		}
	};
	const buildEntryUrl = () => {
		const { distinguishedName } = entry;
		const parts = distinguishedName.split(',');
		const dns = parts
			.map((_, index) => parts.slice(index).join(','))
			.slice(0, -2) //removing PUBLIC_BASE_DN
			.reverse();

		const url = '/tree/' + dns.join('/');
		return url;
	};

	const mayHaveChildren = () => isOu() || isContainer() || isGroup();

	$: isActive = decodeURIComponent($page.url.pathname).split('/').includes(entry.dn);

	let panelItemElement: HTMLElement;

	const focusThis: Action = (element: HTMLElement) => {
		if (isActive) element?.focus();
	};
	afterNavigate(() => {
		if (isActive) panelItemElement.parentElement?.focus();
	});
</script>

<svelte:element
	this={mayHaveChildren() ? 'a' : 'div'}
	use:focusThis
	tabindex="0"
	href={buildEntryUrl()}
	data-sveltekit-preload-data="tap"
	data-active={isActive}
	class={cn(
		'relative flex h-fit w-full min-w-80 cursor-pointer hover:translate-x-2', //positioning and size
		'rounded border-[1px] hover:shadow-md', //border
		'p-1 pl-10', //paddings
		'transition-all duration-200',
		'data-[active=true]:text-muted', //text color
		'data-[active=true]:bg-primary data-[active=false]:hover:bg-primary/10 data-[active=true]:hover:bg-primary/90 ' //bg
	)}
>
	<span bind:this={panelItemElement}></span>
	<svelte:component
		this={getIcon()}
		class="absolute left-2 top-1/2 flex size-6 flex-none origin-center -translate-y-1/2 font-light"
	/>

	<div class="flex !w-full flex-col p-1">
		<p class="w-full text-start font-semibold">
			{entry.name}
		</p>
		<p
			data-active={isActive}
			class="truncate text-start font-light text-muted-foreground data-[active=true]:text-muted/90"
		>
			{entry.dn}
		</p>
	</div>
</svelte:element>
