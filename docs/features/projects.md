# Personal Projects Page

An implementation plan.

## Metadata

| Field                | Value                  |
| -------------------- | ---------------------- |
| **Section**          | Personal Projects Page |
| **Status (today)**   | PARTIAL                |
| **Estimated effort** | S (1w)                 |
| **Owner (proposed)** | alexanderdombroski     |
| **Depends on**       | None                   |
| **Unblocks**         | None                   |

---

## 1. Problem Statement

GitHub profiles only display a standard chronological or pinned view of repositories, making it difficult to sort, filter, or showcase specific languages and projects tailored to visitor interests. A dedicated projects page allows visitors to easily explore public work with interactive filters (e.g., programming language toggles, fork controls, and star metrics) while maintaining a fast, statically generated experience.

## 2. Goals

- Render a clean, comprehensive showcase of all personal GitHub repositories.
- Allow users to interactively filter projects by language and toggle visibility of repository forks.
- Display metadata for each project, including language bytecode breakdown, stargazers, forks, and last-updated timestamp.
- Ensure the page is completely static at runtime with sub-second performance, updating its data from GitHub on a weekly basis via a cached build step.

## 3. Non-Goals

- Real-time client-side polling of the GitHub API (all interactions use build-time JSON state).
- Editing or modifying repository settings or triggering GitHub Actions from the website.
- Disclosing names or descriptions of private repositories that are not explicitly whitelisted.

## 4. Personas & User Stories

- **As a Portfolio Owner**, I want to showcase all my public coding projects in one organized place so that others can easily explore my work.
- **As a Student**, I want to filter projects by language so that I can find examples of specific technologies being used in real-world contexts.
- **As a Recruiter**, I want to see key metrics like stars, forks, and the exact language byte distribution for each project so that I can gauge complexity and reach.

## 5. Functional Requirements

- **FR-1.** The system MUST retrieve all public repositories and their associated language statistics for a specified GitHub username via the GitHub REST API. It MUST cache this data locally at build-time and only fetch new data if the cached data is more than 7 days old.
- **FR-2.** The system MUST securely use a GitHub token stored in the build/server environment (`GITHUB_TOKEN`) to authenticate API requests.
- **FR-3.** The system MUST offer a client-side filter interface allowing users to filter repositories by programming language.
- **FR-4.** The system MUST support toggling the display of repository forks (hidden by default).
- **FR-5.** The system MUST display cards for each project showing name, full name, forks status, description, stars count, forks count, last-updated timestamp, and a breakdown of languages used.
- **FR-6.** The system MUST support representing private repositories as masked cards (no name or detail exposed) unless the repository is explicitly included in a hardcoded whitelist of private repositories to show.

## 6. Non-Functional Requirements

- **Performance** — Page MUST render statically at build time (e.g., using weekly rebuilds) to avoid client-side API calls and guarantee sub-second load times.
- **Security** — The `GITHUB_TOKEN` MUST remain strictly server-side/build-time and never be exposed in client bundles.
- **Accessibility** — All filters, buttons, and links MUST conform to WCAG 2.1 AA (proper screen reader labels, keyboard focus, and contrast).

## 7. Acceptance Criteria

- **AC-1.** _Given_ the build runs successfully, _When_ retrieving repository lists, _Then_ the compiler writes a static `projects.json` file to be used on the client.
- **AC-2.** _Given_ the projects page is loaded, _When_ a user clicks on a language filter button, _Then_ only the repositories containing that language are displayed.
- **AC-3.** _Given_ a build environment _without_ `GITHUB_TOKEN` set, _When_ compiling the site, _Then_ the build fails gracefully with a clear error indicating the missing environment variable.

## 8. API Surface

N/A (Statically generated page).

## 9. UI / UX

- **Key Components**:
  - Hero banner with stats overview.
  - Controls bar (language filters and show/hide forks toggle).
  - Repositories Grid (responsive list of repo cards).
- **Key User Flows**:
  1. User navigates to `/code/projects`.
  2. Users toggle "Show forks" to dynamically show or hide forked repos and expand the language filter list.
  3. Users click on language filters to hide irrelevant cards.
- **Responsive Layout**:
  - Responsive layout adjusting columns based on viewport (`repeat(auto-fill, minmax(280px, 1fr))`).

## 10. Integration Points

- **External APIs**:
  - GitHub REST API:
    - User Repositories: `GET /users/{username}/repos`
    - Repository Languages: `GET /repos/{owner}/{repo}/languages`

## 11. Dependencies & Sequencing

- Needs GitHub authentication token (`GITHUB_TOKEN`) configured in local environment and Vercel/Netlify hosting provider.

## 12. Risks & Mitigations

| Risk                                               | Likelihood | Impact   | Mitigation                                                                                                           |
| -------------------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| GitHub API Rate limits during build                | Medium     | High     | Implementation of the 7-day build-time caching layer (FR-1) to minimize API requests.                                |
| Leak of sensitive private repository names/details | Low        | High     | Use a hardcoded whitelist filter at build time to mask private repositories by default, stripping names and details. |
| Leaked token via client scripts                    | Low        | Critical | Ensure no runtime network requests are executed; the `GITHUB_TOKEN` is strictly consumed during the build.           |

## 13. Rollout Plan

- Direct deploy to production once tests/build succeeds. (No feature flags required).

## 14. Production Readiness Check

- Verify `GITHUB_TOKEN` is injected into the production build environment.
- Verify lighthouse performance score on desktop/mobile.

## 15. Documentation & Training

- Keep code comments in `src/pages/code/projects.astro` updated, explaining how the static caching works.

## 16. Open Questions

1. How should we store the build-time cache in CI/CD? (e.g. committing the cache file to git vs using build environment caching directory).

## 17. References

- [src/pages/code/projects.astro](file:///Users/alexdombroski/vscode/webdev/alexanderdombroski.github.io/src/pages/code/projects.astro)
