<script lang="ts">
	import RouterSlot from './router/RouterSlot.svelte';
	import RouterLink from './router/RouterLink.svelte';
</script>

<main>
	<div class="navigation">
		<RouterLink to="/">Home</RouterLink>
		<RouterLink to="/about">About</RouterLink>
		<RouterLink to="/user/1">User 1</RouterLink>
		<RouterLink to="/user/2/test">User 2</RouterLink>
	</div>

	<RouterSlot></RouterSlot>
</main>

<style>
</style>