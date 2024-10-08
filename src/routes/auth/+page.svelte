<script lang="ts">
	import { applyAction } from '$app/forms';
	import { PUBLIC_API_KEY } from '$env/static/public';
	import { toastError } from '$lib';
	import Form, { type FormOptions } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Loader from '$lib/components/ui/loader.svelte';
	import { signInSchema, type SignInSchema } from '$lib/schemas/sign-in-schema';
	import Bot from 'lucide-svelte/icons/bot';
	import Mail from 'lucide-svelte/icons/mail';
	import RefreshCcw from 'lucide-svelte/icons/refresh-ccw';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
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

	let toastId: number | string = NaN;

	const onSubmit: FormOptions<SignInSchema>['onSubmit'] = () => {
		toastId = toast.loading('Signing in...', { duration: 30_000 });
	};

	const onResult: FormOptions<SignInSchema>['onResult'] = async ({ result }) => {
		switch (result.type) {
			case 'success':
				break;
			case 'failure':
				toast.dismiss(toastId);
				break;
			case 'redirect':
				toastId = toast.success('Signed in successfully!', { id: toastId, duration: undefined });
				await applyAction(result);
				break;
		}
	};

	const onError: FormOptions<SignInSchema>['onError'] = ({ result }) => {
		toastError(result.error, toastId);
	};
</script>

<main class="flex h-screen w-full items-center justify-center">
	<Form
		let:methods
		let:loading
		bind:form={data.form}
		schema={signInSchema}
		formProps={{ action: '?/signIn', 'data-test': 'signInForm' }}
		formOptions={{
			resetForm: false,
			onSubmit,
			onResult,
			onError
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
