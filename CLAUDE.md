# CLAUDE.md

This file is loaded automatically at the start of every Claude Code session. It holds the stable rules for working on EasyApply. The moving state of the project lives in `docs/PROJECT_STATE.md`.

## 1. Session start protocol (do this every time, before any code)

1. Read `docs/PROJECT_STATE.md` (goal, what is done, what is next).
2. Read the most recent file in `docs/sessions/` (and the one before it if the latest is short).
3. Read the **Open** section of `docs/ISSUES.md`.
4. Skim `docs/DECISIONS.md` so you do not re-argue settled decisions.
5. Reply to the user with a 5 line summary: current phase, last session outcome, open blockers, and your proposed plan for this session. Wait for confirmation before editing code.

**Setup check:** if the `docs/` folder or any file listed in section 9 is missing, create it first with the exact content given in section 9. Do not overwrite files that already exist.

**Bootstrap check:** if `docs/ARCHITECTURE.md` does not exist, this is Session 0. Run the bootstrap in section 7 instead of the normal plan.

## 2. Session end protocol

When the user says "wrap up", "end session", or similar (or before context gets too long):

1. Create `docs/sessions/YYYY-MM-DD-NN-short-title.md` from `docs/sessions/_TEMPLATE.md`. `NN` is the session number for that day (01, 02...).
2. Update `docs/ISSUES.md`: add new issues, move fixed ones to **Resolved** with the fix and the session link.
3. Update `docs/PROJECT_STATE.md`: tick completed items, adjust **In progress** and **Next up**, bump "Last updated".
4. Add any new architectural decision to `docs/DECISIONS.md`.
5. Propose a commit message. Do not commit or push unless the user says so.

Log issues **as they happen** during the session, not only at the end. If an error takes more than a few minutes to solve, it belongs in `ISSUES.md`.

## 3. Project goal (short version)

EasyApply is a **local-first job application tracker** shipped as a **Chrome extension (Manifest V3)**. It detects job applications on LinkedIn, offers to save them, and provides AI career tools using the **user's own API key** (OpenAI, Anthropic, or Gemini). No user data is stored on any server we run. Full details: `docs/PROJECT_STATE.md` and `docs/DECISIONS.md`.

## 4. Non-negotiable architecture rules

- **No backend for user data.** All data lives in the browser: IndexedDB via Dexie. No MongoDB, no Express, no JWT for the extension. The legacy MERN code is reference material only, until migration is finished.
- **AI is optional and provider-agnostic.** Features call the unified interface in `src/ai/`, never a provider SDK or endpoint directly. Every AI response that should be JSON is validated with Zod. The app must be fully usable with no API key.
- **API keys** live in `chrome.storage.local` only. Never `chrome.storage.sync`, never logged, never committed, never sent anywhere except the chosen provider.
- **Scraping is passive.** Only read the page the user is already viewing. No background crawling, no automated requests to LinkedIn.
- **Data access goes through repositories** in `src/db/`. UI components never call Dexie directly.
- **Selectors are config, not code.** LinkedIn DOM selectors live in one config file with fallback chains, so they can be updated without touching logic.

## 5. Code standards

- **Language:** TypeScript, `strict: true`. No `any` without a comment explaining why.
- **Structure:** feature-based folders (see `docs/ARCHITECTURE.md`). Shared UI in `src/components/`, pure helpers in `src/lib/`.
- **Naming:** `PascalCase` for components and types, `camelCase` for functions and variables, `kebab-case` for file names except React components.
- **Functions:** small and single-purpose. If a file passes ~250 lines, propose a split.
- **Errors:** never swallow errors silently. Normalize AI provider errors into the types in `src/ai/types.ts`.
- **Tests:** Vitest. Every scraper parser, repository, and AI adapter gets unit tests. Use saved HTML fixtures for scraper tests (in `tests/fixtures/`), never live LinkedIn.
- **Lint and format:** ESLint + Prettier. Code must pass `lint`, `typecheck`, and `test` before a task is called done.
- **Comments:** explain *why*, not *what*. Public functions in `src/ai/`, `src/db/`, and `src/scrapers/` get a short JSDoc.
- **Dependencies:** ask before adding a new dependency. Prefer small, well-maintained packages.

## 6. Git conventions

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Scope where useful, for example `feat(scraper): detect Easy Apply success modal`.
- One logical change per commit. Branch names: `feat/...`, `fix/...`, `docs/...`.
- Never commit `.env`, API keys, personal resumes, or real user data. Test fixtures must be anonymized.

## 7. Session 0 bootstrap (runs once)

0. Make sure the setup in section 9 is complete.
1. Explore the **entire** repository: `backend/`, `frontend/`, configs, package files. Understand every model, route, controller, util, page, component, and service.
2. Write `docs/ARCHITECTURE.md` with two parts:
   - **Current state (legacy MERN):** components, data models, API routes, AI features and where their prompts live, known weaknesses.
   - **Target state (extension):** the structure in `docs/PROJECT_STATE.md`, and a mapping table of what each legacy piece becomes (for example: Mongoose `Application` model becomes a Dexie table + `applicationsRepository`; `backend/utils/gemini` becomes `src/ai/adapters/gemini.ts` + `src/ai/prompts/`).
3. Produce a **gap analysis and migration plan** as phases with small, testable tasks. Add it to `docs/PROJECT_STATE.md` under **Roadmap**.
4. List any bugs, security problems (for example exposed secrets), or dead code you found in `docs/ISSUES.md`.
5. Do **not** delete or move legacy code in Session 0. Ask first.
6. Write the Session 0 log and follow the session end protocol.

## 8. Writing style for docs and logs

- Plain, direct English. Short paragraphs. Prefer concrete facts (file paths, commands, error messages) over general statements.
- Do not use em dashes. Use commas, colons, periods, or parentheses instead.
- Keep `CLAUDE.md` stable. Change it only when a rule changes, and mention the change in the session log.

## 9. Initial docs files (created once by Claude)

Create each file below at the given path with the content inside the fence (without the fence itself). After creation, these files are maintained through the session protocols above, and this section is only a reference for the original content.

### `docs/PROJECT_STATE.md` (Centralized project state)

````markdown
# Project State

> Single source of truth for "where are we". Read at the start of every session, updated at the end of every session.

**Last updated:** (not yet, Session 0 pending)
**Current phase:** Phase 0: Audit and foundation

## Goal

Turn EasyApply from a MERN web app into an open-source, local-first Chrome extension that:

1. Detects job applications on LinkedIn (Easy Apply and external Apply) and offers to save them.
2. Stores everything locally in the browser. No server holds user data.
3. Offers AI career tools (resume review, job match, bullet optimizer, cover letter, interview prep, job detail extraction) using the user's own API key for OpenAI, Anthropic, or Gemini.
4. Has clean, well-tested, well-documented code suitable for outside contributors and for showing recruiters.

## What already exists (legacy)

- MERN app: React dashboard with Recharts analytics, application CRUD, status workflow, resume versioning, notes, deadlines, CSV export.
- Express backend with MongoDB (Mongoose), JWT + bcrypt auth, Multer uploads.
- Gemini integration for all AI features.

## Target structure (proposed, confirm in Session 0)

```text
easyapply/
├── CLAUDE.md
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── PROJECT_STATE.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── ISSUES.md
│   └── sessions/
├── legacy/                  # old backend/ and frontend/, reference only, removed after migration
├── src/
│   ├── entrypoints/         # background worker, content scripts, popup, side panel, dashboard page
│   ├── features/            # applications, resumes, ai-tools, analytics (UI + hooks per feature)
│   ├── ai/                  # types.ts, models.ts, adapters/, prompts/
│   ├── db/                  # Dexie schema, migrations, repositories
│   ├── scrapers/
│   │   └── linkedin/        # selectors config, detectors, extractors
│   ├── components/          # shared UI
│   └── lib/                 # pure helpers
├── tests/
│   └── fixtures/            # anonymized HTML snapshots
└── public/                  # icons, static assets
```

## Done

- [x] Legacy MERN app with dashboard and Gemini features
- [x] Architecture direction agreed (see `DECISIONS.md`)

## In progress

- [ ] Session 0: full codebase audit, `ARCHITECTURE.md`, migration roadmap

## Next up

- [ ] Decide extension tooling: WXT, Plasmo, or manual Vite + MV3 (open question, see `DECISIONS.md`)
- [ ] Decide TypeScript migration approach for reused frontend code

## Roadmap (draft, refine in Session 0)

**Phase 0: Audit and foundation**
Audit codebase, move legacy code to `legacy/`, scaffold extension, set up TypeScript, ESLint, Prettier, Vitest, CI.

**Phase 1: Local data layer and dashboard**
Dexie schema mirroring legacy models, repositories, port dashboard into an extension page, full JSON export/import.

**Phase 2: LinkedIn Easy Apply detection**
SPA navigation handling, job ID extraction, success-modal detection, save prompt in Shadow DOM, dedup by job ID.

**Phase 3: External Apply flow**
Capture job at click, pending state in `chrome.storage.session`, link new tab via `openerTabId`, confirmation prompt.

**Phase 4: AI layer (BYOK, multi-provider)**
Unified interface, OpenAI / Anthropic / Gemini adapters, tier-based model map, Zod validation with retry, normalized errors, key test button, settings UI. Port existing prompts.

**Phase 5: Resilience and polish**
Remote selector config, AI fallback extraction, optional Chrome built-in AI, optional Google Drive backup, optional key encryption.

**Phase 6: Open-source launch**
README rewrite with GIFs, CONTRIBUTING.md, issue templates, Chrome Web Store listing, privacy policy.

## Open questions

- Extension framework choice.
- Keep any part of the legacy backend? (Current answer: no.)
````

### `docs/DECISIONS.md` (Architecture decision records)

````markdown
# Architecture Decisions

> Settled decisions and the reasoning behind them. Do not reopen these without a new reason. New decisions get the next number.

## ADR-001: Local-first storage, no user data on our servers

**Status:** Accepted
**Decision:** All user data (applications, resumes, notes, settings) is stored in the browser via IndexedDB (Dexie), inside the extension origin. The dashboard runs as an extension page so it shares the same database as the popup, side panel, and background worker.
**Why:** Privacy is a core product promise. A per-user local server was considered and rejected because normal users will not install and run one.
**Consequences:** No JWT or auth needed. Data loss risk on uninstall or browser reset, so JSON export/import is required, with optional backup to the user's own Google Drive later. No multi-device sync without that backup.

## ADR-002: Bring your own key, multi-provider AI

**Status:** Accepted
**Decision:** Users optionally paste their own API key for OpenAI, Anthropic, or Gemini. All features call one provider-agnostic interface (`generateText`, `generateJSON`, `validateKey`) with per-provider adapters. Models are chosen by tier (`fast`, `smart`) mapped in one config file.
**Why:** Keeps the project fully backend-free and free to run. A shared key in the extension would be extractable. A proxy server was rejected because it reintroduces a backend and abuse handling.
**Consequences:** Keys stored in `chrome.storage.local` (never sync). All JSON output validated with Zod. Resume PDFs are converted to text locally (pdf.js) so every provider receives the same input. The app must work fully without any key. Privacy wording must be honest: data sent to AI features goes to the chosen provider.

## ADR-003: Detect application success, not button clicks

**Status:** Accepted
**Decision:** For LinkedIn Easy Apply, trigger the save prompt on the submission confirmation, not the Apply click. For external Apply, capture job data at click as "pending" and ask the user to confirm later.
**Why:** Users often open and abandon applications. Tracking completion on every external ATS is not feasible.

## ADR-004: Passive, resilient scraping

**Status:** Accepted
**Decision:** Only read pages the user is viewing. Use the LinkedIn job ID as the primary key. Selectors live in a config with fallback chains. When selectors fail and an AI key is available, extract fields from page text with the AI layer.
**Why:** LinkedIn changes obfuscated class names often, and its terms are hostile to automated scraping.

## ADR-005: Extension framework

**Status:** Open
**Options:** WXT, Plasmo, manual Vite + Manifest V3.
**Notes:** WXT is the current leading candidate (good MV3 support, React, hot reload, file-based entrypoints).
````

### `docs/ISSUES.md` (Error and issue log)

````markdown
# Issues and Errors Log

> Every error, bug, or blocker that took real time to solve, plus anything still open. Newest first in each section.

## How to log an issue

```markdown
### ISSUE-NNN: Short title
- **Status:** Open | Resolved | Won't fix
- **Found:** YYYY-MM-DD, session link
- **Area:** scraper | db | ai | ui | build | legacy | other
- **Symptom:** what happened, exact error message if any
- **Cause:** root cause once known
- **Fix:** what solved it, with file paths or commit
- **Lesson:** what to do differently next time (optional)
```

## Open

_None yet. Session 0 will populate this with findings from the codebase audit._

## Resolved

_None yet._
````

### `docs/sessions/_TEMPLATE.md` (Session log template)

````markdown
# Session YYYY-MM-DD-NN: Short title

**Phase:** (from PROJECT_STATE.md)
**Goal for this session:** one or two sentences

## Summary

Three to five sentences a new reader can understand without opening any other file.

## What was done

- Change, with file paths
- Change, with file paths

## Decisions made

- Decision and reason (also added to `DECISIONS.md` if architectural)

## Issues faced

- ISSUE-NNN: short title (details in `ISSUES.md`)

## Not finished / carried over

- Task and its current state, so the next session can pick it up directly

## Next session should start with

1. First concrete task
2. Second concrete task

## Commits

- `type(scope): message`
````
