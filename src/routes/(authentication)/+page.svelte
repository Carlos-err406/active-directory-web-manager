<script lang="ts">
	import { goto } from '$app/navigation';
	import Input from '$lib/components/form/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { loginSchema } from '$lib/schemas/login-schema';
	import { signIn } from '@auth/sveltekit/client';
	import { Eye, LockKeyholeIcon, Mail } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	export let data: PageData;

	const methods = superForm(data.form, {
		validators: zodClient(loginSchema),
		onResult: async (event) => {
			if (event.result.type !== 'success') return;
			const res = await signIn('credentials', {
				...$formData,
				redirect: false,
				callbackUrl: '/users/me'
			});
			const data: { url: string } = await res?.json();
			const url = new URL(data.url);
			const searchParams = url.searchParams;
			const error = searchParams.get('error');
			if (error) {
				if (error === 'CredentialsSignin') {
					toast.error('Invalid credentials');
				} else if (error === 'Configuration') {
					toast.error('Something went wrong');
				}
			} else {
				await goto('/users/me');
			}
		}
	});
	const { form: formData, enhance } = methods;
</script>

<form method="POST" action="?/signIn" use:enhance>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Input
				inputProps={{
					placeholder: 'example@mail.com',
					type: 'email'
				}}
				bind:value={$formData.email}
				{methods}
				name="email"
			>
				<svelte:fragment slot="label">Email</svelte:fragment>
				<svelte:fragment slot="addornment-left">
					<Mail />
				</svelte:fragment>
			</Input>
			<Input
				name="password"
				inputProps={{
					placeholder: '*****',
					type: 'password'
				}}
				bind:value={$formData.password}
				{methods}
			>
				<svelte:fragment slot="label">Password</svelte:fragment>
				<svelte:fragment slot="addornment-left">
					<LockKeyholeIcon />
				</svelte:fragment>
				<svelte:fragment slot="addornment-right">
					<Eye />
				</svelte:fragment>
			</Input>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" class="w-full">Sign in</Button>
		</Card.Footer>
	</Card.Root>
</form>
