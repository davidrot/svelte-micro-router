<script lang="ts">
    import { RouterInstance} from './Router';

    export let to: any;
    let clazz: string;
    export { clazz as class };

    export function navigate(): void {
        RouterInstance.navigate(to);
    }
</script>

<template>
    <a href="/#{to}" class={clazz}  on:click|preventDefault={navigate} ><slot></slot></a>
</template>

<style>
</style>