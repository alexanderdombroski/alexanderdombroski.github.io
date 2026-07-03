import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Octokit } from 'octokit';
import { issues, prs, type Contribution } from '../src/assets/data/opensource';
import { loadEnvFile } from 'node:process';

type CacheManifest = Record<string, string>; // key → ISO timestamp

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  loadEnvFile(path.join(import.meta.dirname, '..', '.env'));
}

if (!GITHUB_TOKEN) {
  throw new Error('Failed to load GITHUB_TOKEN');
}

const DATA_DIR = path.join(process.cwd(), 'src', 'assets', 'data');
const CACHE_PATH = path.join(DATA_DIR, 'cache.json');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const OPENSOURCE_PATH = path.join(DATA_DIR, 'opensource.json');

const GITHUB_OWNER = 'alexanderdombroski';
const STALE_DAYS = 5;
const STALE_MS = STALE_DAYS * 24 * 60 * 60 * 1000;

function isStale(manifest: CacheManifest, key: string): boolean {
  const ts = manifest[key];
  if (!ts) return true;
  return Date.now() - new Date(ts).getTime() > STALE_MS;
}

// ── Fetchers ───────────────────────────────────────────────────────────────

async function fetchOpensourceData(octokit: Octokit) {
  console.info('[prebuild] Fetching open-source PR and issue data…');

  const fetchPr = async ({ owner, repo, id }: Contribution) => {
    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      { owner, repo, pull_number: id },
    );
    return data;
  };

  const fetchIssue = async ({ owner, repo, id }: Contribution) => {
    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/issues/{issue_number}',
      { owner, repo, issue_number: id },
    );
    return data;
  };

  const [prData, issueData] = await Promise.all([
    Promise.all(prs.map(fetchPr)),
    Promise.all(issues.map(fetchIssue)),
  ]);

  await writeFile(
    OPENSOURCE_PATH,
    JSON.stringify({ prData, issueData }, null, 2),
  );
  console.info('[prebuild] Wrote opensource.json');
}

async function fetchProjectsData(octokit: Octokit) {
  console.info('[prebuild] Fetching project repository data…');

  const repos = await octokit.paginate('GET /users/{username}/repos', {
    username: GITHUB_OWNER,
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
    type: 'owner',
  });

  const repoData = await Promise.all(
    repos.map(async (repo) => {
      const { data: languages } = await octokit.request(
        'GET /repos/{owner}/{repo}/languages',
        { owner: GITHUB_OWNER, repo: repo.name },
      );

      const languageEntries = Object.entries(languages)
        .map(([name, bytes]) => ({ name, bytes: bytes as number }))
        .sort((a, b) => b.bytes - a.bytes);

      const languageNames = languageEntries.length
        ? languageEntries.map(({ name }) => name)
        : repo.language
          ? [repo.language]
          : ['Other'];

      return { ...repo, languageEntries, languageNames };
    }),
  );

  await writeFile(PROJECTS_PATH, JSON.stringify(repoData, null, 2));
  console.info('[prebuild] Wrote projects.json');
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const raw = await readFile(CACHE_PATH, 'utf-8').catch(() => '{}');
  const cache = JSON.parse(raw) as CacheManifest;
  const now = new Date().toISOString();
  let updated = false;

  if (isStale(cache, 'opensource.json')) {
    await fetchOpensourceData(octokit);
    cache['opensource.json'] = now;
    updated = true;
  } else {
    console.info('[prebuild] opensource.json is fresh — skipping fetch.');
  }

  if (isStale(cache, 'projects.json')) {
    await fetchProjectsData(octokit);
    cache['projects.json'] = now;
    updated = true;
  } else {
    console.info('[prebuild] projects.json is fresh — skipping fetch.');
  }

  if (updated) {
    await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
    console.info('[prebuild] Updated cache.json');
  }

  console.info('[prebuild] Done.');
}

main().catch((err) => {
  console.error('[prebuild] Fatal error:', err);
  process.exit(1);
});
