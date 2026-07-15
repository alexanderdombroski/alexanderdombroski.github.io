<script lang="ts">
  import RepoCard from './RepoCard.svelte';
  import ProjectsSidebar from './ProjectsSidebar.svelte';
  import { overrides } from '../../../assets/data/overrides';
  import Masonry from '../../base/Masonry.svelte';

  interface Project {
    id: number;
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
    langFilterList: string[];
    featured: boolean;
  }

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();

  let showForks = $state(false);
  let showPrivate = $state(false);
  let activeLanguage = $state('all');
  let sortBy = $state('updated');

  const normalize = (value: string) => value.toLowerCase();

  // De-duplicate projects by id to prevent each_key_duplicate error
  const uniqueProjects = $derived(
    Array.from(new Map(projects.map((repo) => [repo.id, repo])).values()),
  );

  const featuredProjects = $derived(
    uniqueProjects.filter((repo) => repo.featured),
  );

  const isOverriddenPrivateRepo = (repo: Project) => {
    return (
      repo.private &&
      overrides.some(
        (override) => override.repo.toLowerCase() === repo.name.toLowerCase(),
      )
    );
  };

  // Filter projects by forks and private visibility
  const filteredProjects = $derived(
    uniqueProjects.filter((repo) => {
      const matchesFork = showForks || !repo.fork;
      const matchesPrivate =
        !repo.private || isOverriddenPrivateRepo(repo) || showPrivate;
      return matchesFork && matchesPrivate;
    }),
  );

  // Available languages updates based on filtered projects
  const availableLanguages = $derived(
    [...new Set(filteredProjects.flatMap((repo) => repo.langFilterList))].sort(
      (a, b) => a.localeCompare(b),
    ),
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

  // Sort projects
  const sortedProjects = $derived(
    [...filteredProjects].sort((a, b) => {
      if (sortBy === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      }
      if (sortBy === 'forks') {
        return b.forks_count - a.forks_count;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // default: updated (pushed_at)
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    }),
  );

  // Filter by language
  const visibleProjects = $derived(
    sortedProjects.filter((repo) => {
      if (activeLanguage === 'all') return true;
      return repo.langFilterList.some(
        (lang) => normalize(lang) === normalize(activeLanguage),
      );
    }),
  );
</script>

{#if featuredProjects.length > 0}
  <section aria-labelledby="featured-heading" class="featured-section">
    <div class="section-heading">
      <h2 id="featured-heading">Featured Projects</h2>
    </div>
    <div class="featured-grid">
      {#each featuredProjects as repo (repo.id)}
        <RepoCard {repo} />
      {/each}
    </div>
  </section>
{/if}

<p class="stats" aria-live="polite">
  {#if activeLanguage === 'all'}
    Showing {visibleProjects.length} repositories
  {:else}
    Showing {visibleProjects.length} repositories filtered by {activeLanguage}
  {/if}
</p>

<div class="projects-layout">
  <ProjectsSidebar
    bind:showForks
    bind:showPrivate
    bind:activeLanguage
    bind:sortBy
    {availableLanguages}
  />

  <section aria-labelledby="projects" class="projects-section">
    <div class="section-heading">
      <h2 id="projects">Repositories</h2>
      <p>Cards stay readable even without JavaScript enabled.</p>
    </div>

    <Masonry
      gridGap="1.2rem"
      colWidth="minmax(280px, 1fr)"
      items={visibleProjects}
    >
      {#each visibleProjects as repo (repo.id)}
        <RepoCard {repo} />
      {/each}
    </Masonry>
  </section>
</div>

<style>
  .featured-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgb(var(--gray-light));
    background: linear-gradient(
      135deg,
      rgba(var(--accent), 0.04) 0%,
      transparent 60%
    );
    margin-bottom: 2rem;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
    align-items: stretch;
  }

  /* Make RepoCard root elements (a.card-link or article.card) fill the grid cell */
  .featured-grid > :global(*),
  .featured-grid > :global(*) > :global(.card) {
    height: 100%;
  }

  .stats {
    font-weight: 600;
    color: rgb(var(--gray-dark));
    margin-bottom: 0;
  }

  .projects-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 2rem;
    align-items: start;
    margin-top: 2rem;
  }

  .projects-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-heading {
    display: grid;
    gap: 0.35rem;
  }

  .section-heading h2 {
    font-size: 1.45rem;
    margin: 0;
  }

  .section-heading p {
    margin: 0;
    color: rgb(var(--gray));
  }

  @media (max-width: 768px) {
    .projects-layout {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
