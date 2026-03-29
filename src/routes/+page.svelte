<script lang="ts">
	import { base } from '$app/paths';
	import { QUIZ_REGISTRY } from '$lib/data/registry';
	import type { QuizDefinition } from '$lib/quiz/definition';

	const categories: [string, QuizDefinition[]][] = [];
	for (const quiz of QUIZ_REGISTRY) {
		const existing = categories.find(([c]) => c === quiz.category);
		if (existing) existing[1].push(quiz);
		else categories.push([quiz.category, [quiz]]);
	}
</script>

<div class="min-h-screen bg-stone-900 text-stone-100 flex justify-center p-8">
	<div class="w-full max-w-lg space-y-8">
		<div class="text-center space-y-2">
			<h1 class="text-2xl font-bold">Latihan Bahasa</h1>
			<p class="text-stone-400 text-sm">Choose a practice</p>
		</div>

		<div class="space-y-6">
			<a
				href="{base}/quiz/random"
				class="block rounded-lg bg-stone-800 border border-stone-600 px-5 py-4
					hover:bg-stone-700 transition-colors"
			>
				<p class="font-medium">Random</p>
				<p class="text-stone-400 text-sm">Practice everything at once</p>
			</a>

			{#each categories as [category, quizzes]}
				<div class="space-y-3">
					<h2 class="text-sm font-medium tracking-widest uppercase text-stone-500">{category}</h2>
					{#each quizzes as quiz}
						<a
							href="{base}/quiz/{quiz.slug}"
							class="block rounded-lg bg-stone-800 border border-stone-700 px-5 py-4
								hover:bg-stone-700 transition-colors"
						>
							<p class="font-medium">{quiz.title}</p>
							<p class="text-stone-400 text-sm">{quiz.description}</p>
						</a>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>
