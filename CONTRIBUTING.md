# Contributing to EasyApply

Thanks for your interest. This guide covers everything you need to get the extension running locally, write and run tests, and submit a pull request.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Development workflow](#development-workflow)
- [Running tests](#running-tests)
- [Code standards](#code-standards)
- [Updating LinkedIn selectors](#updating-linkedin-selectors)
- [Submitting a pull request](#submitting-a-pull-request)

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- Google Chrome

---

## Setup

```bash
git clone https://github.com/aninda-sarkar-arka/EasyApply.git
cd EasyApply
npm install
```

---

## Development workflow

Start the WXT dev server:

```bash
npm run dev
```

This builds the extension to `.output/chrome-mv3-dev/` and watches for file changes.

**Loading the extension in Chrome:**

1. Go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right)
3. Click **Load unpacked** and select `.output/chrome-mv3-dev/`

The extension hot-reloads on most file changes. If a change does not pick up, click the refresh icon on the extension card in `chrome://extensions`.

**Opening the dashboard:**

Click the extension icon and then **Open dashboard**, or navigate directly to the extension's dashboard page from `chrome://extensions` > Details > Extension pages.

---

## Running tests

```bash
npm test            # run all tests once
npm run test:watch  # watch mode
```

Tests use [Vitest](https://vitest.dev/) with `fake-indexeddb` for the Dexie repositories and plain TypeScript for everything else. No browser required.

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

All three must pass before a PR is ready.

---

## Code standards

- **TypeScript strict mode.** No `any` without a comment explaining why.
- **Feature-based folder structure.** UI features live in `src/features/`, shared UI in `src/components/`, pure helpers in `src/lib/`.
- **Data access via repositories.** UI and content scripts never call Dexie directly; use `src/db/repositories/`.
- **AI calls via the unified interface.** Never import a provider SDK directly; use `generateText` / `generateJSON` from `src/ai/index.ts`.
- **File size.** If a file exceeds ~250 lines, propose a split in the PR description.
- **Comments.** Explain *why*, not *what*. Public functions in `src/ai/`, `src/db/`, and `src/scrapers/` get a short JSDoc.
- **Naming.** `PascalCase` for components and types, `camelCase` for functions and variables, `kebab-case` for file names except React components.

---

## Updating LinkedIn selectors

LinkedIn regularly changes its obfuscated class names. Selectors are centralised in one file so they can be patched without touching any logic:

**Bundled selectors (shipped with the extension):**

`src/scrapers/linkedin/selectors.ts`

Each key (`jobTitle`, `company`, `location`, `easyApplyButton`) holds an array of selector strings tried in order. Add a new selector to the front of the relevant array and keep the old ones as fallbacks.

**Remote selector config (no extension update needed):**

The background worker fetches an updated selector config from:

```
https://raw.githubusercontent.com/aninda-sarkar-arka/easyapply/main/public/selectors.json
```

on startup (cached for 24 hours). To patch selectors without shipping a new extension version, update `public/selectors.json` in this repo. The file must match the schema validated in `src/scrapers/linkedin/remoteSelectors.ts`.

Example `public/selectors.json`:

```json
{
  "jobTitle": [".new-selector", ".jobs-unified-top-card__job-title"],
  "company": [".new-company-selector", ".job-details-jobs-unified-top-card__company-name"],
  "location": [".jobs-unified-top-card__bullet"],
  "easyApplyButton": [".jobs-apply-button--top-card"],
  "externalApplyButton": [".jobs-apply-button--top-card"],
  "successModal": [".artdeco-modal"]
}
```

If you spot a broken selector, please open an issue using the **Selector broken** template before submitting a PR.

---

## Submitting a pull request

1. Fork the repo and create a branch: `feat/your-feature` or `fix/your-bug`.
2. Make sure `npm run lint`, `npm run typecheck`, and `npm test` all pass.
3. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Add a scope where useful, for example `feat(scraper):` or `fix(ai):`.
4. Keep one logical change per commit.
5. Open a pull request against `main`. Fill in the PR template.
6. For large changes, open an issue first to discuss the approach.

**What not to include:**

- `.env` files, API keys, or any real user data
- Personal resumes or identifiable test data (use anonymised fixtures in `tests/fixtures/`)
- Changes to `docs/sessions/` or `CLAUDE.md` (internal workflow files, not tracked)
