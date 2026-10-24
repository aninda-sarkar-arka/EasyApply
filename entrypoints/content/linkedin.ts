import {
  watchNavigation,
  watchSuccessModal,
  watchExternalApply,
  isEasyApplyJob,
} from '../../src/scrapers/linkedin/detector';
import { extractJobDetails } from '../../src/scrapers/linkedin/extractor';
import { mountSavePrompt } from '../../src/scrapers/linkedin/savePrompt';
import type { SavePromptHandle } from '../../src/scrapers/linkedin/savePrompt';

export default defineContentScript({
  matches: ['*://www.linkedin.com/jobs/*'],
  runAt: 'document_idle',

  main() {
    let stopSuccessWatcher: (() => void) | null = null;
    let stopApplyWatcher: (() => void) | null = null;
    let activePrompt: SavePromptHandle | null = null;

    function showPrompt(jobId: string) {
      activePrompt?.remove();
      const details = extractJobDetails(jobId);
      activePrompt = mountSavePrompt(
        details,
        () => {
          void browser.runtime.sendMessage({ type: 'EASY_APPLY_SUCCESS', payload: details });
        },
        () => {
          activePrompt = null;
        },
      );
    }

    const stopNav = watchNavigation((jobId) => {
      stopSuccessWatcher?.();
      stopApplyWatcher?.();
      activePrompt?.remove();
      activePrompt = null;

      if (isEasyApplyJob()) {
        // Easy Apply: wait for the submission success modal.
        stopSuccessWatcher = watchSuccessModal(jobId, showPrompt);
      } else {
        // External Apply: prompt as soon as the user clicks the Apply button.
        stopApplyWatcher = watchExternalApply(jobId, showPrompt);
      }
    });

    return () => {
      stopNav();
      stopSuccessWatcher?.();
      stopApplyWatcher?.();
      activePrompt?.remove();
    };
  },
});
