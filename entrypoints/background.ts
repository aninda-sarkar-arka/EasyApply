import * as applicationsRepo from '../src/db/repositories/applications';
import type { ExtractedJob } from '../src/scrapers/linkedin/extractor';

interface EasyApplyMessage {
  type: 'EASY_APPLY_SUCCESS';
  payload: ExtractedJob;
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (message, _sender, sendResponse) => {
      if (!isEasyApplyMessage(message)) return false;

      handleEasyApplySuccess(message.payload)
        .then(() => sendResponse({ ok: true }))
        .catch((err: unknown) => sendResponse({ ok: false, error: String(err) }));

      return true; // keep message channel open for async response
    },
  );
});

async function handleEasyApplySuccess(job: ExtractedJob): Promise<void> {
  // Dedup: skip if we already have this LinkedIn job ID.
  const existing = await applicationsRepo.getByLinkedInJobId(job.linkedInJobId);
  if (existing) return;

  const now = new Date().toISOString();
  await applicationsRepo.create({
    linkedInJobId: job.linkedInJobId,
    company: job.company || 'Unknown',
    role: job.role || 'Unknown',
    jobLink: job.jobLink,
    status: 'applied',
    appliedDate: now,
    activityLog: [{ action: 'Applied via LinkedIn Easy Apply', timestamp: now }],
    interviewNotes: [],
  });
}

function isEasyApplyMessage(msg: unknown): msg is EasyApplyMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as Record<string, unknown>)['type'] === 'EASY_APPLY_SUCCESS'
  );
}
