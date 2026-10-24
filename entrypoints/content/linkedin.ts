import { watchNavigation, watchSuccessModal } from '../../src/scrapers/linkedin/detector';
import { extractJobDetails } from '../../src/scrapers/linkedin/extractor';

export default defineContentScript({
  matches: ['*://www.linkedin.com/jobs/*'],
  runAt: 'document_idle',

  main() {
    let stopSuccessWatcher: (() => void) | null = null;

    const stopNav = watchNavigation((jobId) => {
      // Stop watching the previous job's success modal before watching the new one.
      stopSuccessWatcher?.();

      stopSuccessWatcher = watchSuccessModal(jobId, (id) => {
        const details = extractJobDetails(id);
        void browser.runtime.sendMessage({
          type: 'EASY_APPLY_SUCCESS',
          payload: details,
        });
      });
    });

    // Return cleanup so WXT can tear down the script on HMR.
    return () => {
      stopNav();
      stopSuccessWatcher?.();
    };
  },
});
