# Open Source Page

An implementation plan.

## Metadata

| Field                | Value              |
| -------------------- | ------------------ |
| **Section**          | Open Source Page   |
| **Status (today)**   | PARTIAL            |
| **Estimated effort** | S (1w)             |
| **Owner (proposed)** | alexanderdombroski |
| **Depends on**       | None               |
| **Unblocks**         | None               |

---

## 1. Problem Statement

GitHub's profile page is very minimal, and I'd like to expand my profile to showcase my open source work. It will also serve as a personal journal-like recording where I can see what I worked on in the past. GitHub currently shows PRs, but the list is all-encompassing and I'd like to create a curated list that shows the most meaningful contributions.

## 2. Goals

- Render a clean, curated showcase of specific, high-value pull requests and issues.
- Maintain a personal journal-like feel that documents the context or significance of past work.
- Keep the display dynamically synchronized with real-time GitHub data (status, merge state, repository names) using the Octokit client.
- Ensure fast, resilient page rendering (e.g., using build-time static generation with Astro or caching to avoid rate limits).

## 3. Non-Goals

- Automatically importing _all_ user pull requests and issues from GitHub (since the goal is curation).
- Implementing writing/editing tools on the website to post issues or PR comments back to GitHub.
- Supporting non-GitHub version control hosting providers (e.g., GitLab, Bitbucket) in this phase.

## 4. Personas & User Stories

- **As a Portfolio Owner**, I want to curate a list of my most meaningful pull requests and issues so that I can show my best work and use it as a personal journal of what I achieved.
- **As a Student**, I want to show how I used school-taught concepts to make real-world contributions so that I can bridge academic learning and professional software development.
- **As a Software Developer**, I want to see which open-source projects I've spent the most time contributing to so that I can track my focus and impact across different ecosystems.

## 5. Functional Requirements

- **FR-1.** The system MUST retrieve details (title, repository, number, state/merged status, and HTML URL) for a curated list of pull request and issue IDs via the GitHub API. It MUST cache this data locally at build-time and only fetch new data from the GitHub API if the cached data is more than 7 days old.
- **FR-2.** The system MUST securely use a GitHub token stored in the build/server environment (`GITHUB_TOKEN`) to authenticate API requests.
- **FR-3.** The system MUST display a summary at the top of the page showing the total count of contributions grouped by GitHub organization.
- **FR-4.** The system MUST display pull requests and issues in distinct visual sections.
- **FR-5.** The system MUST display status badges indicating whether an item is open, closed, or merged.

## 6. Non-Functional Requirements

- **Performance** — Page MUST render statically at build time (e.g., using weekly rebuilds) to avoid client-side API calls and guarantee sub-second load times.
- **Security** — The `GITHUB_TOKEN` MUST remain strictly server-side/build-time and never be exposed in client bundles.
- **Accessibility** — All links and components MUST conform to WCAG 2.1 AA (proper screen reader labels, keyboard focus, and contrast).

## 7. Acceptance Criteria

- **AC-1.** _Given_ the build runs successfully, _When_ retrieving data for the curated contribution lists, _Then_ the output page should contain the title, repo name, issue/PR number, and correct state badge matching the GitHub data.
- **AC-2.** _Given_ the curated contributions lists span multiple organizations (e.g., `withastro`, `microsoft`), _When_ the page is loaded, _Then_ the organization summary at the top shows the correct count of items for each organization.
- **AC-3.** _Given_ a build environment _without_ `GITHUB_TOKEN` set, _When_ compiling the site, _Then_ the build fails gracefully with a clear error indicating the missing environment variable.

## 8. API Surface

N/A (Statically generated page).

## 9. UI / UX

- **Key Components**:
  - Organization Summary Banner (rendered at the top of the page).
  - Contribution Section (grouped by Pull Requests and Issues, or unified timeline).
  - Contribution Card (showing repository name, organization avatar, title, pull request/issue number, and status badge).
- **Key User Flows**:
  1. User navigates to `/code/opensource`.
  2. Page renders statically. If the client clicks a card, they are redirected to the GitHub contribution page in a new tab.
- **Responsive Layout**:
  - Organization summary layout adjusts from a horizontal flex/row on desktop to a vertical stack on mobile.
  - Contribution Cards use a responsive grid (`repeat(auto-fill, minmax(280px, 1fr))`).

## 10. Integration Points

- **External APIs**:
  - GitHub REST API:
    - Pull Requests: `GET /repos/{owner}/{repo}/pulls/{pull_number}`
    - Issues: `GET /repos/{owner}/{repo}/issues/{issue_number}`
    - Repositories: `GET /repos/{owner}/{repo}` (for repository metadata/images)
    - Organizations: `GET /orgs/{org}` (for organization avatar/profile URLs)

## 11. Dependencies & Sequencing

- Needs GitHub authentication token (`GITHUB_TOKEN`) configured in local environment and Vercel/Netlify hosting provider.

## 12. Risks & Mitigations

| Risk                                | Likelihood | Impact | Mitigation                                                                            |
| ----------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------- |
| GitHub API Rate limits during build | Medium     | High   | Implementation of the 7-day build-time caching layer (FR-1) to minimize API requests. |

## 13. Rollout Plan

- Direct deploy to production once tests/build succeeds. (No feature flags required).

## 14. Production Readiness Check

- Verify `GITHUB_TOKEN` is injected into the production build environment.
- Verify lighthouse performance score on desktop/mobile.

## 15. Documentation & Training

- Keep the inline curated list of PRs and Issues in `src/pages/code/opensource.astro` documented with clear comments so adding new items is simple.

## 16. Open Questions

1. How should we store the build-time cache in CI/CD? (e.g. committing the cache file to git vs using build environment caching directory).

## 17. References

- [src/pages/code/opensource.astro](file:///Users/alexdombroski/vscode/webdev/alexanderdombroski.github.io/src/pages/code/opensource.astro)
