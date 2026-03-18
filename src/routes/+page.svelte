<script lang="ts">
	import { numberToIndonesian, checkAnswer, type CheckResult } from '$lib/numbers';

	let number = $state(randomNumber());
	let input = $state('');
	let result: CheckResult | null = $state(null);

	function randomNumber() {
		// Weight toward smaller numbers initially, range 0–9999
		const ranges = [10, 100, 1000, 10000];
		const range = ranges[Math.floor(Math.random() * ranges.length)];
		return Math.floor(Math.random() * range);
	}

	function submit() {
		result = checkAnswer(number, input);
	}

	function next() {
		number = randomNumber();
		input = '';
		result = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (result?.correct) next();
			else submit();
		}
	}
</script>

<div class="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
	<div class="w-full max-w-lg space-y-8">
		<div class="text-center space-y-2">
			<h1 class="text-sm font-medium tracking-widest uppercase text-stone-500">Latihan Bahasa</h1>
			<p class="text-stone-400 text-sm">Type the Indonesian words for this number</p>
		</div>

		<div class="text-center">
			<p class="text-7xl font-bold tabular-nums tracking-tight">
				{number.toLocaleString()}
			</p>
		</div>

		<div class="space-y-4">
			<input
				type="text"
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Type Indonesian here..."
				disabled={result?.correct}
				class="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-3 text-lg
					placeholder:text-stone-600 focus:outline-none focus:border-stone-500
					disabled:opacity-50"
			/>

			{#if result}
				{#if result.correct}
					<div class="rounded-lg bg-emerald-900/50 border border-emerald-700/50 px-4 py-3 space-y-1">
						<p class="text-emerald-300 font-medium">Correct!</p>
						{#each result.warnings as warning}
							<p class="text-amber-400 text-sm">{warning}</p>
						{/each}
						<p class="text-stone-400 text-sm mt-2">Press Enter for next</p>
					</div>
				{:else}
					<div class="rounded-lg bg-red-900/30 border border-red-700/40 px-4 py-3 space-y-1">
						{#each result.errors as error}
							<p class="text-red-300 text-sm">{error}</p>
						{/each}
					</div>
				{/if}
			{/if}

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
					class="flex-1 rounded-lg bg-stone-800 border border-stone-700 px-4 py-2.5 font-medium
						hover:bg-stone-700 transition-colors"
				>
					{result?.correct ? 'Next' : 'Skip'}
				</button>
			</div>
		</div>

		<div class="text-center">
			<p class="text-stone-600 text-xs">
				Answer: <span class="select-all">{numberToIndonesian(number)}</span>
			</p>
		</div>
	</div>
</div>
