import { db } from '../schema';
import type { Application, InterviewNote } from '../schema';

/** Fetch all applications sorted by appliedDate descending. */
export async function getAll(): Promise<Application[]> {
  return db.applications.orderBy('appliedDate').reverse().toArray();
}

/** Fetch a single application by its Dexie id. Returns undefined if not found. */
export async function getById(id: number): Promise<Application | undefined> {
  return db.applications.get(id);
}

/** Fetch an application by its LinkedIn job ID. Returns undefined if not found. */
export async function getByLinkedInJobId(linkedInJobId: string): Promise<Application | undefined> {
  return db.applications.where('linkedInJobId').equals(linkedInJobId).first();
}

/** Create a new application. Returns the created record with its id. */
export async function create(data: Omit<Application, 'id'>): Promise<Application> {
  const id = await db.applications.add(data as Application);
  return db.applications.get(id) as Promise<Application>;
}

/** Update an existing application by id. Returns the updated record. */
export async function update(id: number, changes: Partial<Omit<Application, 'id'>>): Promise<Application> {
  await db.applications.update(id, changes);
  return db.applications.get(id) as Promise<Application>;
}

/** Delete an application by id. */
export async function remove(id: number): Promise<void> {
  await db.applications.delete(id);
}

/** Add an interview note to an application. Returns the updated record. */
export async function addInterviewNote(id: number, note: Omit<InterviewNote, 'id' | 'date'>): Promise<Application> {
  const app = await db.applications.get(id);
  if (!app) throw new Error(`Application ${id} not found`);
  const newNote: InterviewNote = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    question: note.question,
    answer: note.answer,
    feedback: note.feedback,
  };
  const updatedNotes = [...app.interviewNotes, newNote];
  await db.applications.update(id, { interviewNotes: updatedNotes });
  return db.applications.get(id) as Promise<Application>;
}

/** Update an existing interview note by its string id. Returns the updated record. */
export async function updateInterviewNote(appId: number, noteId: string, changes: Partial<Omit<InterviewNote, 'id' | 'date'>>): Promise<Application> {
  const app = await db.applications.get(appId);
  if (!app) throw new Error(`Application ${appId} not found`);
  const updatedNotes = app.interviewNotes.map((n) =>
    n.id === noteId ? { ...n, ...changes } : n,
  );
  await db.applications.update(appId, { interviewNotes: updatedNotes });
  return db.applications.get(appId) as Promise<Application>;
}

/** Remove an interview note by its string id. Returns the updated record. */
export async function removeInterviewNote(appId: number, noteId: string): Promise<Application> {
  const app = await db.applications.get(appId);
  if (!app) throw new Error(`Application ${appId} not found`);
  const updatedNotes = app.interviewNotes.filter((n) => n.id !== noteId);
  await db.applications.update(appId, { interviewNotes: updatedNotes });
  return db.applications.get(appId) as Promise<Application>;
}
