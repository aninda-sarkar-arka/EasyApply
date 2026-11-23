# Privacy Policy

**Last updated:** 2026-11-23

EasyApply is a Chrome extension that helps you track job applications on LinkedIn. This policy explains what data the extension collects, where it is stored, and what it never does.

---

## What data EasyApply handles

**Job application data**
When you save an application, EasyApply stores the job title, company name, location, LinkedIn job ID, application status, notes, and timestamps. This data is stored exclusively in your browser using IndexedDB (via the Dexie library). It never leaves your device unless you explicitly export it as a JSON file.

**AI provider API key**
If you choose to use the AI features, you paste your own API key for OpenAI, Anthropic, or Google Gemini. This key is stored in `chrome.storage.local` on your device only. It is never sent to any server operated by EasyApply.

**LinkedIn page content**
The extension reads the content of LinkedIn job pages you are already viewing in order to extract job details. It does not crawl LinkedIn, make automated requests, or read any page you have not navigated to yourself.

---

## What EasyApply does NOT do

- Collect, transmit, or store any data on a remote server operated by this project.
- Share any data with third parties.
- Track your browsing history or activity outside of LinkedIn job pages.
- Use analytics, telemetry, or crash reporting services.
- Sync data across devices (all data is local to the browser profile where the extension is installed).

---

## AI features and third-party providers

When you use an AI feature (resume review, cover letter, etc.), the relevant text is sent directly from your browser to the API endpoint of your chosen provider (OpenAI, Anthropic, or Google Gemini). This request is made using your own API key. EasyApply does not proxy, log, or inspect these requests.

The data handling of each provider is governed by their own privacy policies:
- OpenAI: https://openai.com/policies/privacy-policy
- Anthropic: https://www.anthropic.com/privacy
- Google Gemini (Generative Language API): https://policies.google.com/privacy

If you do not enter an API key, no data is ever sent to any AI provider.

---

## Data export and deletion

You can export all your data at any time as a JSON file from the Settings page. To delete all data, uninstall the extension or clear the extension's storage from `chrome://extensions`.

---

## Changes to this policy

If this policy changes materially, the updated version will be committed to this repository with a new "Last updated" date. Continued use of the extension after a change constitutes acceptance of the updated policy.

---

## Contact

If you have questions about this policy, open an issue on the [GitHub repository](https://github.com/aninda-sarkar-arka/EasyApply/issues).
