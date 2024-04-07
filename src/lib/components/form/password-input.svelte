<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts">
	import { Eye, EyeOff, LockKeyholeIcon } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SuperForm } from 'sveltekit-superforms';
	import { Button } from '../ui/button';
	import Input, { type InputProps } from './input.svelte';
	export let methods: SuperForm<T>;
	export let value: HTMLInputAttributes['value'] = undefined;
	export let inputProps: Omit<InputProps, 'type'> = {};
	let show = false;
	let timer: number;
	let countdown = 5;
	const toggleShow = () => {
		show = !show;
		if (show) {
			countdown = 0;
			timer = setInterval(() => {
				if (++countdown === 5) {
					show = false;
					clearInterval(timer);
					return;
				}
			}, 1000);
		} else {
			clearInterval(timer);
		}
	};
	onDestroy(() => clearInterval(timer));
</script>

<Input
	name="password"
	inputProps={{
		placeholder: '*****',
		...inputProps,
		type: show ? 'text' : 'password'
	}}
	bind:value
	{methods}
>
	<svelte:fragment slot="label">
		<slot name="label">Password</slot>
	</svelte:fragment>
	<svelte:fragment slot="addornment-left">
		<slot name="addornment-left">
			<LockKeyholeIcon />
		</slot>
	</svelte:fragment>
	<svelte:fragment slot="addornment-right">
		<Button
			tabindex={-1}
			variant="ghost"
			class="h-fit rounded-full p-0"
			type="button"
			on:click={toggleShow}
		>
			{#if value}
				<div
					class="relative rounded-full border-2 border-transparent transition-all"
					class:border-muted-foreground={countdown < 5}
					class:border-r-transparent={countdown >= 1}
					class:border-b-transparent={countdown >= 2}
					class:border-l-transparent={countdown >= 3}
					class:border-t-transparent={countdown >= 4}
				>
					{#if show}
						<EyeOff />
					{:else}
						<Eye />
					{/if}
				</div>
			{/if}
		</Button>
	</svelte:fragment>
</Input>
