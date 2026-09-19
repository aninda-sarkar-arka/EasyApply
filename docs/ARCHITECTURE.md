# Architecture

## Part 1: Current state (legacy MERN)

### Overview

The legacy app is a standard MERN stack: an Express/Node.js backend serving a REST API, MongoDB for persistence, and a Create-React-App frontend. There is no extension scaffolding at all yet.

### Backend

**Entry point:** `backend/server.js`
- Express app with CORS (no origin restriction), JSON body parser, and static file serving for uploads.
- Connects to MongoDB Atlas via `MONGO_URI` in `backend/.env`.
- Mounts four routes: `/api/auth`, `/api/applications`, `/api/users`, `/api/ai`.
- NOTE: `routes/resumes.js` and `routes/notes.js` exist but are **not mounted** (bug, see ISSUE-002).

**Data models (Mongoose):**

| Model | File | Key fields |
|---|---|---|
| User | `backend/models/User.js` | email, password (bcrypt), name, profile (education, skills, experience, preferredRoles, jobLocations, resume string), resumes[] (filename, originalName, uploadDate) |
| Application | `backend/models/Application.js` | user (ref), company, role, jobLink, jobDescription, salary, status (saved/applied/interview/offer/rejected), appliedDate, deadline, interviewDate, notes, resumeVersion, linkedResume, documents[], activityLog[], interviewNotes[], aiFeedback{} |

**API routes:**

| Route | Method | Auth | Controller |
|---|---|---|---|
| `/api/auth/register` | POST | No | authController.register |
| `/api/auth/login` | POST | No | authController.login |
| `/api/applications` | GET | Yes | applicationController.getApplications |
| `/api/applications/:id` | GET | Yes | applicationController.getApplicationById |
| `/api/applications` | POST | Yes | applicationController.createApplication |
| `/api/applications/:id` | PUT | Yes | applicationController.updateApplication |
| `/api/applications/:id` | DELETE | Yes | applicationController.deleteApplication |
| `/api/applications/:id/interview-notes` | POST | Yes | applicationController.addInterviewNote |
| `/api/applications/:id/interview-notes/:noteId` | PUT/DELETE | Yes | applicationController.update/deleteInterviewNote |
| `/api/users/profile` | GET/PUT | Yes | routes/users.js inline |
| `/api/ai/health` | GET | No | aiController.health |
| `/api/ai/resume-review` | POST | Yes | aiController.resumeReview |
| `/api/ai/job-match` | POST | Yes | aiController.jobMatch |
| `/api/ai/improve-bullet` | POST | Yes | aiController.improveBullet |
| `/api/ai/cover-letter` | POST | Yes | aiController.generateCoverLetter |
| `/api/ai/interview-questions` | POST | Yes | aiController.generateInterviewQuestions |
| *(unreachable)* `/api/resumes/*` | various | Yes | resumeController (not mounted) |
| *(unreachable)* `/api/notes/*` | various | Yes | noteController (not mounted) |

**Auth:** JWT signed with `JWT_SECRET`, expiry 1 hour, sent in `x-auth-token` header, stored in `localStorage` on frontend.

**AI layer:** `backend/controllers/aiController.js`
- Uses `@google/genai` SDK with model `gemini-3-flash-preview` (suspected invalid name, see ISSUE-008).
- All prompts are inline strings in the controller. Five tools: resume review, job match, bullet improve, cover letter, interview questions.
- `parseAiError` normalizes quota errors to 429.

**File uploads:** Multer to `backend/uploads/`. Resumes stored as `{userId}_{timestamp}_{originalName}`. Max 5 MB. PDF/DOC/DOCX only. Download endpoint has a path traversal vulnerability (see ISSUE-003).

**Demo mode:** `backend/config/demoData.js` provides two hard-coded demo users and five applications. `isDemoUserId` checks prefix `demo-user-`. Demo users have plaintext passwords in the config file (see ISSUE-007). Demo login is not wired into `authController.js` (see ISSUE-009).

**Tests:** `backend/tests/auth.test.js` and `backend/tests/22101588_dashboard.test.js` (Jest + Supertest). Backend only.

### Frontend

**Entry:** `frontend/src/index.js` wraps `<App>` in `<BrowserRouter>` and `<AuthContext.Provider>`.

**Pages:**

| Page | File | Purpose |
|---|---|---|
| Dashboard | `pages/Dashboard.js` | Stats (totals, rates), bar/pie charts (Recharts), upcoming interviews, deadline alerts, recent applications |
| Applications | `pages/Applications.js` | Full application list, status filter, create/edit/delete |
| ApplicationDetail | `pages/ApplicationDetail.js` | Single application view, inline editing, interview notes, activity log, AI feedback display |
| AITools | `pages/AITools.js` | Five tabbed AI features, calls backend AI endpoints, renders markdown output (ReactMarkdown) |
| ResumeManager | `pages/ResumeManager.js` | Upload, list, download, delete resumes via backend |
| NoteManagement | `pages/NoteManagement.js` | View/manage interview notes across all applications |
| Profile | `pages/Profile.js` | User profile editing (skills, education, experience) |
| SavedJobs | `pages/SavedJobs.js` | Filtered view of saved-status applications |
| Login / Register | `pages/Login.js`, `Register.js` | Auth forms |

**Services:** `frontend/src/services/api.js`: a single Axios instance with `baseURL: http://localhost:5000/api` and an interceptor that attaches the `x-auth-token` from `localStorage`. Multiple pages also call `axios.get/post('http://localhost:5000/...')` directly, bypassing this service.

**Utilities:** `frontend/src/utils/applicationInsights.js`: pure date-math helpers for deadline alerts and interview urgency.

**State:** All state is local (`useState`/`useEffect`). Auth token in `localStorage`. No global state library.

**Dependencies:** React 18, React Router v6, Axios, Recharts, ReactMarkdown, react-datepicker, react-quill, react-dropzone.

### Known weaknesses in the legacy codebase

1. No TypeScript anywhere.
2. Hardcoded `localhost:5000` scattered across frontend (no env var).
3. Open CORS (`cors()` with no origin list).
4. JWT in `localStorage` (XSS risk; see ISSUE-005).
5. Path traversal in resume download (see ISSUE-003).
6. `routes/resumes.js` and `routes/notes.js` not mounted (see ISSUE-002).
7. AI model name may be invalid (see ISSUE-008).
8. Demo login not wired into `authController` (see ISSUE-009).
9. Real-looking personal email addresses in demo data (see ISSUE-007).
10. Real credentials in `backend/.env` (not committed but needs rotation, see ISSUE-001).

---

## Part 2: Target state (Chrome extension)

### Structure

```text
easyapply/
├── CLAUDE.md
├── README.md
├── CONTRIBUTING.md
├── docs/
├── legacy/                  # current backend/ and frontend/, untouched reference
├── src/
│   ├── entrypoints/
│   │   ├── background.ts    # service worker: message routing, storage helpers
│   │   ├── content/
│   │   │   └── linkedin.ts  # injected on linkedin.com/jobs/*
│   │   ├── popup/
│   │   │   └── Popup.tsx    # quick status and save prompt
│   │   ├── sidepanel/
│   │   │   └── SidePanel.tsx
│   │   └── dashboard/
│   │       └── Dashboard.tsx  # full extension page (chrome-extension://.../dashboard.html)
│   ├── features/
│   │   ├── applications/    # ApplicationsList, ApplicationDetail, hooks, types
│   │   ├── resumes/         # ResumeManager, pdf-to-text, hooks
│   │   ├── ai-tools/        # AITools page, hooks
│   │   └── analytics/       # Dashboard charts, insights
│   ├── ai/
│   │   ├── types.ts         # AIRequest, AIResponse, AIError, provider union
│   │   ├── models.ts        # tier-to-model map per provider
│   │   ├── index.ts         # generateText, generateJSON, validateKey
│   │   └── adapters/
│   │       ├── openai.ts
│   │       ├── anthropic.ts
│   │       └── gemini.ts    # port of aiController prompts
│   ├── db/
│   │   ├── schema.ts        # Dexie database class, version history
│   │   ├── migrations.ts    # upgrade callbacks
│   │   └── repositories/
│   │       ├── applications.ts
│   │       ├── resumes.ts
│   │       └── settings.ts
│   ├── scrapers/
│   │   └── linkedin/
│   │       ├── selectors.ts   # fallback-chain config object
│   │       ├── detector.ts    # SPA nav listener, Easy Apply success modal
│   │       └── extractor.ts   # field extraction from DOM + AI fallback
│   ├── components/          # Button, Badge, Spinner, Modal, etc.
│   └── lib/
│       ├── date.ts          # port of applicationInsights.js
│       └── pdf.ts           # pdf.js wrapper for local text extraction
├── tests/
│   └── fixtures/
│       └── linkedin/        # anonymized HTML snapshots
└── public/
    └── icons/
```

### Migration mapping table

| Legacy piece | Becomes in extension |
|---|---|
| `backend/models/Application.js` | Dexie table `applications` in `src/db/schema.ts` |
| `backend/models/User.js` (profile, resumes) | Dexie tables `resumes`, `settings` in `src/db/schema.ts` |
| `backend/controllers/applicationController.js` | `src/db/repositories/applications.ts` |
| `backend/controllers/resumeController.js` | `src/db/repositories/resumes.ts` + `src/lib/pdf.ts` |
| `backend/controllers/noteController.js` | Interview notes embedded in applications table, via `applicationsRepository` |
| `backend/controllers/authController.js` | Removed: no auth needed (local-first, ADR-001) |
| `backend/middleware/auth.js` | Removed |
| `backend/controllers/aiController.js` (callGemini) | `src/ai/adapters/gemini.ts` |
| `backend/controllers/aiController.js` (prompts) | `src/ai/prompts/` (one file per tool) |
| `backend/config/demoData.js` | Replaced by JSON import/export and seeded fixture data in tests |
| `backend/server.js` | Removed |
| `frontend/src/pages/Dashboard.js` | `src/features/analytics/` + `src/entrypoints/dashboard/Dashboard.tsx` |
| `frontend/src/pages/Applications.js` | `src/features/applications/ApplicationsList.tsx` |
| `frontend/src/pages/ApplicationDetail.js` | `src/features/applications/ApplicationDetail.tsx` |
| `frontend/src/pages/AITools.js` | `src/features/ai-tools/AITools.tsx` |
| `frontend/src/pages/ResumeManager.js` | `src/features/resumes/ResumeManager.tsx` |
| `frontend/src/pages/NoteManagement.js` | `src/features/applications/NoteManagement.tsx` |
| `frontend/src/pages/Profile.js` | `src/features/settings/Settings.tsx` (BYOK + profile) |
| `frontend/src/utils/applicationInsights.js` | `src/lib/date.ts` (TypeScript port, same logic) |
| `frontend/src/services/api.js` | Removed (all data is local) |
| `frontend/src/context/AuthContext.js` | Removed |

### Key architecture decisions

- ADR-001: No backend. Dexie (IndexedDB) inside the extension origin.
- ADR-002: BYOK multi-provider AI. Keys in `chrome.storage.local` only.
- ADR-003: Detect Easy Apply success modal, not button clicks.
- ADR-004: Passive scraping, LinkedIn job ID as primary key, selector fallback chains.
- ADR-005: WXT as extension framework (leading candidate, decision pending).
