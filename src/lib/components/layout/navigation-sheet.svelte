<script>
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import {
		Home,
		LineChart,
		Package,
		Package2,
		PanelLeft,
		PanelRight,
		ShoppingCart,
		UsersRound
	} from 'lucide-svelte';
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
			{#if builder['aria-expanded'] === false}
				<PanelLeft class="h-5 w-5" />
			{:else}
				<PanelRight />
			{/if}
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="left" class="sm:max-w-xs">
		<nav class="grid gap-6 text-lg font-medium">
			<a
				href="##"
				class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
			>
				<Package2 class="h-5 w-5 transition-all group-hover:scale-110" />
				<span class="sr-only">Acme Inc</span>
			</a>
			<a
				href="##"
				class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
			>
				<Home class="h-5 w-5" />
				Dashboard
			</a>
			<a
				href="##"
				class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
			>
				<ShoppingCart class="h-5 w-5" />
				Orders
			</a>
			<a href="##" class="flex items-center gap-4 px-2.5 text-foreground">
				<Package class="h-5 w-5" />
				Products
			</a>
			<a
				href="##"
				class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
			>
				<UsersRound class="h-5 w-5" />
				Customers
			</a>
			<a
				href="##"
				class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
			>
				<LineChart class="h-5 w-5" />
				Settings
			</a>
		</nav>
	</Sheet.Content>
</Sheet.Root>
