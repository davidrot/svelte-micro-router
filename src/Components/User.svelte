<script lang="ts">
import { RouterInstance } from '../router/Router'
import { onMount } from 'svelte';

let params: any;

onMount(() => {
    params = RouterInstance.getCurrentParamsObj();
});

</script>

User page

abc{JSON.stringify(params)}

<style>
</style>