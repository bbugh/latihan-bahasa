<script lang="ts">
	import { tick } from 'svelte';
	import { base } from '$app/paths';
	import type { QuizConfig } from './quiz';
	import { createQuizState } from './stores/quiz.svelte';
	import HighlightInput from './HighlightInput.svelte';

	let { config }: { config: QuizConfig } = $props();

	// svelte-ignore state_referenced_locally — config is stable for the component's lifetime
	const quiz = createQuizState(config);
	let inputEl: HTMLInputElement | undefined = $state();

	async function handleNext() {
		quiz.next();
		await tick();
		inputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (quiz.isCorrect) handleNext();
			else quiz.submit();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
	<a href="{base}/" class="absolute top-6 left-6 text-stone-500 hover:text-stone-300 text-lg transition-colors">← Back</a>
	<div class="w-full max-w-lg space-y-8 h-[400px]">
		<div class="text-center space-y-2">
			<p class="text-stone-400 text-sm">{config.instruction}</p>
		</div>

		<div class="text-center">
			<p class="{quiz.question.promptStyle === 'number' ? 'text-7xl tabular-nums' : 'text-5xl'} font-bold tracking-tight">
				{quiz.question.prompt}
			</p>
		</div>

		<div class="space-y-4">
			<HighlightInput
				bind:value={quiz.input}
				bind:inputEl
				wrongSpans={quiz.wrongSpans}
				borderStyle={quiz.borderStyle}
				inputMode={quiz.question.inputMode ?? 'text'}
				placeholder={quiz.question.placeholder ?? 'Type your answer...'}
				readonly={quiz.isCorrect}
			/>

			<div class="flex gap-3">
				<button
					onclick={quiz.submit}
					disabled={!quiz.canSubmit}
					class="flex-1 rounded-lg bg-stone-700 px-4 py-2.5 font-medium
						hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					Check
				</button>
				{#if quiz.hasHints}
					<button
						onclick={quiz.showHint}
						disabled={!quiz.canHint}
						class="rounded-lg bg-stone-800 border border-stone-700 px-4 py-2.5 font-medium
							hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						Hint
					</button>
				{/if}
				<button
					onclick={handleNext}
					class="flex-1 rounded-lg px-4 py-2.5 font-medium transition-colors
						{quiz.isCorrect ? 'bg-emerald-900/50 border border-emerald-700/50 hover:bg-emerald-800/50' : 'bg-stone-800 border border-stone-700 hover:bg-stone-700'}"
				>
					{quiz.isCorrect ? 'Next' : 'Skip'}
				</button>
			</div>
		</div>

		<div class="text-center text-sm">
			{#if quiz.currentHint}
				<p class="text-amber-400 font-mono tracking-widest">{quiz.currentHint}</p>
			{/if}
			{#if quiz.isCorrect}
				<p class="text-emerald-400">Correct! Press Enter for next</p>
				{#each quiz.warnings as warning}
					<p class="text-amber-400">{warning}</p>
				{/each}
			{:else if quiz.errors.length > 0}
				{#each quiz.errors as error}
					<p class="text-red-400">{error}</p>
				{/each}
			{/if}
		</div>
	</div>
</div>
