<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createEventDispatcher } from 'svelte';
	import Check from 'lucide-svelte/icons/circle-check-big';
	export let open = false;
	const dispatch = createEventDispatcher();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-3 text-xl text-primary">
				<Check />
				<span>The group was created!</span>
			</Dialog.Title>
			<Dialog.Description>Add members now</Dialog.Description>
		</Dialog.Header>
		<div class="mb-5 text-lg">Would you like to add members now?</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" on:click={() => (open = false)}>No</Button>
			<Button
				tabindex={1}
				builders={[{ action: (element) => element.focus() }]}
				type="button"
				variant="default"
				on:click={() => {
					open = false;
					dispatch('open-add-members');
				}}
			>
				Yes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
