<script lang="ts">
  import Board from './Board.svelte';
  import { gameData } from './data.svelte';
</script>

<div class="game">
  <Board />

  {#if gameData.winner}
    <p class="status win">Player <span>{gameData.turn}</span> wins!!</p>
  {:else}
    <p class="status">Player <span>{gameData.turn}</span>'s turn!</p>
  {/if}

  <button onclick={gameData.reset()}>Reset</button>
</div>

<style>
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    font-family: sans-serif;

    .status {
      font-size: 1.25rem;

      &.win {
        color: green;
        font-weight: bold;
      }

      span {
        color: red;
        font-weight: bold;
      }
    }

    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border: none;
      border-radius: 0.5rem;
      background-color: #444;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover,
      &:focus {
        background-color: #666;
      }
    }
  }
</style>
