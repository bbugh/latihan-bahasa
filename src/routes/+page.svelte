<script lang="ts">
	import { base } from '$app/paths';
</script>

<div class="min-h-screen bg-stone-900 text-stone-100 flex justify-center p-8">
	<div class="w-full max-w-lg space-y-8">
		<div class="text-center space-y-2">
			<h1 class="text-2xl font-bold">Latihan Bahasa</h1>
			<p class="text-stone-400 text-sm">Choose a practice</p>
		</div>

		<div class="space-y-6">
			<div class="space-y-3">
				<h2 class="text-sm font-medium tracking-widest uppercase text-stone-500">Numbers</h2>
				<a
					href="{base}/numbers-to-words"
					class="block rounded-lg bg-stone-800 border border-stone-700 px-5 py-4
						hover:bg-stone-700 transition-colors"
				>
					<p class="font-medium">Numbers → Words</p>
					<p class="text-stone-400 text-sm">See a number, type the Indonesian</p>
				</a>
				<a
					href="{base}/words-to-numbers"
					class="block rounded-lg bg-stone-800 border border-stone-700 px-5 py-4
						hover:bg-stone-700 transition-colors"
				>
					<p class="font-medium">Words → Numbers</p>
					<p class="text-stone-400 text-sm">See Indonesian words, type the number</p>
				</a>
			</div>

			<div class="space-y-3">
				<h2 class="text-sm font-medium tracking-widest uppercase text-stone-500">Months</h2>
				<a
					href="{base}/months-to-indonesian"
					class="block rounded-lg bg-stone-800 border border-stone-700 px-5 py-4
						hover:bg-stone-700 transition-colors"
				>
					<p class="font-medium">Months → Indonesian</p>
					<p class="text-stone-400 text-sm">See an English month, type the Indonesian</p>
				</a>
				<a
					href="{base}/months-to-english"
					class="block rounded-lg bg-stone-800 border border-stone-700 px-5 py-4
						hover:bg-stone-700 transition-colors"
				>
					<p class="font-medium">Months → English</p>
					<p class="text-stone-400 text-sm">See an Indonesian month, type the English</p>
				</a>
			</div>
		</div>
	</div>
</div>
