<script lang="ts">
  interface Props {
    repo: {
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
    };
  }

  let { repo }: Props = $props();

  const totalBytes = $derived(
    repo.languageEntries.reduce((sum, l) => sum + l.bytes, 0),
  );
  const visibleLanguages = $derived(
    repo.languageEntries.filter(
      (l) => totalBytes > 0 && (l.bytes / totalBytes) * 100 >= 2,
    ),
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));

  const isPublic = $derived(!repo.private && repo.html_url);
</script>

{#if isPublic}
  <a
    class="card-link"
    href={repo.html_url}
    target="_blank"
    rel="noreferrer noopener"
  >
    <article class="card">
      <div class="card-top">
        <div class="repo-name-row">
          <p class="repo-name">{repo.name}</p>
          {#if repo.private}
            <span class="badge private">Private</span>
          {/if}
        </div>
        <p class="repo-full-name">{repo.fullname}</p>
        <div class="badges">
          {#if repo.fork}
            <span class="badge muted">Fork</span>
          {/if}
          {#if repo.archived}
            <span class="badge muted">Archived</span>
          {/if}
        </div>
      </div>

      {#if repo.description}
        <p class="description">{repo.description}</p>
      {/if}

      {#if visibleLanguages.length > 0}
        <div
          class="language-list"
          aria-label={`Languages used in ${repo.name}`}
        >
          {#each visibleLanguages as language}
            <span class="language-pill">
              {language.name}
              {#if visibleLanguages.length > 1}
                <span class="language-percent">
                  {((language.bytes / totalBytes) * 100).toFixed(1)}%
                </span>
              {/if}
            </span>
          {/each}
        </div>
      {/if}

      <div class="meta">
        <span
          class="star-count"
          title={`${repo.stargazers_count} star${repo.stargazers_count === 1 ? '' : 's'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16px"
            height="16px"
            fill="currentColor"
          >
            <path
              d="M17.56 21a1 1 0 0 1-.46-.11L12 18.22l-5.1 2.67a1 1 0 0 1-1.45-1.06l1-5.63-4.12-4a1 1 0 0 1-.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1-.25 1l-4.12 4 1 5.63a1 1 0 0 1-.4 1 1 1 0 0 1-.62.18zM12 16.1a.92.92 0 0 1 .46.11l3.77 2-.72-4.21a1 1 0 0 1 .29-.89l3-2.93-4.2-.62a1 1 0 0 1-.71-.56L12 5.25 10.11 9a1 1 0 0 1-.75.54l-4.2.62 3 2.93a1 1 0 0 1 .29.89l-.72 4.16 3.77-2a.92.92 0 0 1 .5-.04z"
            />
          </svg>
          {repo.stargazers_count}
        </span>
        <span
          class="fork-count"
          title={`${repo.forks_count} fork${repo.forks_count === 1 ? '' : 's'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path
              d="M9 0C7.897 0 7 0.897 7 2C7 2.739 7.403 3.385 8 3.731V5C8 5.551 7.551 6 7 6H5C4.449 6 4 5.551 4 5V3.731C4.597 3.385 5 2.739 5 2C5 0.897 4.103 0 3 0C1.897 0 1 0.897 1 2C1 3.103 1.897 4 3 4V5C3 6.103 3.897 7 5 7H5.5V8.063C4.638 8.286 4 9.069 4 10C4 11.103 4.897 12 6 12C7.103 12 8 11.103 8 10C8 9.07 7.362 8.286 6.5 8.063V7H7C8.103 7 9 6.103 9 5V4C10.103 4 11 3.103 11 2C11 0.897 10.103 0 9 0ZM2 2C2 1.449 2.449 1 3 1C3.551 1 4 1.449 4 2C4 2.551 3.551 3 3 3C2.449 3 2 2.551 2 2ZM7 10C7 10.551 6.551 11 6 11C5.449 11 5 10.551 5 10C5 9.449 5.449 9 6 9C6.551 9 7 9.449 7 10ZM9 3C8.449 3 8 2.551 8 2C8 1.449 8.449 1 9 1C9.551 1 10 1.449 10 2C10 2.551 9.551 3 9 3Z"
            />
          </svg>
          {repo.forks_count}
        </span>
        {#if repo.contributorCount > 0}
          <span
            class="contributor-count"
            title={`${repo.contributorCount} contributor${repo.contributorCount === 1 ? '' : 's'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16px"
              height="16px"
              fill="currentColor"
            >
              <path
                d="M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0-6a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"
              /><path
                d="M17 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
              /><path
                d="M17 14a5 5 0 0 0-3.06 1.05A7 7 0 0 0 2 20a1 1 0 0 0 2 0 5 5 0 0 1 10 0 1 1 0 0 0 2 0 6.9 6.9 0 0 0-.86-3.35A3 3 0 0 1 20 19a1 1 0 0 0 2 0 5 5 0 0 0-5-5z"
              />
            </svg>
            {repo.contributorCount}
          </span>
        {/if}
        <span class="updated-date">Updated {formatDate(repo.pushed_at)}</span>
      </div>
    </article>
  </a>
{:else}
  <article class="card">
    <div class="card-top">
      <div class="repo-name-row">
        <p class="repo-name">{repo.name}</p>
        {#if repo.private}
          <span class="badge private">Private</span>
        {/if}
      </div>
      <p class="repo-full-name">{repo.fullname}</p>
      <div class="badges">
        {#if repo.fork}
          <span class="badge muted">Fork</span>
        {/if}
        {#if repo.archived}
          <span class="badge muted">Archived</span>
        {/if}
      </div>
    </div>

    {#if repo.description}
      <p class="description">{repo.description}</p>
    {/if}

    {#if visibleLanguages.length > 0}
      <div class="language-list" aria-label={`Languages used in ${repo.name}`}>
        {#each visibleLanguages as language}
          <span class="language-pill">
            {language.name}
            {#if visibleLanguages.length > 1}
              <span class="language-percent">
                {((language.bytes / totalBytes) * 100).toFixed(1)}%
              </span>
            {/if}
          </span>
        {/each}
      </div>
    {/if}

    <div class="meta">
      <span
        class="star-count"
        title={`${repo.stargazers_count} star${repo.stargazers_count === 1 ? '' : 's'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16px"
          height="16px"
          fill="currentColor"
        >
          <path
            d="M17.56 21a1 1 0 0 1-.46-.11L12 18.22l-5.1 2.67a1 1 0 0 1-1.45-1.06l1-5.63-4.12-4a1 1 0 0 1-.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1-.25 1l-4.12 4 1 5.63a1 1 0 0 1-.4 1 1 1 0 0 1-.62.18zM12 16.1a.92.92 0 0 1 .46.11l3.77 2-.72-4.21a1 1 0 0 1 .29-.89l3-2.93-4.2-.62a1 1 0 0 1-.71-.56L12 5.25 10.11 9a1 1 0 0 1-.75.54l-4.2.62 3 2.93a1 1 0 0 1 .29.89l-.72 4.16 3.77-2a.92.92 0 0 1 .5-.04z"
          />
        </svg>
        {repo.stargazers_count}
      </span>
      <span
        class="fork-count"
        title={`${repo.forks_count} fork${repo.forks_count === 1 ? '' : 's'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path
            d="M9 0C7.897 0 7 0.897 7 2C7 2.739 7.403 3.385 8 3.731V5C8 5.551 7.551 6 7 6H5C4.449 6 4 5.551 4 5V3.731C4.597 3.385 5 2.739 5 2C5 0.897 4.103 0 3 0C1.897 0 1 0.897 1 2C1 3.103 1.897 4 3 4V5C3 6.103 3.897 7 5 7H5.5V8.063C4.638 8.286 4 9.069 4 10C4 11.103 4.897 12 6 12C7.103 12 8 11.103 8 10C8 9.07 7.362 8.286 6.5 8.063V7H7C8.103 7 9 6.103 9 5V4C10.103 4 11 3.103 11 2C11 0.897 10.103 0 9 0ZM2 2C2 1.449 2.449 1 3 1C3.551 1 4 1.449 4 2C4 2.551 3.551 3 3 3C2.449 3 2 2.551 2 2ZM7 10C7 10.551 6.551 11 6 11C5.449 11 5 10.551 5 10C5 9.449 5.449 9 6 9C6.551 9 7 9.449 7 10ZM9 3C8.449 3 8 2.551 8 2C8 1.449 8.449 1 9 1C9.551 1 10 1.449 10 2C10 2.551 9.551 3 9 3Z"
          />
        </svg>
        {repo.forks_count}
      </span>
      {#if repo.contributorCount > 0}
        <span
          class="contributor-count"
          title={`${repo.contributorCount} contributor${repo.contributorCount === 1 ? '' : 's'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16px"
            height="16px"
            fill="currentColor"
          >
            <path
              d="M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0-6a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"
            /><path
              d="M17 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
            /><path
              d="M17 14a5 5 0 0 0-3.06 1.05A7 7 0 0 0 2 20a1 1 0 0 0 2 0 5 5 0 0 1 10 0 1 1 0 0 0 2 0 6.9 6.9 0 0 0-.86-3.35A3 3 0 0 1 20 19a1 1 0 0 0 2 0 5 5 0 0 0-5-5z"
            />
          </svg>
          {repo.contributorCount}
        </span>
      {/if}
      <span class="updated-date">Updated {formatDate(repo.pushed_at)}</span>
    </div>
  </article>
{/if}

<style>
  .card-link {
    text-decoration: none;
    color: inherit;
  }

  .card {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid rgb(var(--gray-light));
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 12px 30px rgba(var(--gray), 0.1);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
    container-type: inline-size;
    container-name: repo-card;
    width: 100%;
  }

  .card-link:hover .card,
  .card-link:focus-within .card {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(var(--gray), 0.08);
    border-color: rgba(var(--gray), 0.24);
  }

  .card-top {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .repo-name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .repo-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgb(var(--black));
    flex-shrink: 0;
  }

  .repo-full-name {
    margin: 0;
    color: rgb(var(--gray));
    font-size: 0.9rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .badge {
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 700;
    background: rgba(var(--gray-light), 0.5);
    color: rgb(var(--gray-dark));
  }

  .badge.muted {
    background: rgba(var(--gray-light), 0.85);
  }

  .badge.private {
    background: rgba(139, 92, 246, 0.15);
    color: rgb(109, 40, 217);
    flex-shrink: 0;
  }

  .description {
    margin: 0;
    color: rgb(var(--gray-dark));
    font-size: 0.96rem;
  }

  .language-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .language-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    background: rgba(var(--gray-light), 0.45);
    color: rgb(var(--gray-dark));
    font-size: 0.82rem;
    font-weight: 600;
    height: 2rem;
  }

  .language-percent {
    color: rgb(var(--gray));
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .meta {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.75rem;
    align-items: center;
    color: rgb(var(--gray));
    font-size: 0.82rem;
    min-width: 0;
  }

  .updated-date {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .contributor-count,
  .fork-count,
  .star-count {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  @container repo-card (max-width: 500px) {
    .card {
      padding: 1rem;
      gap: 0.85rem;
    }

    .repo-name {
      font-size: 1rem;
    }

    .repo-full-name {
      font-size: 0.85rem;
    }

    .description {
      font-size: 0.9rem;
    }

    .language-pill {
      font-size: 0.78rem;
      padding: 0.3rem 0.5rem;
    }

    .meta {
      font-size: 0.78rem;
      gap: 0.6rem;
    }
  }

  @container repo-card (max-width: 400px) {
    .card {
      padding: 0.85rem;
      gap: 0.75rem;
    }

    .repo-name {
      font-size: 0.95rem;
    }

    .description {
      font-size: 0.88rem;
    }
  }

  @container repo-card (max-width: 320px) {
    .card {
      padding: 0.75rem;
      gap: 0.65rem;
    }

    .repo-name {
      font-size: 0.9rem;
    }

    .meta {
      gap: 0.5rem;
    }
  }
</style>
