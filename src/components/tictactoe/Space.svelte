<script lang="ts">
    import { gameData, type CoordinatePart } from "./data.svelte";

    type Props = {
        row: CoordinatePart
        column: CoordinatePart
    }

    const { row, column }: Props = $props();

    function handleSelect() {
        if (gameData.winner) return;
        gameData.board[row][column] = gameData.turn;
        gameData.nextTurn();
    }

    const value = $derived(gameData.board[row][column]);
    const isWinner = $derived(
    gameData.winningCells?.some(
        ([r, c]) => r === row && c === column
    )
    );
</script>

<button class:winner={isWinner} onclick={handleSelect}>
    {value ?? ''}
</button>

<style>
    button {
        width: 6rem;
        height: 6rem;

        &.winner {
            background-color: greenyellow;
        }
    }
</style>