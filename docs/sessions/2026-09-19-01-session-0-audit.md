# Session 2026-09-19-01: Session 0 codebase audit

**Phase:** Phase 0: Audit and foundation
**Goal for this session:** Full codebase audit of the legacy MERN app. Produce `ARCHITECTURE.md`, populate `ISSUES.md`, and refine the migration roadmap in `PROJECT_STATE.md`.

## Summary

This was Session 0. The `docs/` folder did not exist, so all initial files were created first. Every source file in `backend/` and `frontend/` was read. The codebase is a JavaScript MERN app with React 18 on the frontend, Express + MongoDB Atlas on the backend, and a Gemini AI integration with five career tools. Nine issues were found and logged, ranging from a critical security issue (real credentials on disk, not committed) to bugs such as two route files not mounted in `server.js`. `ARCHITECTURE.md` was written with a full current-state inventory and a target-state extension structure with a migration mapping table. `PROJECT_STATE.md` was updated with a refined six-phase roadmap.

## What was done

- Created `docs/PROJECT_STATE.md`, `docs/DECISIONS.md`, `docs/ISSUES.md`, `docs/sessions/_TEMPLATE.md` from section 9 of `CLAUDE.md`.
- Read all backend source files: `server.js`, both models, all five controllers, all six route files, `middleware/auth.js`, `config/demoData.js`, both test files, `package.json`.
- Read all frontend source files: `App.js`, all nine pages, `services/api.js`, `context/AuthContext.js`, `utils/applicationInsights.js`, `package.json`.
- Checked `.gitignore` (confirmed `backend/.env` is excluded from git).
- Checked git history (confirmed `backend/.env` was never committed).
- Wrote `docs/ARCHITECTURE.md` (Part 1: legacy current state, Part 2: extension target state with migration table).
- Populated `docs/ISSUES.md` with nine issues (ISSUE-001 through ISSUE-009).
- Updated `docs/PROJECT_STATE.md`: ticked Session 0 as done, listed next-up tasks, wrote detailed six-phase roadmap.

## Decisions made

- No new ADRs added. ADR-001 through ADR-005 were confirmed as still correct after reading the full codebase.

## Issues faced

- ISSUE-001: Real credentials in `backend/.env` (not committed but should be rotated before repo goes public).
- ISSUE-002: `routes/resumes.js` and `routes/notes.js` not mounted in `server.js`.
- ISSUE-003: Path traversal vulnerability in `resumeController.downloadResume`.
- ISSUE-004: Open CORS in `server.js`.
- ISSUE-005: JWT in `localStorage` (XSS risk).
- ISSUE-006: Hardcoded `localhost:5000` in multiple frontend files.
- ISSUE-007: Real personal email addresses and plaintext passwords in `demoData.js` (committed to git).
- ISSUE-008: Invalid Gemini model name `gemini-3-flash-preview` in `aiController.js`.
- ISSUE-009: Demo login not wired into `authController.js`.

## Not finished / carried over

- ADR-005 (extension framework) is still open. A spike session on WXT is the recommended next step.
- Legacy bug fixes (ISSUE-002, ISSUE-007, ISSUE-008) are queued as the first code tasks next session.

## Next session should start with

1. Fix ISSUE-007: replace personal email addresses in `backend/config/demoData.js` with `demo1@example.com` / `demo2@example.com`, remove plaintext password fields. Commit.
2. Fix ISSUE-008: change `gemini-3-flash-preview` to `gemini-2.0-flash` in `backend/controllers/aiController.js`. Commit.
3. Fix ISSUE-002: add the two missing `app.use(...)` lines in `backend/server.js`. Commit.
4. Decide ADR-005 (extension framework): quick spike on WXT to confirm it meets requirements.

## Commits

_(none in this session: only docs were written, awaiting user confirmation to commit)_
