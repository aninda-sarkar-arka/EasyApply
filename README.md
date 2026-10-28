<p align="center">
  <img src="assets/logo.png" alt="EasyApply Logo" width="180" />
</p>

<h1 align="center">EasyApply</h1>

<p align="center">
  A Chrome extension that automatically tracks LinkedIn job applications and gives you AI-powered career tools — all without ever sending your data to a server.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/Tests-119%20passing-brightgreen" alt="Tests" />
</p>

---

## What it does

EasyApply sits in your Chrome browser and watches for LinkedIn job applications. When you submit an Easy Apply or click an external Apply button, it asks if you want to save that application. Everything is stored locally in your browser using IndexedDB — no account required, no data ever leaves your machine unless you choose to use an AI feature.

The built-in AI tools (resume review, job match, cover letter, etc.) use **your own API key** for OpenAI, Anthropic, or Gemini. You paste the key once into the extension settings; it stays in `chrome.storage.local` and is never sent to any server we run.

---

## Features

**Automatic application tracking**
- Detects LinkedIn Easy Apply submissions via a DOM MutationObserver on the success modal
- Detects external Apply button clicks and prompts for confirmation
- Deduplicates by LinkedIn job ID so the same posting is never saved twice
- Save prompt rendered in an isolated Shadow DOM to avoid LinkedIn CSS conflicts

**Dashboard**
- Application pipeline with status workflow (Applied, Phone Screen, Interview, Offer, Rejected)
- Stats overview and trend charts (Recharts)
- Per-application detail page with notes, timeline, and stage history
- Saved jobs list and a dedicated notes manager
- Full JSON export and import

**AI career tools (bring your own key)**
- Resume review with structured feedback
- Job-to-resume match score and gap analysis
- Bullet point optimizer
- Cover letter generator
- Interview question generator
- Provider choice: OpenAI, Anthropic, or Google Gemini
- Model tier selector: `fast` (cost-efficient) or `smart` (best quality)
- All JSON responses validated with Zod; one automatic retry on schema mismatch

**Privacy by design**
- Zero backend. All data lives in the browser (Dexie / IndexedDB).
- API keys stored in `chrome.storage.local` only, never synced or logged.
- Scraping is passive: only reads pages you are already viewing.

---

## Tech stack

| Layer | Choice |
|---|---|
| Extension framework | [WXT](https://wxt.dev) (Manifest V3, hot reload) |
| Language | TypeScript 5 (`strict: true`) |
| UI | React 18, React Router 6, Recharts |
| Local database | Dexie 4 (IndexedDB) |
| AI providers | OpenAI, Anthropic, Google Gemini (unified adapter interface) |
| Schema validation | Zod |
| Tests | Vitest, fake-indexeddb |
| Lint / format | ESLint, Prettier |

---

## Project structure

```
easyapply/
├── entrypoints/
│   ├── background.ts          # Service worker: message routing, dedup, save logic
│   ├── linkedin.content.ts    # Content script: SPA nav, scraping, save prompt
│   ├── popup/                 # Extension popup (quick status)
│   └── dashboard/             # Full dashboard page (React SPA)
├── src/
│   ├── ai/
│   │   ├── adapters/          # openai.ts, anthropic.ts, gemini.ts
│   │   ├── prompts/           # One file per AI feature
│   │   ├── types.ts           # Shared AI types and error types
│   │   ├── models.ts          # Tier-to-model-ID map per provider
│   │   └── index.ts           # generateText, generateJSON, validateKey
│   ├── db/
│   │   ├── schema.ts          # Dexie schema and migrations
│   │   └── repositories/      # applications, resumes, settings
│   ├── scrapers/
│   │   └── linkedin/          # detector, extractor, savePrompt, selectors
│   └── lib/                   # insights.ts, export.ts (pure helpers)
├── tests/
│   └── fixtures/              # Anonymized HTML snapshots for scraper tests
└── docs/                      # Architecture, decisions, session logs
```

---

## Getting started (development)

### Prerequisites

- Node.js 18+
- Google Chrome

### Install and run

```bash
git clone https://github.com/aninda-sarkar-arka/EasyApply.git
cd EasyApply
npm install
npm run dev
```

WXT will build the extension and write it to `.output/chrome-mv3-dev/`.

**Load into Chrome:**
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `.output/chrome-mv3-dev/`

The extension hot-reloads on file save during `npm run dev`.

### Other commands

```bash
npm run build        # Production build
npm run typecheck    # TypeScript check (no emit)
npm run lint         # ESLint
npm test             # Vitest (119 tests)
```

---

## Configuring AI tools

1. Open the extension popup and go to **Settings**.
2. Choose a provider (OpenAI, Anthropic, or Gemini).
3. Paste your API key and click **Test Key**.
4. Select a model tier (`fast` or `smart`).

The AI tools tab in the dashboard becomes active once a key is saved. The rest of the extension works without any key.

---

## Contributing

Issues and pull requests are welcome. Before opening a large PR, please file an issue to discuss the approach.

The `docs/` folder has the architecture decision records, known issues log, and per-session change logs if you want to understand the design choices.

---

## License

MIT
