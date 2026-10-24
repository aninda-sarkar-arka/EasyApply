# Project State

> Single source of truth for "where are we". Read at the start of every session, updated at the end of every session.

**Last updated:** 2026-10-24
**Current phase:** Phase 1: Local data layer and dashboard

## Goal

Turn EasyApply from a MERN web app into an open-source, local-first Chrome extension that:

1. Detects job applications on LinkedIn (Easy Apply and external Apply) and offers to save them.
2. Stores everything locally in the browser. No server holds user data.
3. Offers AI career tools (resume review, job match, bullet optimizer, cover letter, interview prep, job detail extraction) using the user's own API key for OpenAI, Anthropic, or Gemini.
4. Has clean, well-tested, well-documented code suitable for outside contributors and for showing recruiters.

## What already exists (legacy)

- MERN app: React dashboard with Recharts analytics, application CRUD, status workflow, resume versioning, notes, deadlines, CSV export dependency (csv-writer installed but no export feature implemented).
- Express backend with MongoDB Atlas (Mongoose), JWT + bcrypt auth, Multer file uploads.
- Gemini integration for five AI features (resume review, job match, bullet improve, cover letter, interview questions). Prompts are inline in `backend/controllers/aiController.js`.
- Demo mode in the backend with two hard-coded users and five applications.
- Integration tests (Jest + Supertest) covering auth and dashboard flows.

## Target structure

See `docs/ARCHITECTURE.md` Part 2 for full folder layout and migration mapping table.

## Done

- [x] Legacy MERN app with dashboard and Gemini features
- [x] Architecture direction agreed (see `DECISIONS.md`)
- [x] Session 0: full codebase audit (`ARCHITECTURE.md` written, issues logged, roadmap refined)
- [x] Fix critical legacy issues (ISSUE-002, ISSUE-003, ISSUE-007, ISSUE-008, ISSUE-009)
- [x] Migrate legacy tests to in-memory MongoDB (ISSUE-010)
- [x] Move legacy code to `legacy/` directory
- [x] Scaffold WXT extension with TypeScript, ESLint, Prettier, Vitest (ADR-005 resolved)
- [x] Dexie schema and repository layer with full test coverage (`src/db/`)
- [x] Dashboard extension page: Dashboard (stats + charts), ApplicationsList (CRUD), ApplicationDetail (pipeline + notes + timeline), insights lib (`src/lib/insights.ts`)

## In progress

- [ ] JSON export/import of all application data (Phase 1 remaining item)

## Next up

1. JSON export/import: add export-all-to-JSON and import-from-JSON to the dashboard (Settings page or toolbar button).
2. Begin Phase 2: SPA navigation listener on `linkedin.com/jobs/*`, job ID extraction from URL, Easy Apply success-modal detector.
3. Save prompt component in Shadow DOM with dedup by LinkedIn job ID.

## Roadmap

**Phase 0: Audit and foundation** (complete)
- [x] Audit codebase, write `ARCHITECTURE.md`, log issues.
- [x] Fix critical legacy bugs and security issues (ISSUE-002, ISSUE-003, ISSUE-007, ISSUE-008, ISSUE-009, ISSUE-010).
- [x] Move legacy code to `legacy/` directory.
- [x] Decide and finalize extension framework: WXT (ADR-005).
- [x] Scaffold extension: TypeScript, ESLint, Prettier, Vitest, Manifest V3.

**Phase 1: Local data layer and dashboard** (current)
- [x] Dexie schema mirroring legacy models (applications, resumes, settings).
- [x] Repository layer for all CRUD operations (`src/db/repositories/`).
- [x] Port the React dashboard into an extension page (Dashboard, ApplicationsList, ApplicationDetail).
- [ ] Full JSON export/import of all application data.

**Phase 2: LinkedIn Easy Apply detection**
- SPA navigation listener (URL change detection on `linkedin.com/jobs/*`).
- Job ID extraction from URL.
- Easy Apply success-modal detector (MutationObserver, fallback to text match).
- Save prompt in Shadow DOM (isolates extension styles from LinkedIn styles).
- Deduplication by job ID.

**Phase 3: External Apply flow**
- Capture job data at Apply click as a "pending" application in `chrome.storage.session`.
- Link the new ATS tab back via `openerTabId`.
- Confirmation prompt when user returns.

**Phase 4: AI layer (BYOK, multi-provider)**
- Unified interface: `generateText`, `generateJSON`, `validateKey`.
- Adapters for OpenAI, Anthropic, and Gemini (port existing prompts from `aiController.js`).
- Tier-based model map (`fast`, `smart`) in one config file.
- Zod validation for all JSON responses, with one retry on schema mismatch.
- Normalized error types in `src/ai/types.ts`.
- Settings UI: API key entry, provider selector, key test button.
- App fully usable with no key.

**Phase 5: Resilience and polish**
- Remote selector config (fallback to CDN-hosted JSON if local config fails).
- AI fallback extraction (when DOM selectors fail and a key is set, extract fields from page text).
- Optional Chrome built-in AI (Gemini Nano) for offline/no-key use.
- Optional Google Drive backup for export JSON.
- Optional AES encryption for stored API key.

**Phase 6: Open-source launch**
- README rewrite with screenshots and GIFs.
- `CONTRIBUTING.md` with setup guide, test instructions, and selector update guide.
- GitHub issue templates.
- Chrome Web Store listing and privacy policy.

## Open questions

- ADR-005: Which extension framework? WXT is the leading candidate. Needs a spike to confirm hot-reload and Manifest V3 compliance work as expected.
- Should `csv-writer` be removed from the backend? It is installed but not used in any route or controller.
