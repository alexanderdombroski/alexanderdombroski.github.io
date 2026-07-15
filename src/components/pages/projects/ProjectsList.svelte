<script lang="ts">
  import RepoCard from './RepoCard.svelte';

  interface Project {
    name: string;
    fullname: string;
    fork: boolean;
    archived: boolean;
    private: boolean;
    description: string | null;
    languageEntries: { name: string; bytes: number }[];
    stargazers_count: number;
    forks_count: number;
    contributorCount: number;
    pushed_at: string;
    html_url: string | null;
    languageNames: string[];
  }

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();

  let showForks = $state(false);
  let activeLanguage = $state('all');

  const normalize = (value: string) => value.toLowerCase();

  const forkFilteredProjects = $derived(
    projects.filter((repo) => showForks || !repo.fork),
  );

  const availableLanguages = $derived(
    [
      ...new Set(forkFilteredProjects.flatMap((repo) => repo.languageNames)),
    ].sort((a, b) => a.localeCompare(b)),
  );

  $effect(() => {
    const activeKey = normalize(activeLanguage);
    if (
      activeLanguage !== 'all' &&
      !availableLanguages.some((l) => normalize(l) === activeKey)
    ) {
      activeLanguage = 'all';
    }
  });

  const visibleProjects = $derived(
    forkFilteredProjects.filter((repo) => {
      if (activeLanguage === 'all') return true;
      return repo.languageNames.some(
        (lang) => normalize(lang) === normalize(activeLanguage),
      );
    }),
  );
</script>

<p class="stats" aria-live="polite">
  {#if activeLanguage === 'all'}
    Showing {visibleProjects.length} repositories
  {:else}
    Showing {visibleProjects.length} repositories filtered by {activeLanguage}
  {/if}
</p>

<section aria-labelledby="language-filters" class="filters">
  <div class="controls">
    <button
      class="fork-toggle"
      type="button"
      onclick={() => (showForks = !showForks)}
      aria-pressed={showForks}
    >
      {showForks ? 'Hide forks' : 'Show forks'}
    </button>
  </div>

  <div class="section-heading">
    <h2 id="language-filters">Filter by language</h2>
    <p>
      By default, forks are hidden. Turning them on also adds fork-only
      languages to the filter list.
    </p>
  </div>

  <div class="filter-row">
    <button
      class="filter-button"
      class:active={activeLanguage === 'all'}
      type="button"
      onclick={() => (activeLanguage = 'all')}
      aria-pressed={activeLanguage === 'all'}
    >
      All
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
</section>

<section aria-labelledby="projects" class="projects">
  <div class="section-heading">
    <h2 id="projects">Repositories</h2>
    <p>Cards stay readable even without JavaScript enabled.</p>
  </div>

  <div class="grid">
    {#each visibleProjects as repo, i (i)}
      <RepoCard {repo} />
    {/each}
  </div>
</section>

<style>
  .stats {
    font-weight: 600;
    color: rgb(var(--gray-dark));
    margin-bottom: 0;
  }

  .filters,
  .projects {
    margin-top: 2.25rem;
  }

  .section-heading {
    display: grid;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }

  .section-heading h2 {
    font-size: 1.45rem;
  }

  .section-heading p {
    margin: 0;
    color: rgb(var(--gray));
  }

  .controls {
    margin-bottom: 1rem;
  }

  .fork-toggle,
  .filter-button {
    appearance: none;
    border: 1px solid rgb(var(--gray-light));
    background: rgba(255, 255, 255, 0.85);
    color: rgb(var(--gray-dark));
    border-radius: 999px;
    padding: 0.55rem 0.95rem;
    font: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      border-color 0.15s ease,
      background-color 0.15s ease;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .fork-toggle:hover,
  .fork-toggle:focus-visible,
  .filter-button:hover,
  .filter-button:focus-visible {
    transform: translateY(-1px);
    box-shadow: var(--box-shadow);
    border-color: rgba(var(--gray), 0.35);
    outline: none;
  }

  .fork-toggle[aria-pressed='true'],
  .filter-button.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
  }
</style>
