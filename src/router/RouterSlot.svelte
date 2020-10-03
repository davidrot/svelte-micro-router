<script lang="ts">
    import { RouterInstance, Route } from './Router';
    import { onMount, onDestroy } from 'svelte';

    onMount(() => {
        RouterInstance.registerSlot(eval("$$self"));
    });
    onDestroy(() => {
        RouterInstance.unregisterSlot(eval("$$self"));
	});

    // Workaround when two following routes are using the same component.
    let slotContent1: Route;
    let slotContent2: Route;
    export function updateSlot(route: Route): void {
        if (slotContent1 == null) {
            slotContent1 = route;
            slotContent2 = null;
        } else {
            slotContent2 = route;
            slotContent1 = null;
        }
    }
</script>

<div>
    {#if slotContent1 != null}
    <svelte:component this={slotContent1.component}/>
    {/if}

    {#if slotContent2 != null}
    <svelte:component this={slotContent2.component}/>
    {/if}
</div>

<style>
</style>