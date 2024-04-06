<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Input from '$lib/components/form/input.svelte';
	import { loginSchema } from '$lib/schemas/login-schema';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Loader from '$lib/components/ui/loader.svelte';
	import { Eye, LockKeyholeIcon, Mail } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { ActionData, PageData } from './$types';
	export let data: PageData;
	export let form: ActionData;
	const methods = superForm(data.form, {
		validators: zodClient(loginSchema)
	});
	$: if (form) {
		if (form.success) {
			toast.success('Login successful');
			goto('/users/me');
		} else {
			toast.error('Invalid credentials');
		}
	}
	const {
		form: formData,
		submitting,
		options: {}
	} = methods;
</script>

<form method="POST" use:enhance>
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
				form={methods}
				name="email"
				value={$formData.email}
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
				form={methods}
				value={$formData.password}
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
			<Button type="submit" class="w-full">
				<Loader condition={$submitting}>Sign in</Loader>
			</Button>
		</Card.Footer>
	</Card.Root>
</form>
