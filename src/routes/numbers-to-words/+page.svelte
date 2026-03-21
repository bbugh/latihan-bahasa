<script lang="ts">
	import { tick } from 'svelte';
	import { numberToIndonesian, checkAnswer, randomPracticeNumber, type CheckResult } from '$lib/numbers';

	let number = $state(randomPracticeNumber());
	let input = $state('');
	let result: CheckResult | null = $state(null);
	let inputEl: HTMLInputElement;

	function submit() {
		result = checkAnswer(number, input);
	}

	async function next() {
		number = randomPracticeNumber();
		input = '';
		result = null;
		await tick();
		inputEl?.focus();
	}

	type ColoredSpan = { text: string; wrong: boolean };

	function buildOverlaySpans(text: string, wrongIndices: number[]): ColoredSpan[] {
		const spans: ColoredSpan[] = [];
		const wrongSet = new Set(wrongIndices);
		let wordIndex = 0;
		let i = 0;
		while (i < text.length) {
			if (text[i] === ' ') {
				// collect contiguous spaces
				let j = i;
				while (j < text.length && text[j] === ' ') j++;
				spans.push({ text: text.slice(i, j), wrong: false });
				i = j;
			} else {
				// collect a word
				let j = i;
				while (j < text.length && text[j] !== ' ') j++;
				spans.push({ text: text.slice(i, j), wrong: wrongSet.has(wordIndex) });
				wordIndex++;
				i = j;
			}
		}
		return spans;
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
	<a href="/" class="absolute top-6 left-6 text-stone-500 hover:text-stone-300 text-lg transition-colors">← Back</a>
	<div class="w-full max-w-lg space-y-8 h-[400px]">
		<div class="text-center space-y-2">
			<p class="text-stone-400 text-sm">Type the Indonesian words for this number</p>
		</div>

		<div class="text-center">
			<p class="text-7xl font-bold tabular-nums tracking-tight">
				{number.toLocaleString()}
			</p>
		</div>

		<div class="space-y-4">
			<div class="relative">
				<div
					aria-hidden="true"
					class="absolute inset-0 z-10 rounded-lg border border-transparent px-4 py-3 text-lg pointer-events-none whitespace-pre"
				>
					{#if result && !result.correct && result.wrongIndices.length > 0}
						{#each buildOverlaySpans(input, result.wrongIndices) as span}<span class={span.wrong ? 'text-red-400' : 'text-stone-100'}>{span.text}</span>{/each}
					{:else}
						<span class="text-transparent">{input}</span>
					{/if}
				</div>
				<input
					bind:this={inputEl}
					type="text"
					bind:value={input}
					autofocus
					placeholder="Type Indonesian here..."
					readonly={result?.correct}
					class="relative w-full rounded-lg bg-stone-800 px-4 py-3 text-lg border
						placeholder:text-stone-600 focus:outline-none
						{result?.correct ? 'border-emerald-600' : result ? 'border-red-700' : 'border-stone-700 focus:border-stone-500'}
						{result && !result.correct && result.wrongIndices.length > 0 ? 'text-transparent caret-stone-100' : ''}"
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
