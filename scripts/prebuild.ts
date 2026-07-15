import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Octokit } from 'octokit';
import { issues, prs, type Contribution } from '../src/assets/data/opensource';
import { overrides } from '../src/assets/data/projects';
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

const CONTRIBUTORS_PATH = path.join(DATA_DIR, 'contributors.json');
const CONTRIBUTORS_CACHE_PATH = path.join(DATA_DIR, 'contributors-cache.json');

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

  const repos = await octokit.paginate('GET /user/repos', {
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
    affiliation: 'owner',
    visibility: 'all',
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
  return repoData;
}

async function fetchContributorsData(octokit: Octokit, repos: any[]) {
  console.info('[prebuild] Fetching contributors data…');

  let contributorsData: Record<string, any> = {};
  try {
    contributorsData = JSON.parse(await readFile(CONTRIBUTORS_PATH, 'utf-8'));
  } catch {
    contributorsData = {};
  }

  let contributorsNoContributorsCache: string[] = [];
  try {
    contributorsNoContributorsCache = JSON.parse(
      await readFile(CONTRIBUTORS_CACHE_PATH, 'utf-8'),
    );
  } catch {
    contributorsNoContributorsCache = [];
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (const repo of repos) {
    if (repo.fork) {
      console.info(
        `[prebuild] Skipping contributors fetch for ${repo.name} (is a fork)`,
      );
      delete contributorsData[repo.name];
      contributorsNoContributorsCache = contributorsNoContributorsCache.filter(
        (name) => name !== repo.name,
      );
      continue;
    }

    const pushedTime = new Date(repo.pushed_at);
    const isNotPushedIn6Months = pushedTime < sixMonthsAgo;
    const hadNoContributorsInPast = contributorsNoContributorsCache.includes(
      repo.name,
    );

    if (isNotPushedIn6Months && hadNoContributorsInPast) {
      console.info(
        `[prebuild] Skipping contributors fetch for ${repo.name} (not pushed in 6 months and no past contributors)`,
      );
      continue;
    }

    console.info(`[prebuild] Fetching contributors for ${repo.name}…`);
    try {
      const { data: contributors } = await octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        { owner: GITHUB_OWNER, repo: repo.name },
      );

      const contributorCount = Array.isArray(contributors)
        ? contributors.length
        : 0;

      if (contributorCount > 1) {
        contributorsData[repo.name] = contributors.map((c: any) => ({
          login: c.login,
          id: c.id,
          avatar_url: c.avatar_url,
          html_url: c.html_url,
          contributions: c.contributions,
        }));
      } else {
        delete contributorsData[repo.name];
      }

      const isPrivateNonOverride =
        repo.private &&
        !overrides.some(
          (o) =>
            o.owner.toLowerCase() === GITHUB_OWNER.toLowerCase() &&
            o.repo.toLowerCase() === repo.name.toLowerCase(),
        );

      if (
        isNotPushedIn6Months &&
        contributorCount <= 2 &&
        !isPrivateNonOverride
      ) {
        if (!contributorsNoContributorsCache.includes(repo.name)) {
          contributorsNoContributorsCache.push(repo.name);
        }
      } else {
        contributorsNoContributorsCache =
          contributorsNoContributorsCache.filter((name) => name !== repo.name);
      }
    } catch (error) {
      console.warn(
        `[prebuild] Failed to fetch contributors for ${repo.name}:`,
        error,
      );
    }
  }

  await writeFile(CONTRIBUTORS_PATH, JSON.stringify(contributorsData, null, 2));
  await writeFile(
    CONTRIBUTORS_CACHE_PATH,
    JSON.stringify(contributorsNoContributorsCache, null, 2),
  );
  console.info(
    '[prebuild] Wrote contributors.json and contributors-cache.json',
  );
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

  let repos: any[] = [];
  if (isStale(cache, 'projects.json')) {
    repos = await fetchProjectsData(octokit);
    cache['projects.json'] = now;
    updated = true;
  } else {
    console.info('[prebuild] projects.json is fresh — skipping fetch.');
    try {
      repos = JSON.parse(await readFile(PROJECTS_PATH, 'utf-8'));
    } catch {
      repos = await fetchProjectsData(octokit);
      cache['projects.json'] = now;
      updated = true;
    }
  }

  if (isStale(cache, 'contributors.json')) {
    await fetchContributorsData(octokit, repos);
    cache['contributors.json'] = now;
    updated = true;
  } else {
    console.info('[prebuild] contributors.json is fresh — skipping fetch.');
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
