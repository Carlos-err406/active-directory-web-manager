<script lang="ts">
	import Eye from 'lucide-svelte/icons/eye';
	import EyeOff from 'lucide-svelte/icons/eye-off';
	import LockKeyhole from 'lucide-svelte/icons/lock-keyhole';
	import { onDestroy } from 'svelte';
	import { Button } from '../ui/button';
	import type { Methods } from './form.svelte';
	import Input, { type InputProps } from './input.svelte';
	export let methods: Methods;
	export let name = 'password';
	export let { ...inputProps }: Omit<InputProps, 'type'> = {};
	let show = false;
	let timer: number;
	let countdown = 5;
	const { form } = methods;
	$: value = $form[name];
	const toggleShow = () => {
		show = !show;
		if (show) {
			countdown = 0;
			timer = window.setInterval(() => {
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
	{name}
	inputProps={{
		placeholder: '*****',
		...inputProps,
		type: show ? 'text' : 'password'
	}}
	{methods}
>
	<svelte:fragment slot="label">
		<slot name="label">Password</slot>
	</svelte:fragment>
	<svelte:fragment slot="adornment-left">
		<slot name="adornment-left">
			<LockKeyhole />
		</slot>
	</svelte:fragment>
	<svelte:fragment slot="adornment-right">
		<Button
			tabindex={-1}
			variant="ghost"
			class="h-fit rounded-full p-0"
			type="button"
			on:click={toggleShow}
		>
			{#if value}
				<div class="relative rounded-full border-2 border-transparent transition-all">
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
