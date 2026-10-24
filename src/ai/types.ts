export type AIProvider = 'openai' | 'anthropic' | 'gemini';
export type AITier = 'fast' | 'smart';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  tier: AITier;
}

/** Normalized error codes returned by every adapter. */
export type AIErrorCode = 'no_key' | 'invalid_key' | 'quota' | 'network' | 'unknown';

export interface AIError {
  code: AIErrorCode;
  message: string;
  status: number;
}

export class AICallError extends Error {
  readonly aiError: AIError;
  constructor(aiError: AIError) {
    super(aiError.message);
    this.name = 'AICallError';
    this.aiError = aiError;
  }
}

/** Normalize any thrown error into a consistent AIError shape. */
export function toAIError(err: unknown, provider: AIProvider): AIError {
  if (err instanceof AICallError) return err.aiError;

  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as Record<string, unknown>)['status'];

  if (/quota|rate.?limit|429/i.test(msg) || status === 429) {
    return { code: 'quota', message: `${provider} quota exceeded or rate limited.`, status: 429 };
  }
  if (/invalid.?key|api.?key|unauthorized|401|403/i.test(msg) || status === 401 || status === 403) {
    return { code: 'invalid_key', message: `${provider} API key is invalid or revoked.`, status: 401 };
  }
  if (/network|fetch|ENOTFOUND|ECONNREFUSED/i.test(msg)) {
    return { code: 'network', message: 'Network error: could not reach the AI provider.', status: 0 };
  }
  return { code: 'unknown', message: msg, status: 500 };
}
