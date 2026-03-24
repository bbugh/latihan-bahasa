<script lang="ts">
	import VocabularyPractice from '$lib/VocabularyPractice.svelte';
	import { MONTHS_TO_INDONESIAN } from '$lib/months';
</script>

<VocabularyPractice vocabulary={MONTHS_TO_INDONESIAN} instruction="Type the Indonesian month name" />
