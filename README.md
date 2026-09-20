# QA Automation Framework

UI + API test automation covering **Conduit** (a self-hosted instance of the
[RealWorld](https://github.com/gothinkster/realworld) Medium clone) and
[restful-booker](https://restful-booker.herokuapp.com). Built with
Playwright + TypeScript.

**[Latest test report →](#)** *(update once GitHub Pages is live)*
![CI](https://github.com/YOUR_USERNAME/qa-automation-framework/actions/workflows/ci.yml/badge.svg)

## Why self-hosted

This project originally targeted the public `demo.realworld.io` /
`api.realworld.io` instances. Both went down mid-project (Cloudflare DNS
failure on the API, a deleted S3 bucket behind the frontend), and the
RealWorld maintainers confirm the "official" fallback domain
(`conduit.productionready.io`) just redirects into the same dead backend —
it's an unmaintained public dependency, not a transient outage.

Rather than chase a moving target, the app under test is now fully
self-hosted via Docker (`docker-compose.yml` builds the frontend, backend,
and PostgreSQL from source). That's a better fit for a portfolio project
anyway: `git clone && docker compose up` gets a reviewer a fully working
environment with zero external dependencies, and it puts the Docker line on
the CV this project is meant to demonstrate to actual use.

## Scope

| Area | What's covered |
|---|---|
| UI | Login (positive/negative), authenticated session handling, article creation |
| API | Conduit auth + article CRUD, restful-booker booking CRUD |
| Known defects | 1 documented API bug (see `bug-reports/`) |

**Deliberately not automated:** full CRUD across every Conduit entity
(comments, follows, favorites) — out of scope for a portfolio project;
listed here to show the boundary was a decision, not an oversight.

## Architecture

```
tests/            → specs only. No raw locators, no raw HTTP calls.
src/pages/        → page objects (locators + actions for one screen)
src/api/clients/  → typed wrappers around each API under test
src/fixtures/      → composable Playwright fixtures (see below)
src/data/factories/ → Faker-based test data builders
src/config/        → env loading, single source of truth
bug-reports/       → defects found during this project, with repro steps
```

**Fixtures, not a BasePage god-object.** `authenticatedPage` registers a
user via the API and seeds the JWT into `localStorage` before the test
runs — UI specs that aren't testing login start already logged in. Same
principle for API tests: `authedConduitApi` returns a client that's already
registered and authenticated. This is the same pattern used in the
production suite this project is modeled on: minimize UI-driven setup,
keep it out of the critical path of what's actually being tested.

## Getting started

**1. Start the app under test** (PostgreSQL + Conduit backend + Conduit frontend, all built from source — first run takes a few minutes):

```bash
docker compose up --build backend frontend
```

This publishes the frontend on `http://localhost:8092` and the API on
`http://localhost:3000/api`.

**2. Run the tests against it**, either from your host machine:

```bash
npm install
npx playwright install --with-deps
cp .env.example .env   # already points at localhost:8092 / localhost:3000
npm test                # everything
npm run test:ui         # UI project only
npm run test:api        # API project only (includes restful-booker, which stays external)
npm run report           # open the last HTML report
```

...or fully containerized, app + tests in one command:

```bash
docker compose up --build
```

(the `tests` service waits on `backend`/`frontend` and talks to them over
the compose network, so it uses different URLs internally — see
`docker-compose.yml`).

## CI

`.github/workflows/ci.yml` runs the full suite on every PR, on push to
`main`, and nightly, sharded across 2 workers, with the merged HTML report
published to GitHub Pages.

## Test strategy notes

- **API-first setup, UI-first assertions.** Anything that's just
  "get the app into state X" happens via the API client. UI tests only
  drive the UI for the behavior actually being verified.
- **One bug documented, not hidden.** `BR-001` (see `bug-reports/`) is a
  real defect in restful-booker's public API. The test that caught it
  asserts the *current* (buggy) behavior on purpose, tagged `@known-bug`,
  so it fails loudly if the upstream API is ever fixed — at which point
  the test needs updating, not the bug re-filing.
- **Data factories over hardcoded fixtures.** Every test gets unique,
  Faker-generated data, so parallel runs and CI re-runs don't collide.

## Next additions

- Visual regression on the article editor
- Contract tests against the Conduit OpenAPI spec
- AI-assisted test case generation from user stories (script + writeup) — see `/ai-in-qa` (WIP)
