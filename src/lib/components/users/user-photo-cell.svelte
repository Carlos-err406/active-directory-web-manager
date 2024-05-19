<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	export let jpegPhoto: string | undefined;
	export let sAMAccountName: string;
	$: src = jpegPhoto ?? null;
</script>

<Avatar class="size-16 overflow-clip uppercase">
	<AvatarImage alt="jpgPhoto" {src} />
	<AvatarFallback
		class="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-xl font-bold text-gray-100 dark:bg-gray-100 dark:text-gray-800"
	>
		<!-- content here -->
		{sAMAccountName.slice(0, 2)}
	</AvatarFallback>
</Avatar>
