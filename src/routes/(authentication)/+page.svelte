<script lang="ts">
	import { goto } from '$app/navigation';
	import { paths } from '$lib';
	import Form, { type ResultType } from '$lib/components/form/form.svelte';
	import Input from '$lib/components/form/input.svelte';
	import PasswordInput from '$lib/components/form/password-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { loginSchema as schema, type LoginSchema } from '$lib/schemas/login-schema';
	import { signIn } from '@auth/sveltekit/client';
	import { Mail } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	export let data: PageData;
	const extractData = (event: ResultType<LoginSchema>) => {
		const { result } = event;
		if (result.type !== 'success') {
			toast.error('Validation failure', { description: 'Check the errors!' });
			return null;
		}
		if (!result.data) {
			toast.error('Something went wrong', { description: 'No data?' });
			return null;
		}
		return result.data.form.data;
	};
	const onResult = async (event: ResultType<LoginSchema>) => {
		const data = extractData(event);
		if (!data) return;
		const res = await signIn('credentials', {
			...data,
			redirect: false,
			callbackUrl: paths.users.me
		});
		if (!res) {
			toast.error('Something went wrong', { description: 'No response?' });
			return;
		}
		const json = await res?.json();
		const url = new URL(json.url);
		const searchParams = url.searchParams;
		const error = searchParams.get('error');
		if (error) {
			if (error === 'CredentialsSignin') {
				toast.error('Invalid credentials', { description: 'Check your login!' });
			} else if (error === 'Configuration') {
				toast.error('Something went wrong', { description: 'Configuration error' });
			}
		} else {
			await goto(paths.users.me);
		}
	};
</script>

<Form
	let:methods
	bind:form={data.form}
	{schema}
	formProps={{ action: paths.auth + '?/signIn' }}
	formOptions={{
		validationMethod: 'oninput',
		resetForm: false,
		onResult
	}}
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account.</Card.Description>
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
		</Card.Content>
		<Card.Footer>
			<Button type="submit" class="w-full">Sign in</Button>
		</Card.Footer>
	</Card.Root>
</Form>
