<script lang="ts">
    import { Route, RouterInstance} from './Router';

    export let to;

    export function navigate(): void {
        RouterInstance.navigate(to);
    }
</script>

<a href="/#{to}" on:click|preventDefault={navigate} ><slot></slot></a>

<style>
</style>