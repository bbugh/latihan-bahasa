<script lang="ts">
	import { error } from '@sveltejs/kit';
	import Quiz from '$lib/Quiz.svelte';
	import { QUIZ_BY_SLUG } from '$lib/quizzes';

	let { data } = $props();

	const config = $derived.by(() => {
		const c = QUIZ_BY_SLUG.get(data.slug);
		if (!c) throw error(404, 'Quiz not found');
		return c;
	});
</script>

<Quiz {config} />
