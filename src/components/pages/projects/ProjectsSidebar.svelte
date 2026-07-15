<script lang="ts">
  interface Props {
    showForks: boolean;
    showPrivate: boolean;
    activeLanguage: string;
    sortBy: string;
    availableLanguages: string[];
  }

  let {
    showForks = $bindable(false),
    showPrivate = $bindable(false),
    activeLanguage = $bindable('all'),
    sortBy = $bindable('updated'),
    availableLanguages,
  }: Props = $props();

  const normalize = (value: string) => value.toLowerCase();

  let isExpanded = $state(false);

  const hasActiveFilters = $derived(
    showForks !== false ||
      showPrivate !== false ||
      activeLanguage !== 'all' ||
      sortBy !== 'updated',
  );
</script>

<aside class="sidebar">
  <button
    class="mobile-toggle"
    type="button"
    onclick={() => (isExpanded = !isExpanded)}
    aria-expanded={isExpanded}
  >
    <span>Filters & Sorting</span>
    <svg
      class="chevron"
      class:open={isExpanded}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16px"
      height="16px"
      fill="currentColor"
    >
      <polyline
        points="6 9 12 15 18 9"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  </button>

  <div class="sidebar-content" class:expanded={isExpanded}>
    <div class="sidebar-section">
      <h3 class="section-title">Show Forks</h3>
      <button
        class="fork-toggle"
        type="button"
        onclick={() => (showForks = !showForks)}
        aria-pressed={showForks}
      >
        {showForks ? 'Hide forks' : 'Show forks'}
      </button>
    </div>

    <div class="sidebar-section">
      <h3 class="section-title">Show Private</h3>
      <button
        class="fork-toggle"
        type="button"
        onclick={() => (showPrivate = !showPrivate)}
        aria-pressed={showPrivate}
      >
        {showPrivate ? 'Hide private' : 'Show private'}
      </button>
    </div>

    <div class="sidebar-section">
      <h3 class="section-title">Sort By</h3>
      <div class="sort-options">
        <select
          bind:value={sortBy}
          class="sort-select"
          aria-label="Sort repositories by"
        >
          <option value="updated">Recently updated</option>
          <option value="stars">Stars</option>
          <option value="forks">Forks</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>

    <div class="sidebar-section">
      <h3 class="section-title">Filter by Language</h3>
      <div class="filter-list">
        <button
          class="filter-button"
          class:active={activeLanguage === 'all'}
          type="button"
          onclick={() => (activeLanguage = 'all')}
          aria-pressed={activeLanguage === 'all'}
        >
          All Languages
        </button>
        {#each availableLanguages as language}
          <button
            class="filter-button"
            class:active={normalize(language) === normalize(activeLanguage)}
            type="button"
            onclick={() => (activeLanguage = language)}
            aria-pressed={normalize(language) === normalize(activeLanguage)}
          >
            {language}
          </button>
        {/each}
      </div>
    </div>

    {#if hasActiveFilters}
      <button
        class="reset-button"
        type="button"
        onclick={() => {
          showForks = false;
          showPrivate = false;
          activeLanguage = 'all';
          sortBy = 'updated';
        }}
      >
        Reset Filters
      </button>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgb(var(--gray-light));
    border-radius: 18px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(var(--gray), 0.05);
    position: sticky;
    top: 2rem;
  }

  .mobile-toggle {
    display: none;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: none;
    background: transparent;
    color: rgb(var(--gray-dark));
    font: inherit;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    outline: none;
  }

  .chevron {
    transition: transform 0.2s ease;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    margin-top: 0;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--gray-dark));
    margin: 0;
  }

  .fork-toggle {
    appearance: none;
    width: 100%;
    border: 1px solid rgb(var(--gray-light));
    background: white;
    color: rgb(var(--gray-dark));
    border-radius: 12px;
    padding: 0.65rem 1rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
  }

  .fork-toggle:hover,
  .fork-toggle:focus-visible {
    border-color: rgba(var(--gray), 0.35);
    background: rgba(var(--gray-light), 0.2);
    outline: none;
  }

  .fork-toggle[aria-pressed='true'] {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .sort-select {
    appearance: none;
    width: 100%;
    border: 1px solid rgb(var(--gray-light));
    background: white;
    color: rgb(var(--gray-dark));
    border-radius: 12px;
    padding: 0.65rem 2rem 0.65rem 1rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(100,116,139)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
  }

  .sort-select:hover,
  .sort-select:focus-visible {
    border-color: rgba(var(--gray), 0.35);
    outline: none;
  }

  .filter-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 0.25rem;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--gray-light)) transparent;
  }

  .filter-list::-webkit-scrollbar {
    width: 4px;
  }

  .filter-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .filter-list::-webkit-scrollbar-thumb {
    background-color: rgb(var(--gray-light));
    border-radius: 99px;
  }

  .filter-button {
    appearance: none;
    border: 1px solid transparent;
    background: transparent;
    color: rgb(var(--gray-dark));
    border-radius: 10px;
    padding: 0.55rem 0.85rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .filter-button:hover,
  .filter-button:focus-visible {
    background: rgba(var(--gray-light), 0.3);
    outline: none;
  }

  .filter-button.active {
    background: var(--accent);
    color: white;
  }

  .reset-button {
    appearance: none;
    width: 100%;
    border: 1px dashed rgb(var(--gray));
    background: transparent;
    color: rgb(var(--gray-dark));
    border-radius: 12px;
    padding: 0.65rem 1rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
    margin-top: 0.5rem;
  }

  .reset-button:hover,
  .reset-button:focus-visible {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(var(--gray-light), 0.2);
    outline: none;
  }

  @media (max-width: 768px) {
    .mobile-toggle {
      display: flex;
    }

    .sidebar-content {
      display: none;
      flex-direction: column;
      gap: 1.75rem;
      margin-top: 1rem;
    }

    .sidebar-content.expanded {
      display: flex;
    }
  }
</style>
