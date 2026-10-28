import {
  watchNavigation,
  watchAnyApplyClick,
} from '../src/scrapers/linkedin/detector';
import { extractJobDetailsWithFallback } from '../src/scrapers/linkedin/extractor';
import { loadCachedSelectors } from '../src/scrapers/linkedin/remoteSelectors';
import { mountSavePrompt } from '../src/scrapers/linkedin/savePrompt';
import type { SavePromptHandle } from '../src/scrapers/linkedin/savePrompt';
import * as settingsRepo from '../src/db/repositories/settings';
import type { AIConfig, AIProvider, AITier } from '../src/ai/types';

// Hydrate cached selectors as early as possible, before any navigation event.
void loadCachedSelectors();

async function getAIConfig(): Promise<AIConfig | undefined> {
  const [provider, apiKey, tier] = await Promise.all([
    settingsRepo.get('ai.provider'),
    settingsRepo.get('ai.apiKey'),
    settingsRepo.get('ai.tier'),
  ]);
  if (!provider || !apiKey) return undefined;
  return {
    provider: provider as AIProvider,
    apiKey,
    tier: (tier ?? 'fast') as AITier,
  };
}

export default defineContentScript({
  matches: ['*://www.linkedin.com/jobs/*'],
  runAt: 'document_idle',

  main() {
    let stopApplyWatcher: (() => void) | null = null;
    let activePrompt: SavePromptHandle | null = null;

    async function showPrompt(jobId: string) {
      activePrompt?.remove();
      const config = await getAIConfig();
      const details = await extractJobDetailsWithFallback(jobId, config);
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
      stopApplyWatcher?.();
      activePrompt?.remove();
      activePrompt = null;

      stopApplyWatcher = watchAnyApplyClick(jobId, (id) => void showPrompt(id));
    });

    return () => {
      stopNav();
      stopApplyWatcher?.();
      activePrompt?.remove();
    };
  },
});
