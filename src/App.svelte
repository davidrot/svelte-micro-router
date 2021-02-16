<script lang="ts">
	import RouterSlot from './router/RouterSlot.svelte';
	import RouterLink from './router/RouterLink.svelte';
	import { RouterInstance } from './Router';

	function navigate(url) {
		RouterInstance.navigate(url);
	}
</script>

<template>
	<main>
		<div class="navigation">
			<span class="link"><RouterLink to="/">Home</RouterLink></span>
			<span class="link"><RouterLink to="/about/">About</RouterLink></span>
			<span class="link"><RouterLink to="/about-async/">About(async)</RouterLink></span>
			<span class="link"><RouterLink to="/user/1/">User 1</RouterLink></span>
			<span class="link"><RouterLink to="/user/2/test/">User 2</RouterLink></span>
			<span class="link"><button on:click={() => navigate('/about/')}>About (manual)</button></span>
			<span class="link"><button on:click={() => navigate('/notexisting/')}>No existing</button></span>
		</div>

		<RouterSlot></RouterSlot>
	</main>
</template>

<style>
</style>