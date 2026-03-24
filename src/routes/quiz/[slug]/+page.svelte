<script lang="ts">
	import Quiz from '$lib/Quiz.svelte';

	let { data } = $props();
</script>

<Quiz config={data.config} />
