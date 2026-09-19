import { db } from '../schema';
import type { Resume } from '../schema';

/** Fetch all resumes sorted by uploadDate descending. */
export async function getAll(): Promise<Resume[]> {
  return db.resumes.orderBy('uploadDate').reverse().toArray();
}

/** Fetch a resume by its id. Returns undefined if not found. */
export async function getById(id: number): Promise<Resume | undefined> {
  return db.resumes.get(id);
}

/** Store a new resume. Returns the created record with its id. */
export async function add(data: Omit<Resume, 'id'>): Promise<Resume> {
  const id = await db.resumes.add(data as Resume);
  return db.resumes.get(id) as Promise<Resume>;
}

/** Delete a resume by id. */
export async function remove(id: number): Promise<void> {
  await db.resumes.delete(id);
}
