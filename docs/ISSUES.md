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

### ISSUE-001: Real credentials in backend/.env
- **Status:** Open
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `backend/.env` contains a live MongoDB Atlas URI with username and password, a JWT secret, and a Gemini API key. The file is correctly excluded by `.gitignore` and is NOT tracked in git, but the credentials are in plaintext on disk.
- **Cause:** Developer convenience during development.
- **Fix:** Rotate the MongoDB Atlas password, generate a new JWT secret, and revoke/regenerate the Gemini API key before any collaborator accesses the machine or the repo goes public. Then update `backend/.env`.
- **Lesson:** Use a secrets manager or at minimum document that `.env` must be rotated before repo goes public.

### ISSUE-004: Open CORS configuration
- **Status:** Open (won't fix in legacy)
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `backend/server.js` calls `app.use(cors())` with no `origin` option, accepting requests from any origin.
- **Cause:** Not configured.
- **Fix:** Moot once backend is removed. If the legacy backend is run publicly, restrict to `{ origin: 'http://localhost:3000' }`.

### ISSUE-005: JWT stored in localStorage (XSS risk)
- **Status:** Open (won't fix in legacy)
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `frontend/src/services/api.js` reads the JWT from `localStorage`. Any XSS in the React app could steal the token.
- **Cause:** Standard CRA pattern.
- **Fix:** Moot in the extension (no JWT at all, ADR-001).

### ISSUE-006: Hardcoded localhost:5000 in frontend pages
- **Status:** Open (won't fix in legacy)
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `frontend/src/pages/Dashboard.js` and `pages/AITools.js` hardcode `http://localhost:5000/` instead of using the `api.js` service.
- **Cause:** Inconsistency between pages.
- **Fix:** Moot once backend is removed.

## Resolved

### ISSUE-002: resumes and notes routes not mounted in server.js
- **Status:** Resolved
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `backend/routes/resumes.js` and `backend/routes/notes.js` existed with complete controllers but were never mounted in `server.js`. All resume and note endpoints returned 404.
- **Cause:** Routes were written but `app.use(...)` lines were never added.
- **Fix:** Added `app.use('/api/resumes', require('./routes/resumes'))` and `app.use('/api/notes', require('./routes/notes'))` to `backend/server.js`.

### ISSUE-003: Path traversal in resume download endpoint
- **Status:** Resolved
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `backend/controllers/resumeController.js` passed `req.params.filename` directly to `path.join`, allowing traversal to files outside the uploads directory.
- **Cause:** Missing input sanitization.
- **Fix:** Added `path.basename(req.params.filename)` before constructing the file path in `downloadResume`.

### ISSUE-007: Personal emails and plaintext passwords in demoData.js
- **Status:** Resolved
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** `backend/config/demoData.js` contained real-looking personal email addresses and plaintext passwords committed to git.
- **Cause:** Developer used personal addresses for demo data during development.
- **Fix:** Replaced with `demo1@example.com` / `demo2@example.com`, renamed users to Alex Demo / Sam Demo, removed plaintext password fields.

### ISSUE-008: Invalid Gemini model name in aiController.js
- **Status:** Resolved
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** Model name `gemini-3-flash-preview` does not exist; all AI calls failed at runtime.
- **Cause:** Speculative or typo'd model name.
- **Fix:** Changed to `gemini-2.0-flash` in `backend/controllers/aiController.js`.

### ISSUE-009: Demo login not wired into authController
- **Status:** Resolved
- **Found:** 2026-09-19, [Session 0](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** legacy
- **Symptom:** Demo users in `demoData.js` could not log in because `authController.js` never checked for them.
- **Cause:** Feature started but not completed.
- **Fix:** Added `findDemoUserByEmail` check in the login handler before the database query. Signs a JWT directly with the demo user's string id.

### ISSUE-010: Tests required live MongoDB Atlas; failed offline
- **Status:** Resolved
- **Found:** 2026-09-19, [Session 0 loop](sessions/2026-09-19-01-session-0-audit.md)
- **Area:** build
- **Symptom:** Both backend test suites failed with `querySrv ENOTFOUND` because they connected to the Atlas cluster URI from `.env`.
- **Cause:** Tests loaded `dotenv` and used `MONGO_URI` directly with no offline fallback.
- **Fix:** Installed `mongodb-memory-server` as a dev dependency. Rewrote both test files to use `MongoMemoryServer.create()` in `beforeAll`. Added `backend/jest.config.js` with `setupFiles: ['./tests/setup.js']` to inject a test `JWT_SECRET` without touching `.env`. All 15 tests now pass offline.
