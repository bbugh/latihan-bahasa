<script lang="ts">
	import { error } from '@sveltejs/kit';
	import Quiz from '$lib/components/Quiz.svelte';
	import { QUIZ_BY_SLUG } from '$lib/data/registry';
	import { singleDefinitionSession } from '$lib/quiz/session';

	let { data } = $props();

	const session = $derived.by(() => {
		const d = QUIZ_BY_SLUG.get(data.slug);
		if (!d) throw error(404, 'Quiz not found');
		return singleDefinitionSession(d);
	});
</script>

<Quiz {session} />
