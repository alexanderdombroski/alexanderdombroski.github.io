import { z } from 'zod';
import rawProjects from './projects.json';
import { overrides } from './overrides';
export type { ProjectOverride } from './overrides';

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
  lastCommitDate: z.string().nullable().default(null),
  firstCommitDate: z.string().nullable().default(null),
  totalCommits: z.number().nullable().default(null),
  totalPRs: z.number().nullable().default(null),
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
  langFilterList: string[];
  lastCommitDate: string | null;
  firstCommitDate: string | null;
  totalCommits: number | null;
  totalPRs: number | null;
};

// Validate the raw projects array using the schema
const parsedProjects = z.array(RawProjectSchema).parse(rawProjects);

const projects: FilteredProject[] = parsedProjects.map((repo) => {
  const isOverridden = overrides.some(
    (o) =>
      o.owner.toLowerCase() === repo.owner.login.toLowerCase() &&
      o.repo.toLowerCase() === repo.name.toLowerCase(),
  );

  const shouldCensor = repo.private && !isOverridden;

  const totalBytes = repo.languageEntries.reduce((sum, l) => sum + l.bytes, 0);
  const langFilterList = repo.languageEntries.length
    ? repo.languageEntries
        .filter((l) => totalBytes > 0 && (l.bytes / totalBytes) * 100 >= 2.0)
        .map(({ name }) => name)
        .filter(Boolean)
    : ([repo.language].filter(Boolean) as string[]);

  return {
    id: repo.id,
    name: shouldCensor ? 'Private Repository' : repo.name,
    fullname: shouldCensor
      ? `${repo.owner.login}/private-repo`
      : repo.full_name,
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
    languageEntries: repo.languageEntries,
    langFilterList,
    lastCommitDate: repo.lastCommitDate,
    firstCommitDate: repo.firstCommitDate,
    totalCommits: repo.totalCommits,
    totalPRs: shouldCensor ? null : repo.totalPRs,
  };
});

export default projects;
