<script lang="ts">
	import { tick } from 'svelte';
	import { base } from '$app/paths';
	import { checkVocabularyAnswer, randomPracticeItem, type VocabularySet, type VocabularyItem, type VocabularyCheckResult } from './vocabulary';

	let { vocabulary, instruction }: { vocabulary: VocabularySet; instruction: string } = $props();

	let item: VocabularyItem = $state($state.snapshot(randomPracticeItem(vocabulary)));
	let input = $state('');
	let result: VocabularyCheckResult | null = $state(null);
	let inputEl: HTMLInputElement;

	function submit() {
		result = checkVocabularyAnswer(item.answer, input);
	}

	async function next() {
		item = randomPracticeItem(vocabulary, item);
		input = '';
		result = null;
		await tick();
		inputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (result?.correct) next();
			else submit();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
	<a href="{base}/" class="absolute top-6 left-6 text-stone-500 hover:text-stone-300 text-lg transition-colors">← Back</a>
	<div class="w-full max-w-lg space-y-8 h-[400px]">
		<div class="text-center space-y-2">
			<p class="text-stone-400 text-sm">{instruction}</p>
		</div>

		<div class="text-center">
			<p class="text-5xl font-bold tracking-tight">
				{item.prompt}
			</p>
		</div>

		<div class="space-y-4">
			<input
				bind:this={inputEl}
				type="text"
				bind:value={input}
				autofocus
				placeholder="Type your answer..."
				readonly={result?.correct}
				class="w-full rounded-lg bg-stone-800 px-4 py-3 text-lg border
					placeholder:text-stone-600 focus:outline-none
					{result?.correct ? 'border-emerald-600' : result ? 'border-red-700' : 'border-stone-700 focus:border-stone-500'}"
			/>

			<div class="flex gap-3">
				<button
					onclick={submit}
					disabled={result?.correct || !input.trim()}
					class="flex-1 rounded-lg bg-stone-700 px-4 py-2.5 font-medium
						hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					Check
				</button>
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
			{#if result?.correct}
				<p class="text-emerald-400">Correct! Press Enter for next</p>
			{:else if result}
				{#each result.errors as error}
					<p class="text-red-400">{error}</p>
				{/each}
			{/if}
		</div>
	</div>
</div>
