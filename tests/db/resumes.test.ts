import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import * as repo from '../../src/db/repositories/resumes';

beforeEach(async () => {
  await db.resumes.clear();
});

describe('resumesRepository', () => {
  it('adds a resume and returns it with an id', async () => {
    const r = await repo.add({ filename: 'a.pdf', originalName: 'My Resume.pdf', uploadDate: new Date().toISOString() });
    expect(r.id).toBeDefined();
    expect(r.filename).toBe('a.pdf');
  });

  it('getAll returns resumes sorted by uploadDate descending', async () => {
    await repo.add({ filename: 'old.pdf', originalName: 'old', uploadDate: '2024-01-01T00:00:00.000Z' });
    await repo.add({ filename: 'new.pdf', originalName: 'new', uploadDate: '2024-06-01T00:00:00.000Z' });
    const all = await repo.getAll();
    expect(all.length).toBe(2);
    expect(all[0]!.filename).toBe('new.pdf');
  });

  it('getById returns the correct resume', async () => {
    const r = await repo.add({ filename: 'r.pdf', originalName: 'R', uploadDate: new Date().toISOString() });
    expect((await repo.getById(r.id!))?.filename).toBe('r.pdf');
  });

  it('getById returns undefined for missing id', async () => {
    expect(await repo.getById(9999)).toBeUndefined();
  });

  it('remove deletes the resume', async () => {
    const r = await repo.add({ filename: 'del.pdf', originalName: 'del', uploadDate: new Date().toISOString() });
    await repo.remove(r.id!);
    expect(await repo.getById(r.id!)).toBeUndefined();
  });
});
