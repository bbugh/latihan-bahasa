<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Latihan Bahasa — Indonesian Language Practice</title>
	<meta name="description" content="Practice Indonesian numbers, words, and vocabulary with interactive exercises." />

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Latihan Bahasa — Indonesian Language Practice" />
	<meta property="og:description" content="Practice Indonesian numbers, words, and vocabulary with interactive exercises." />
	<meta property="og:url" content="https://brianbugh.me/latihan-bahasa/" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Latihan Bahasa — Indonesian Language Practice" />
	<meta name="twitter:description" content="Practice Indonesian numbers, words, and vocabulary with interactive exercises." />

	<meta name="theme-color" content="#1c1917" />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
