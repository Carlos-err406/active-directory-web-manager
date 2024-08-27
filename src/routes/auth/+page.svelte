<script lang="ts">
	import { PUBLIC_API_KEY } from '$env/static/public';
	import { toastError } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Loader from '$lib/components/ui/loader.svelte';
	import { signInSchema } from '$lib/schemas/sign-in-schema';
	import Bot from '$lucide/bot.svelte';
	import Mail from '$lucide/mail.svelte';
	import RefreshCcw from '$lucide/refresh-ccw.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	let captcha: string;
	let loadingCaptcha = true;

	const getCaptcha = async () => {
		loadingCaptcha = true;
		const svg = await fetch('/api/captcha', {
			headers: { Authorization: `Bearer ${PUBLIC_API_KEY}` }
		}).then((response) => response.text());
		loadingCaptcha = false;
		return svg;
	};

	const refreshCaptcha = async () => {
		captcha = await getCaptcha();
	};
	onMount(refreshCaptcha);
</script>

<main class="flex h-screen w-full items-center justify-center">
	<Form
		let:methods
		let:loading
		bind:form={data.form}
		schema={signInSchema}
		loadingText="Signing in..."
		formProps={{ action: '?/signIn', 'data-test': 'signInForm' }}
		formOptions={{
			resetForm: false,
			onError: ({ result }) => {
				toastError(result.error);
			}
		}}
	>
		<Card.Root class="w-full min-w-96 max-w-sm">
			<Card.Header>
				<Card.Title class="text-2xl">Sign in</Card.Title>
				<Card.Description>Enter your email below to sign in to your account.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Input
					inputProps={{
						placeholder: 'example@mail.com',
						type: 'email',
						required: true,
						'data-test': 'emailInput'
					}}
					{methods}
					name="email"
				>
					<svelte:fragment slot="label">Email</svelte:fragment>
					<svelte:fragment slot="adornment-left">
						<Mail />
					</svelte:fragment>
				</Input>
				<PasswordInput inputProps={{ required: true, 'data-test': 'passwordInput' }} {methods} />
				{#if loadingCaptcha}
					<div data-test="captchaLoader" class="my-10 flex w-full justify-center">
						<Loader size={'md'} />
					</div>
				{/if}
				<div
					data-loading={loadingCaptcha}
					class="relative flex w-full flex-row data-[loading=true]:hidden"
				>
					<div
						data-test="captcha"
						class="rounded"
						contenteditable="false"
						bind:innerHTML={captcha}
					/>
					<Button
						data-test="captcha-reload"
						variant="outline"
						type="button"
						class="absolute -bottom-3 -right-3 size-8 rounded-full p-0 transition-transform hover:-rotate-45"
						on:click={() => {
							refreshCaptcha();
							methods.form.update((f) => ({ ...f, captcha: '' }));
						}}
					>
						<RefreshCcw />
					</Button>
				</div>
				<Input
					{methods}
					name="captcha"
					inputProps={{
						type: 'text',
						required: true,
						placeholder: 'Enter captcha challenge',
						'data-test': 'captchaInput'
					}}
				>
					<svelte:fragment slot="label">Captcha</svelte:fragment>
					<svelte:fragment slot="adornment-left"><Bot /></svelte:fragment>
					<svelte:fragment slot="description">Proof you are not a robot</svelte:fragment>
				</Input>
			</Card.Content>
			<Card.Footer>
				<Button data-test="signInButton" type="submit" class="w-full" disabled={loading}
					>Sign in</Button
				>
			</Card.Footer>
		</Card.Root>
	</Form>
</main>
