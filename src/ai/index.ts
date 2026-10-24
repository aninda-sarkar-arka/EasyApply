import type { ZodSchema } from 'zod';
import type { AIConfig, AIProvider } from './types';
import { AICallError, toAIError } from './types';
import { modelFor } from './models';
import * as openai from './adapters/openai';
import * as anthropic from './adapters/anthropic';
import * as gemini from './adapters/gemini';

type Adapter = {
  generate: (prompt: string, model: string, apiKey: string) => Promise<string>;
  validateKey: (apiKey: string) => Promise<boolean>;
};

const ADAPTERS: Record<AIProvider, Adapter> = { openai, anthropic, gemini };

/** Generate free-form text using the configured provider and tier. */
export async function generateText(prompt: string, config: AIConfig): Promise<string> {
  const adapter = ADAPTERS[config.provider];
  const model = modelFor(config.provider, config.tier);
  try {
    return await adapter.generate(prompt, model, config.apiKey);
  } catch (err) {
    if (err instanceof AICallError) throw err;
    throw new AICallError(toAIError(err, config.provider));
  }
}

/**
 * Generate and parse a JSON response.
 * Appends a JSON instruction to the prompt, parses the response,
 * and validates against `schema`. Retries once if the first parse fails.
 */
export async function generateJSON<T>(
  prompt: string,
  schema: ZodSchema<T>,
  config: AIConfig,
): Promise<T> {
  const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. Do not include markdown fences.`;
  const text = await generateText(jsonPrompt, config);
  const result = tryParseAndValidate(text, schema);
  if (result.ok) return result.value;

  // Retry with explicit error feedback.
  const retryPrompt = `${jsonPrompt}\n\nYour previous response was not valid JSON or did not match the expected schema. Error: ${result.error}\n\nTry again with valid JSON.`;
  const retryText = await generateText(retryPrompt, config);
  const retryResult = tryParseAndValidate(retryText, schema);
  if (retryResult.ok) return retryResult.value;

  throw new AICallError({
    code: 'unknown',
    message: `AI returned invalid JSON after retry: ${retryResult.error}`,
    status: 500,
  });
}

/** Verify that an API key is accepted by the provider (cheap/free call). */
export async function validateKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  return ADAPTERS[provider].validateKey(apiKey);
}

function tryParseAndValidate<T>(
  text: string,
  schema: ZodSchema<T>,
): { ok: true; value: T } | { ok: false; error: string } {
  // Strip markdown fences if the model added them despite the instruction.
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, error: 'Response is not valid JSON.' };
  }
  const validation = schema.safeParse(parsed);
  if (validation.success) return { ok: true, value: validation.data };
  return { ok: false, error: validation.error.message };
}
