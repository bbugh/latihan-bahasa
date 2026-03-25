<script lang="ts">
	import { tick } from 'svelte';
	import { base } from '$app/paths';
	import type { QuizConfig, QuizCheckResult, QuizQuestion } from './quiz';

	let { config }: { config: QuizConfig } = $props();

	// svelte-ignore state_referenced_locally — config is stable for the component's lifetime
	let question: QuizQuestion = $state(config.generate());
	let input = $state('');
	let result: QuizCheckResult | null = $state(null);
	let hintIndex = $state(0);
	let inputEl: HTMLInputElement;

	function submit() {
		result = question.check(input);
	}

	async function next() {
		question = config.generate(question);
		input = '';
		result = null;
		hintIndex = 0;
		await tick();
		inputEl?.focus();
	}

	function showHint() {
		if (hintIndex < question.hints.length) {
			hintIndex++;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (result?.correct) next();
			else submit();
		}
	}

	function isInWrongSpan(charIndex: number, spans: [number, number][]): boolean {
		return spans.some(([start, end]) => charIndex >= start && charIndex < end);
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
			<p class="{question.promptStyle === 'number' ? 'text-7xl tabular-nums' : 'text-5xl'} font-bold tracking-tight">
				{question.prompt}
			</p>
		</div>

		<div class="space-y-4">
			<div class="relative">
				<div
					aria-hidden="true"
					class="absolute inset-0 z-10 rounded-lg border border-transparent px-4 py-3 text-lg pointer-events-none whitespace-pre"
				>
					{#if result && !result.correct && result.wrongSpans.length > 0}
						{#each [...input] as char, i}<span class={isInWrongSpan(i, result.wrongSpans) ? 'text-red-400' : 'text-stone-100'}>{char}</span>{/each}
					{:else}
						<span class="text-transparent">{input}</span>
					{/if}
				</div>
				<input
					bind:this={inputEl}
					type="text"
					inputmode={question.inputMode === 'numeric' ? 'numeric' : 'text'}
					bind:value={input}
					autofocus
					placeholder={question.placeholder ?? 'Type your answer...'}
					readonly={result?.correct}
					class="relative w-full rounded-lg bg-stone-800 px-4 py-3 text-lg border
						placeholder:text-stone-600 focus:outline-none
						{result?.correct ? 'border-emerald-600' : result ? 'border-red-700' : 'border-stone-700 focus:border-stone-500'}
						{result && !result.correct && result.wrongSpans.length > 0 ? 'text-transparent caret-stone-100' : ''}"
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={submit}
					disabled={result?.correct || !input.trim()}
					class="flex-1 rounded-lg bg-stone-700 px-4 py-2.5 font-medium
						hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					Check
				</button>
				{#if question.hints.length > 0}
					<button
						onclick={showHint}
						disabled={result?.correct || hintIndex >= question.hints.length}
						class="rounded-lg bg-stone-800 border border-stone-700 px-4 py-2.5 font-medium
							hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						Hint
					</button>
				{/if}
				<button
					onclick={next}
					class="flex-1 rounded-lg px-4 py-2.5 font-medium transition-colors
						{result?.correct ? 'bg-emerald-900/50 border border-emerald-700/50 hover:bg-emerald-800/50' : 'bg-stone-800 border border-stone-700 hover:bg-stone-700'}"
				>
					{result?.correct ? 'Next' : 'Skip'}
				</button>
			</div>
		</div>

		<div class="text-center text-sm">
			{#if hintIndex > 0}
				<p class="text-amber-400 font-mono tracking-widest">{question.hints[hintIndex - 1]}</p>
			{/if}
			{#if result?.correct}
				<p class="text-emerald-400">Correct! Press Enter for next</p>
				{#each result.warnings as warning}
					<p class="text-amber-400">{warning}</p>
				{/each}
			{:else if result}
				{#each result.errors as error}
					<p class="text-red-400">{error}</p>
				{/each}
			{/if}
		</div>
	</div>
</div>
