import { AICallError, toAIError } from '../types';

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

export async function generate(prompt: string, model: string, apiKey: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (err) {
    throw new AICallError(toAIError(err, 'anthropic'));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (body['error'] as Record<string, unknown> | undefined)?.['message'] as string | undefined;
    throw new AICallError(toAIError({ message: msg ?? res.statusText, status: res.status }, 'anthropic'));
  }

  const data = await res.json() as AnthropicResponse;
  const textBlock = data.content.find((c) => c.type === 'text');
  return textBlock?.text ?? '';
}

/** Validate an Anthropic key with a minimal 1-token message. */
export async function validateKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    return res.ok || res.status === 400; // 400 = bad request but key is valid
  } catch {
    return false;
  }
}
