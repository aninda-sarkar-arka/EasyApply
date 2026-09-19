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
