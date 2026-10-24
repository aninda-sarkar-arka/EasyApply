import { watchNavigation, watchSuccessModal } from '../../src/scrapers/linkedin/detector';
import { extractJobDetails } from '../../src/scrapers/linkedin/extractor';
import { mountSavePrompt } from '../../src/scrapers/linkedin/savePrompt';
import type { SavePromptHandle } from '../../src/scrapers/linkedin/savePrompt';

export default defineContentScript({
  matches: ['*://www.linkedin.com/jobs/*'],
  runAt: 'document_idle',

  main() {
    let stopSuccessWatcher: (() => void) | null = null;
    let activePrompt: SavePromptHandle | null = null;

    const stopNav = watchNavigation((jobId) => {
      stopSuccessWatcher?.();
      activePrompt?.remove();
      activePrompt = null;

      stopSuccessWatcher = watchSuccessModal(jobId, (id) => {
        const details = extractJobDetails(id);

        activePrompt = mountSavePrompt(
          details,
          // onSave: user confirmed, send to background to persist
          () => {
            void browser.runtime.sendMessage({
              type: 'EASY_APPLY_SUCCESS',
              payload: details,
            });
          },
          // onDismiss: user skipped, do nothing
          () => {
            activePrompt = null;
          },
        );
      });
    });

    return () => {
      stopNav();
      stopSuccessWatcher?.();
      activePrompt?.remove();
    };
  },
});
