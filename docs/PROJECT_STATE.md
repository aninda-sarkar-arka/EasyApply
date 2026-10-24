# Project State

> Single source of truth for "where are we". Read at the start of every session, updated at the end of every session.

**Last updated:** 2026-10-24
**Current phase:** Phase 4 complete; Phase 5 next

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
- [x] Dashboard extension page: Dashboard (stats + charts), ApplicationsList (CRUD), ApplicationDetail (pipeline + notes + timeline), SavedJobs, NoteManagement, insights lib (`src/lib/insights.ts`)
- [x] LinkedIn Easy Apply detection: SPA nav listener, job ID extraction, success-modal MutationObserver, dedup by job ID, Shadow DOM save prompt
- [x] External Apply flow: job data captured at click, prompted on-page immediately
- [x] AI layer (Phase 4): unified interface, OpenAI/Anthropic/Gemini adapters, Zod validation, BYOK Settings UI, AITools dashboard page with five tabbed tools

## In progress

_(nothing in progress)_

## Next up

1. Phase 5: Remote selector config (CDN-hosted fallback JSON for LinkedIn selectors).
2. Phase 5: AI fallback extraction (use AI layer to extract job fields when DOM selectors fail).
3. Phase 5: Optional AES encryption for stored API key.
4. Phase 6: README rewrite with screenshots, CONTRIBUTING.md.

## Roadmap

**Phase 0: Audit and foundation** (complete)
- [x] Audit codebase, write `ARCHITECTURE.md`, log issues.
- [x] Fix critical legacy bugs and security issues (ISSUE-002, ISSUE-003, ISSUE-007, ISSUE-008, ISSUE-009, ISSUE-010).
- [x] Move legacy code to `legacy/` directory.
- [x] Decide and finalize extension framework: WXT (ADR-005).
- [x] Scaffold extension: TypeScript, ESLint, Prettier, Vitest, Manifest V3.

**Phase 1: Local data layer and dashboard** (complete)
- [x] Dexie schema mirroring legacy models (applications, resumes, settings).
- [x] Repository layer for all CRUD operations (`src/db/repositories/`).
- [x] Port the React dashboard into an extension page (Dashboard, ApplicationsList, ApplicationDetail).
- [x] Full JSON export/import of all application data (Settings page, `src/lib/export.ts`).

**Phase 2: LinkedIn Easy Apply detection** (complete)
- [x] SPA navigation listener (URL change detection on `linkedin.com/jobs/*`).
- [x] Job ID extraction from URL.
- [x] Easy Apply success-modal detector (MutationObserver, selector + text fallback).
- [x] Deduplication by job ID (background worker checks before saving).
- [x] Shadow DOM save prompt: user confirms before the application is saved.

**Phase 3: External Apply flow** (complete)
- [x] Job data captured at external Apply button click.
- [x] Immediate on-page confirmation prompt via Shadow DOM.

**Phase 4: AI layer (BYOK, multi-provider)** (complete)
- [x] Unified interface: `generateText`, `generateJSON`, `validateKey`.
- [x] Adapters for OpenAI, Anthropic, and Gemini.
- [x] Tier-based model map (`fast`, `smart`) in `src/ai/models.ts`.
- [x] Zod validation for all JSON responses, with one retry on schema mismatch.
- [x] Normalized error types in `src/ai/types.ts`.
- [x] Settings UI: API key entry, provider selector, tier selector, key test button.
- [x] AITools dashboard page: five tabbed tools (resume review, job match, bullet improve, cover letter, interview prep).
- [x] App fully usable with no key.

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

- Should the API key be stored in `chrome.storage.local` instead of Dexie `settings` table? Current implementation uses Dexie for simplicity and testability, deviating from ADR-002 which specified `chrome.storage.local`. Both are local-only; no security difference.
- Should `csv-writer` be removed from the legacy backend? It is installed but never used.
