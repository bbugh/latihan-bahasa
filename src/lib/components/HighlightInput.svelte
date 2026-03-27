<script lang="ts">
	let {
		value = $bindable(''),
		wrongSpans = [],
		placeholder = 'Type your answer...',
		inputMode = 'text',
		readonly = false,
		borderStyle = 'default',
		inputEl = $bindable<HTMLInputElement | undefined>(undefined),
	}: {
		value?: string;
		wrongSpans?: [number, number][];
		placeholder?: string;
		inputMode?: 'text' | 'numeric';
		readonly?: boolean;
		borderStyle?: 'default' | 'correct' | 'error';
		inputEl?: HTMLInputElement | undefined;
	} = $props();

	function isInWrongSpan(charIndex: number): boolean {
		return wrongSpans.some(([start, end]) => charIndex >= start && charIndex < end);
	}

	const hasHighlights = $derived(wrongSpans.length > 0);

	const borderClass = $derived(
		borderStyle === 'correct' ? 'border-emerald-600'
		: borderStyle === 'error' ? 'border-red-700'
		: 'border-stone-700 focus:border-stone-500'
	);
</script>

<div class="relative">
	<div
		aria-hidden="true"
		class="absolute inset-0 z-10 rounded-lg border border-transparent px-4 py-3 text-lg pointer-events-none whitespace-pre"
	>
		{#if hasHighlights}
			{#each [...value] as char, i}<span class={isInWrongSpan(i) ? 'text-red-400' : 'text-stone-100'}>{char}</span>{/each}
		{:else}
			<span class="text-transparent">{value}</span>
		{/if}
	</div>
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode={inputMode === 'numeric' ? 'numeric' : 'text'}
		bind:value
		autofocus
		{placeholder}
		{readonly}
		class="relative w-full rounded-lg bg-stone-800 px-4 py-3 text-lg border
			placeholder:text-stone-600 focus:outline-none
			{borderClass}
			{hasHighlights ? 'text-transparent caret-stone-100' : ''}"
	/>
</div>
