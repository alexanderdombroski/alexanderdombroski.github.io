<script lang="ts">
  import Space from './Space.svelte';
</script>

<div class="board">
  <Space row={0} column={0} />
  <Space row={0} column={1} />
  <Space row={0} column={2} />
  <Space row={1} column={0} />
  <Space row={1} column={1} />
  <Space row={1} column={2} />
  <Space row={2} column={0} />
  <Space row={2} column={1} />
  <Space row={2} column={2} />
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(3, 6rem);
    gap: 0.25rem;

    padding: 0.5rem;
    background-color: #333;
    border-radius: 0.5rem;
    width: fit-content;
  }
</style>
