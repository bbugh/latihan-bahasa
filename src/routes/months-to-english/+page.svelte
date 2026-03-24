<script lang="ts">
	import VocabularyPractice from '$lib/VocabularyPractice.svelte';
	import { MONTHS_TO_ENGLISH } from '$lib/months';
</script>

<VocabularyPractice vocabulary={MONTHS_TO_ENGLISH} instruction="Type the English month name" />
