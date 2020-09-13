<script lang="ts">
    import { Route, RouterInstance} from './Router';
    import { onMount, onDestroy } from 'svelte';

    onMount(() => {
        RouterInstance.registerSlot(eval("$$self"));
        RouterInstance.refreshCurrentRoute();
    });
    onDestroy(() => {
        RouterInstance.unregisterSlot(eval("$$self"));
	});

    let slotContent: Route;
    export function updateSlot(route: Route): void {
        slotContent = route;
    }
</script>

<div>
    {#if slotContent != null}
    <svelte:component this={slotContent.component}/>
    {/if}
</div>

<style>
</style>