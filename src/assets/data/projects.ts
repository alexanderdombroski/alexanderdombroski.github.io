import { z } from 'zod';
import rawProjects from './projects.json' with { type: 'json' };

export interface ProjectOverride {
  owner: string;
  repo: string;
}

export const RawProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  owner: z.object({
    login: z.string(),
  }),
  html_url: z.string().nullable(),
  description: z.string().nullable(),
  fork: z.boolean(),
  created_at: z.string(),
  pushed_at: z.string(),
  homepage: z.string().nullable(),
  size: z.number(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  archived: z.boolean(),
  open_issues_count: z.number(),
  is_template: z.boolean(),
  languageEntries: z
    .array(
      z.object({
        name: z.string(),
        bytes: z.number(),
      }),
    )
    .default([]),
});

export type FilteredProject = {
  id: number;
  name: string;
  fullname: string;
  private: boolean;
  owner: {
    login: string;
  };
  html_url: string | null;
  description: string | null;
  fork: boolean;
  created_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  archived: boolean;
  open_issues_count: number;
  is_template: boolean;
  languageEntries: { name: string; bytes: number }[];
};

const owner = 'alexanderdombroski';

/** Private Repos to show minimal metadata about */
export const overrides: ProjectOverride[] = [
  { owner, repo: 'cse381-course' },
  { owner, repo: 'apj-storefront-2' },
  { owner, repo: 'elixir' },
  { owner, repo: 'cse212' },
  { owner, repo: 'parallelism_concurrency' },
];

// Validate the raw projects array using the schema
const parsedProjects = z.array(RawProjectSchema).parse(rawProjects);

const projects: FilteredProject[] = parsedProjects.map((repo) => {
  const isOverridden = overrides.some(
    (o) =>
      o.owner.toLowerCase() === repo.owner.login.toLowerCase() &&
      o.repo.toLowerCase() === repo.name.toLowerCase(),
  );

  const shouldCensor = repo.private && !isOverridden;

  return {
    id: repo.id,
    name: shouldCensor ? 'Private Repository' : repo.name,
    fullname: repo.full_name,
    private: repo.private,
    owner: {
      login: repo.owner.login,
    },
    html_url: shouldCensor ? null : repo.html_url,
    description: shouldCensor ? null : repo.description,
    fork: repo.fork,
    created_at: repo.created_at,
    pushed_at: repo.pushed_at,
    homepage: repo.homepage,
    size: repo.size,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    watchers_count: repo.watchers_count,
    forks_count: repo.forks_count,
    archived: repo.archived,
    open_issues_count: repo.open_issues_count,
    is_template: repo.is_template,
    languageEntries: shouldCensor ? [] : repo.languageEntries,
  };
});

export default projects;
