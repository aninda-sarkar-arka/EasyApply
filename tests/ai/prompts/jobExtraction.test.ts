import { describe, it, expect } from 'vitest';
import {
  buildJobExtractionPrompt,
  jobExtractionSchema,
} from '../../../src/ai/prompts/jobExtraction';

describe('buildJobExtractionPrompt', () => {
  it('includes the page text in the prompt', () => {
    const prompt = buildJobExtractionPrompt('Senior Engineer at Acme, Sydney');
    expect(prompt).toContain('Senior Engineer at Acme, Sydney');
  });

  it('requests the three required JSON keys', () => {
    const prompt = buildJobExtractionPrompt('some text');
    expect(prompt).toContain('"role"');
    expect(prompt).toContain('"company"');
    expect(prompt).toContain('"location"');
  });

  it('instructs the model to return plain JSON', () => {
    const prompt = buildJobExtractionPrompt('x');
    expect(prompt.toLowerCase()).toContain('json');
  });
});

describe('jobExtractionSchema', () => {
  it('accepts a full valid result', () => {
    const result = jobExtractionSchema.safeParse({
      role: 'Software Engineer',
      company: 'Acme Corp',
      location: 'Sydney, AU',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null for location', () => {
    const result = jobExtractionSchema.safeParse({
      role: 'SWE',
      company: 'Co',
      location: null,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.location).toBeNull();
  });

  it('rejects a missing role', () => {
    const result = jobExtractionSchema.safeParse({ company: 'Co', location: null });
    expect(result.success).toBe(false);
  });

  it('rejects a missing company', () => {
    const result = jobExtractionSchema.safeParse({ role: 'Dev', location: null });
    expect(result.success).toBe(false);
  });

  it('rejects a numeric role', () => {
    const result = jobExtractionSchema.safeParse({ role: 42, company: 'Co', location: null });
    expect(result.success).toBe(false);
  });
});
