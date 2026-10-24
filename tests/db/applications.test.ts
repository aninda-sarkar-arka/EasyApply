import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import * as repo from '../../src/db/repositories/applications';
import type { Application } from '../../src/db/schema';

const baseApp = (): Omit<Application, 'id'> => ({
  company: 'Acme Corp',
  role: 'Engineer',
  status: 'applied',
  appliedDate: new Date().toISOString(),
  activityLog: [{ action: 'created', timestamp: new Date().toISOString() }],
  interviewNotes: [],
});

beforeEach(async () => {
  await db.applications.clear();
});

describe('applicationsRepository', () => {
  it('creates an application and returns it with an id', async () => {
    const app = await repo.create(baseApp());
    expect(app.id).toBeDefined();
    expect(app.company).toBe('Acme Corp');
  });

  it('getAll returns applications sorted by appliedDate descending', async () => {
    await repo.create({ ...baseApp(), appliedDate: '2025-01-01T00:00:00.000Z' });
    await repo.create({ ...baseApp(), appliedDate: '2025-06-01T00:00:00.000Z' });
    const all = await repo.getAll();
    expect(all.length).toBe(2);
    expect(all[0]!.appliedDate > all[1]!.appliedDate).toBe(true);
  });

  it('getById returns the correct application', async () => {
    const created = await repo.create(baseApp());
    const found = await repo.getById(created.id!);
    expect(found?.company).toBe('Acme Corp');
  });

  it('getById returns undefined for missing id', async () => {
    expect(await repo.getById(9999)).toBeUndefined();
  });

  it('getByLinkedInJobId finds by job id', async () => {
    await repo.create({ ...baseApp(), linkedInJobId: 'li-123' });
    const found = await repo.getByLinkedInJobId('li-123');
    expect(found?.linkedInJobId).toBe('li-123');
  });

  it('update modifies fields', async () => {
    const created = await repo.create(baseApp());
    const updated = await repo.update(created.id!, { status: 'interview' });
    expect(updated.status).toBe('interview');
  });

  it('remove deletes the application', async () => {
    const created = await repo.create(baseApp());
    await repo.remove(created.id!);
    expect(await repo.getById(created.id!)).toBeUndefined();
  });

  it('addInterviewNote appends a note with generated id and date', async () => {
    const app = await repo.create(baseApp());
    const updated = await repo.addInterviewNote(app.id!, {
      question: 'What is TypeScript?',
      answer: 'A typed superset of JS.',
      feedback: 'Good.',
    });
    expect(updated.interviewNotes.length).toBe(1);
    expect(updated.interviewNotes[0]!.id).toBeDefined();
    expect(updated.interviewNotes[0]!.question).toBe('What is TypeScript?');
  });

  it('updateInterviewNote modifies an existing note', async () => {
    const app = await repo.create(baseApp());
    const withNote = await repo.addInterviewNote(app.id!, {
      question: 'Q1', answer: 'A1', feedback: '',
    });
    const noteId = withNote.interviewNotes[0]!.id;
    const updated = await repo.updateInterviewNote(app.id!, noteId, { answer: 'Updated' });
    expect(updated.interviewNotes[0]!.answer).toBe('Updated');
  });

  it('removeInterviewNote removes a note by id', async () => {
    const app = await repo.create(baseApp());
    const withNote = await repo.addInterviewNote(app.id!, {
      question: 'Q', answer: 'A', feedback: '',
    });
    const noteId = withNote.interviewNotes[0]!.id;
    const updated = await repo.removeInterviewNote(app.id!, noteId);
    expect(updated.interviewNotes.length).toBe(0);
  });
});
