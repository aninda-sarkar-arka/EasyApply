import type { AIProvider, AITier } from './types';

export const MODELS: Record<AIProvider, Record<AITier, string>> = {
  openai: {
    fast: 'gpt-4o-mini',
    smart: 'gpt-4o',
  },
  anthropic: {
    fast: 'claude-haiku-4-5-20251001',
    smart: 'claude-sonnet-4-6',
  },
  gemini: {
    fast: 'gemini-2.0-flash',
    smart: 'gemini-2.0-flash',
  },
};

export function modelFor(provider: AIProvider, tier: AITier): string {
  return MODELS[provider][tier];
}
