<script lang="ts">
import { RouterInstance } from '../router/Router'
import { onMount } from 'svelte';
import { onDestroy } from 'svelte';

let params;

onMount(() => {
    params = RouterInstance.getParamsObj();
});

</script>

User page

abc{JSON.stringify(params)}

<style>
</style>