import { AICallError, toAIError } from '../types';

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
    finishReason: string;
  }>;
}

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generate(prompt: string, model: string, apiKey: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    });
  } catch (err) {
    throw new AICallError(toAIError(err, 'gemini'));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (body['error'] as Record<string, unknown> | undefined)?.['message'] as string | undefined;
    throw new AICallError(toAIError({ message: msg ?? res.statusText, status: res.status }, 'gemini'));
  }

  const data = await res.json() as GeminiResponse;
  return data.candidates[0]?.content.parts[0]?.text ?? '';
}

/** Validate a Gemini key by listing available models. */
export async function validateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}?key=${encodeURIComponent(apiKey)}`);
    return res.ok;
  } catch {
    return false;
  }
}
