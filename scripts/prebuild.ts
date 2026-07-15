import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Octokit } from 'octokit';
import pLimit from 'p-limit';
import { issues, prs, type Contribution } from '../src/assets/data/opensource';
import { overrides, additionalProjects } from '../src/assets/data/overrides';
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

  const repos: any[] = await octokit.paginate('GET /user/repos', {
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
    affiliation: 'owner',
    visibility: 'all',
  });

  for (const proj of additionalProjects) {
    try {
      console.info(
        `[prebuild] Fetching additional repository ${proj.owner}/${proj.repo}…`,
      );
      const { data: additionalRepo } = await octokit.request(
        'GET /repos/{owner}/{repo}',
        { owner: proj.owner, repo: proj.repo },
      );
      if (!repos.some((r) => r.id === additionalRepo.id)) {
        repos.push(additionalRepo);
      }
    } catch (err) {
      console.warn(
        `[prebuild] Failed to fetch additional repository ${proj.owner}/${proj.repo}:`,
        err,
      );
    }
  }

  const limit = pLimit(5);

  /** Parse the total page count from a GitHub Link header, return null if absent. */
  function parseTotalPages(linkHeader: string | undefined): number | null {
    if (!linkHeader) return null;
    const match = linkHeader.match(/[?&]page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : null;
  }

  const repoData = await Promise.all(
    repos.map((repo) =>
      limit(async () => {
        const owner = repo.owner.login as string;
        const name = repo.name as string;

        // ── Languages ────────────────────────────────────────────────────
        const { data: languages } = await octokit.request(
          'GET /repos/{owner}/{repo}/languages',
          { owner, repo: name },
        );

        const languageEntries = Object.entries(languages)
          .map(([lang, bytes]) => ({ name: lang, bytes: bytes as number }))
          .sort((a, b) => b.bytes - a.bytes);

        const languageNames = languageEntries.length
          ? languageEntries.map(({ name }) => name)
          : repo.language
            ? [repo.language]
            : ['Other'];

        // ── Last commit date + total commit count ────────────────────────
        // Fetch just the first page (1 item) — the Link header tells us total pages.
        let lastCommitDate: string | null = null;
        let totalCommits: number | null = null;
        try {
          const commitsResp = await octokit.request(
            'GET /repos/{owner}/{repo}/commits',
            { owner, repo: name, per_page: 1 },
          );
          // Most-recent commit date
          lastCommitDate =
            commitsResp.data[0]?.commit?.committer?.date ??
            commitsResp.data[0]?.commit?.author?.date ??
            null;
          // Total commit count from pagination Link header
          const linkHeader = (commitsResp.headers as Record<string, string>)[
            'link'
          ];
          const totalPages = parseTotalPages(linkHeader);
          totalCommits = totalPages ?? (commitsResp.data.length > 0 ? 1 : 0);
        } catch (err) {
          console.warn(`[prebuild] Could not fetch commits for ${name}:`, err);
        }

        // ── Total PR count (open + closed) ───────────────────────────────
        let totalPRs: number | null = null;
        try {
          const [openPRs, closedPRs] = await Promise.all([
            octokit.paginate('GET /repos/{owner}/{repo}/pulls', {
              owner,
              repo: name,
              state: 'open',
              per_page: 100,
            }),
            octokit.paginate('GET /repos/{owner}/{repo}/pulls', {
              owner,
              repo: name,
              state: 'closed',
              per_page: 100,
            }),
          ]);
          totalPRs = openPRs.length + closedPRs.length;
        } catch (err) {
          console.warn(`[prebuild] Could not fetch PRs for ${name}:`, err);
        }

        return {
          ...repo,
          languageEntries,
          languageNames,
          lastCommitDate,
          totalCommits,
          totalPRs,
        };
      }),
    ),
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
        { owner: repo.owner.login, repo: repo.name },
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
            o.owner.toLowerCase() === repo.owner.login.toLowerCase() &&
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
