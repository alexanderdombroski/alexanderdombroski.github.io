<script lang="ts">
  import Board from "./Board.svelte";
    import { gameData } from "./data.svelte";

</script>

<Board />

{#if gameData.winner}
  <p>Player <span>{gameData.turn}</span> wins!!</p>
{:else}
<p>Player <span>{gameData.turn}</span>'s turn!</p>
{/if}

<button onclick={gameData.reset()}>Reset</button>

<style>
    span {
        color: red;
    }
</style>