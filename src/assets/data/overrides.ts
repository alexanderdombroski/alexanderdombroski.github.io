export interface ProjectOverride {
  owner: string;
  repo: string;
}

const owner = 'alexanderdombroski';

/** Private Repos to show minimal metadata about */
export const overrides: ProjectOverride[] = [
  { owner, repo: 'cse381-course' },
  { owner, repo: 'apj-storefront-2' },
  { owner, repo: 'elixir' },
  { owner, repo: 'cse212' },
  { owner, repo: 'parallelism_concurrency' },
];
