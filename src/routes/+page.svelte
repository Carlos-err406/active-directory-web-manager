<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { paths } from '$lib';
	import Form from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Loader from '$lib/components/ui/loader.svelte';
	import { signUpSchema } from '$lib/schemas/signup-schema';
	import Bot from '$lucide/bot.svelte';
	import Mail from '$lucide/mail.svelte';
	import RefreshCcw from '$lucide/refresh-ccw.svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	export let data: PageData;
	const refreshCaptcha = async () => await invalidate(paths.auth.dependencies.captcha);
</script>

<main class="flex h-screen w-full items-center justify-center">
	<Form
		let:methods
		let:loading
		bind:form={data.form}
		schema={signUpSchema}
		loadingText="Signing in..."
		formProps={{ action: paths.auth.actions.signIn }}
		formOptions={{
			resetForm: false,
			onError: ({ result }) => {
				toast.error(result.error.message);
			}
		}}
	>
		<Card.Root class="w-full max-w-sm">
			<Card.Header>
				<Card.Title class="text-2xl">Sign in</Card.Title>
				<Card.Description>Enter your email below to sign in to your account.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Input
					inputProps={{
						placeholder: 'example@mail.com',
						type: 'email',
						required: true
					}}
					{methods}
					name="email"
				>
					<svelte:fragment slot="label">Email</svelte:fragment>
					<svelte:fragment slot="addornment-left">
						<Mail />
					</svelte:fragment>
				</Input>
				<PasswordInput inputProps={{ required: true }} {methods} />
				{#if !data.captcha}
					<div class="my-10 flex w-full justify-center">
						<Loader size={'md'} />
					</div>
				{:else}
					<div class="relative flex w-full flex-row">
						<img src={data.captcha} alt="captcha" />
						<Button
							variant="outline"
							type="button"
							class="absolute -bottom-3 -right-3 size-8 rounded-full p-0 transition-transform hover:-rotate-45"
							on:click={() => refreshCaptcha()}
						>
							<RefreshCcw />
						</Button>
					</div>
				{/if}
				<Input
					{methods}
					name="captcha"
					inputProps={{ type: 'text', required: true, placeholder: 'Enter captcha challenge' }}
				>
					<svelte:fragment slot="label">Captcha</svelte:fragment>
					<svelte:fragment slot="addornment-left"><Bot /></svelte:fragment>
					<svelte:fragment slot="description">Proof you are not a robot</svelte:fragment>
				</Input>
			</Card.Content>
			<Card.Footer>
				<Button type="submit" class="w-full" disabled={loading}>Sign in</Button>
			</Card.Footer>
		</Card.Root>
	</Form>
</main>
