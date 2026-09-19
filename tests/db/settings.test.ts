import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import * as repo from '../../src/db/repositories/settings';

beforeEach(async () => {
  await db.settings.clear();
});

describe('settingsRepository', () => {
  it('set and get a value', async () => {
    await repo.set('apiProvider', 'gemini');
    expect(await repo.get('apiProvider')).toBe('gemini');
  });

  it('get returns undefined for missing key', async () => {
    expect(await repo.get('nonexistent')).toBeUndefined();
  });

  it('set overwrites an existing value', async () => {
    await repo.set('key', 'first');
    await repo.set('key', 'second');
    expect(await repo.get('key')).toBe('second');
  });

  it('remove deletes a key', async () => {
    await repo.set('temp', 'value');
    await repo.remove('temp');
    expect(await repo.get('temp')).toBeUndefined();
  });

  it('remove on nonexistent key does not throw', async () => {
    await expect(repo.remove('ghost')).resolves.toBeUndefined();
  });
});
