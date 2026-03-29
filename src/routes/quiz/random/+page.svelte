<script lang="ts">
	import Quiz from '$lib/components/Quiz.svelte';
	import { QUIZ_REGISTRY } from '$lib/data/registry';
	import { randomSession } from '$lib/quiz/session';

	const session = randomSession(QUIZ_REGISTRY);
</script>

<Quiz {session} />
