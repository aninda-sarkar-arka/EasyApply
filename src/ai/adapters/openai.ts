import { AICallError, toAIError } from '../types';

interface OpenAIMessage { role: 'user' | 'assistant' | 'system'; content: string; }

interface OpenAIResponse {
  choices: Array<{ message: { content: string | null } }>;
}

export async function generate(prompt: string, model: string, apiKey: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }] satisfies OpenAIMessage[],
        max_tokens: 2048,
      }),
    });
  } catch (err) {
    throw new AICallError(toAIError(err, 'openai'));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (body['error'] as Record<string, unknown> | undefined)?.['message'] as string | undefined;
    throw new AICallError(toAIError({ message: msg ?? res.statusText, status: res.status }, 'openai'));
  }

  const data = await res.json() as OpenAIResponse;
  return data.choices[0]?.message?.content ?? '';
}

/** Validate an OpenAI API key by listing models (cheap, no token cost). */
export async function validateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
