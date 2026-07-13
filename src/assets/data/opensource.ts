export type Contribution = {
  owner: string;
  repo: string;
  id: number;
};

export type PrData = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  merged_at: string | null;
  base: {
    repo: {
      full_name: string;
    };
  };
};

export type IssueData = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  repository_url: string;
};

const ASTRO = { owner: 'withastro', repo: 'astro' };
const VS_CODE = { owner: 'microsoft', repo: 'vscode' };

export const issues: Contribution[] = [
  { ...ASTRO, id: 16790 },
  { ...VS_CODE, id: 318402 },
  { ...VS_CODE, id: 307819 },
];

export const prs: Contribution[] = [
  { ...ASTRO, id: 17076 },
  { ...VS_CODE, id: 318104 },
  { ...ASTRO, id: 16762 },
  { ...ASTRO, id: 16128 },
  { ...ASTRO, id: 15943 },
  { ...VS_CODE, id: 302322 },
  {
    owner: 'material-extensions',
    repo: 'vscode-material-icon-theme',
    id: 3269,
  },
];
