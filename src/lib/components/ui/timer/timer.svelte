<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let timeout: number;
	let animationFrameId: number;
	let startTime: number;
	let rotation = 0;
	const dispatch = createEventDispatcher();
	onMount(() => {
		animationFrameId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrameId);
	});
	const animate = (timestamp: number) => {
		if (startTime === undefined) {
			startTime = timestamp;
		}
		const timeElapsed = timestamp - startTime;

		if (timeElapsed < timeout) {
			const rotationValue = (360 * timeElapsed) / timeout;
			rotation = rotationValue;
			animationFrameId = requestAnimationFrame(animate);
		} else {
			rotation = 360;
			dispatch('completed');
			// The animation has completed; so we don't request another frame here
			return; // Exit the function to prevent requesting another animation frame
		}
	};
</script>

<div class="h-5 w-5">
	<svg viewBox="0 0 85 85" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor"  stroke-width={6} />
		<line x1="25" y1="15" x2="75" y2="15" stroke="currentColor"  stroke-width={6} />
		<line x1="50" y1="50" x2="50" y2="25" stroke="currentColor"  stroke-width={6} transform={`rotate(${rotation} 50 50)`} />
	</svg>
</div>
