<script lang="ts">
  interface Props {
    items: string[];
  }

  let { items = $bindable() }: Props = $props();

  let inputValue = $state('');
  let error = $state('');
  let pasteStatus = $state('');
  let pasteStatusTimer: ReturnType<typeof setTimeout> | null = null;

  function addItem() {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      error = 'Please enter an item name.';
      return;
    }

    if (items.includes(trimmed)) {
      error = 'That item is already on the wheel.';
      return;
    }

    items = [...items, trimmed];
    inputValue = '';
    error = '';
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') addItem();
  }

  function handlePaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') ?? '';

    // Split on newlines or commas, trim, drop blanks
    const tokens = text
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Only act if the paste looks like multiple items
    if (tokens.length <= 1) return;

    e.preventDefault();

    const newItems = tokens.filter((t) => !items.includes(t));
    const skipped = tokens.length - newItems.length;

    items = [...items, ...newItems];
    inputValue = '';
    error = '';

    // Show a brief status message
    if (pasteStatusTimer) clearTimeout(pasteStatusTimer);
    const parts: string[] = [];
    if (newItems.length > 0)
      parts.push(
        `Added ${newItems.length} item${newItems.length === 1 ? '' : 's'}`,
      );
    if (skipped > 0)
      parts.push(`${skipped} duplicate${skipped === 1 ? '' : 's'} skipped`);
    pasteStatus = parts.join(' · ');
    pasteStatusTimer = setTimeout(() => (pasteStatus = ''), 3000);
  }

  function clearAll() {
    items = [];
    error = '';
    pasteStatus = '';
  }
</script>

<aside class="item-form" aria-label="Wheel items manager">
  <header class="form-header">
    <h2 class="form-title">Items</h2>
    <span class="item-count" aria-label="{items.length} items"
      >{items.length}</span
    >
  </header>

  <div class="add-section">
    <label for="item-input" class="sr-only">New item name</label>
    <div class="input-row">
      <input
        id="item-input"
        type="text"
        placeholder="Add an item, or paste a list…"
        bind:value={inputValue}
        onkeydown={handleKeydown}
        onpaste={handlePaste}
        aria-invalid={!!error}
        aria-describedby={error
          ? 'item-error'
          : pasteStatus
            ? 'paste-status'
            : undefined}
        maxlength="30"
      />
      <button class="btn primary" onclick={addItem} aria-label="Add item"
        >Add</button
      >
    </div>

    {#if error}
      <p id="item-error" class="error-msg" role="alert">{error}</p>
    {:else if pasteStatus}
      <p id="paste-status" class="paste-status" aria-live="polite">
        {pasteStatus}
      </p>
    {/if}
  </div>

  <ul class="items-list" aria-label="Wheel items">
    {#if items.length === 0}
      <li class="no-items">No items yet — add some above!</li>
    {:else}
      {#each items as item, i}
        <li class="item-row">
          <span
            class="item-dot"
            style={`background: hsl(${(i * 36) % 360}, 60%, 55%)`}
          ></span>
          <span class="item-label">{item}</span>
          <button
            class="btn tight"
            onclick={() => removeItem(i)}
            aria-label="Remove {item}"
          >
            Remove
          </button>
        </li>
      {/each}
    {/if}
  </ul>

  {#if items.length > 0}
    <button class="btn clear-all" onclick={clearAll}>Clear all</button>
  {/if}
</aside>

<style>
  .item-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 0.75rem;
    padding: 1.25rem;
    min-width: 240px;
    max-width: 300px;
    width: 100%;
  }

  /* ── Header ── */
  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .form-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #111;
  }

  .item-count {
    background: #111;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 9999px;
    padding: 0.1rem 0.55rem;
    min-width: 1.4rem;
    text-align: center;
  }

  /* ── Input ── */
  .add-section {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.55rem 0.75rem;
    font-size: 0.9rem;
    background: #f5f5f5;
    border: 1px solid #d1d1d1;
    border-radius: 0.4rem;
    color: #111;
    outline: none;
    font-family: inherit;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  input::placeholder {
    color: #aaa;
  }

  input:focus {
    border-color: #555;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
  }

  input[aria-invalid='true'] {
    border-color: #c0392b;
    box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.12);
  }

  .error-msg {
    margin: 0;
    font-size: 0.78rem;
    color: #c0392b;
  }

  .paste-status {
    margin: 0;
    font-size: 0.78rem;
    color: #2d7a2d;
  }

  /* ── List ── */
  .items-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    max-height: 340px;
    overflow-y: auto;
  }

  .no-items {
    text-align: center;
    color: #aaa;
    font-size: 0.85rem;
    padding: 1.5rem 0;
    font-style: italic;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f9f9f9;
    border: 1px solid #ebebeb;
    border-radius: 0.4rem;
    padding: 0.45rem 0.6rem;

    .btn {
      --btn-color: red;
      font-size: 1rem;
    }
  }

  .item-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .item-label {
    flex: 1;
    font-size: 0.88rem;
    color: #222;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Clear all ── */
  .clear-all {
    align-self: center;
    --btn-color: red;
  }

  /* ── A11y ── */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
