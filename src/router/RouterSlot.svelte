<script lang="ts">
    import { RouterInstance, Route } from './Router';
    import { onMount, onDestroy } from 'svelte';

    const key = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    onMount(() => {
        RouterInstance.registerSlot(key, route => updateSlot(route));
    });
    onDestroy(() => {
        RouterInstance.unregisterSlot(key, route => updateSlot(route));
	});

    let currentComponent: any;
    export function updateSlot(route: Route): void {
        if (route?.component) {
            // Workaround when two following routes are using the same component.
            currentComponent = function w() {
                return new route.component(...arguments);
            }
        }
    }
</script>

<template>
    {#if currentComponent != null}
    <svelte:component this={currentComponent}/>
    {/if}
</template>


<style>
</style>