<script lang="ts">
  import ItemForm from './ItemForm.svelte';
  import SpinnerWheel from './SpinnerWheel.svelte';
</script>

<div class="wheel-page">
  <header class="page-header">
    <h1 class="page-title">Spin the Wheel</h1>
    <p class="page-subtitle">Add your options, spin, and let fate decide.</p>
  </header>

  <div class="wheel-layout">
    <ItemForm />
    <SpinnerWheel />
  </div>
</div>

<style>
  .wheel-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 1rem 1rem 3rem;
    font-family: system-ui, sans-serif;
  }

  .page-header {
    text-align: center;
  }

  .page-title {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.25rem);
    font-weight: 800;
    color: #111;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .page-subtitle {
    margin: 0.4rem 0 0;
    color: #666;
    font-size: 0.95rem;
  }

  .wheel-layout {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: 2rem;
    width: 100%;
    max-width: 960px;
  }
</style>
