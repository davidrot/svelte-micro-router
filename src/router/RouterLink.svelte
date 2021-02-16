<script lang="ts">
    import { RouterInstance} from './Router';

    export let to: any;

    export function navigate(): void {
        RouterInstance.navigate(to);
    }
</script>

<template>
    <a href="/#{to}" on:click|preventDefault={navigate} ><slot></slot></a>
</template>

<style>
</style>