import { describe, it, expect, afterEach } from 'vitest';
import { getSelectors, setSelectors, resetSelectors } from '../../src/scrapers/linkedin/selectorStore';
import { selectors } from '../../src/scrapers/linkedin/selectors';
import type { SelectorConfig } from '../../src/scrapers/linkedin/selectorStore';

afterEach(() => {
  resetSelectors();
});

describe('getSelectors', () => {
  it('returns the bundled defaults initially', () => {
    const s = getSelectors();
    expect(s.jobTitle).toEqual(selectors.jobTitle);
    expect(s.company).toEqual(selectors.company);
  });
});

describe('setSelectors', () => {
  it('replaces the active config', () => {
    const custom: SelectorConfig = {
      jobTitle: ['.custom-title'],
      company: ['.custom-company'],
      location: ['.custom-location'],
      easyApplyButton: ['button.custom-easy'],
      externalApplyButton: ['button.custom-ext'],
      successModal: ['.custom-modal'],
      successModalText: ['Custom success text'],
    };
    setSelectors(custom);
    expect(getSelectors().jobTitle).toEqual(['.custom-title']);
    expect(getSelectors().company).toEqual(['.custom-company']);
  });

  it('overwrites a previous setSelectors call', () => {
    const first: SelectorConfig = { ...selectors, jobTitle: ['.first'] };
    const second: SelectorConfig = { ...selectors, jobTitle: ['.second'] };
    setSelectors(first);
    setSelectors(second);
    expect(getSelectors().jobTitle).toEqual(['.second']);
  });
});

describe('resetSelectors', () => {
  it('restores bundled defaults after a setSelectors call', () => {
    setSelectors({ ...selectors, jobTitle: ['.override'] });
    resetSelectors();
    expect(getSelectors().jobTitle).toEqual(selectors.jobTitle);
  });
});
