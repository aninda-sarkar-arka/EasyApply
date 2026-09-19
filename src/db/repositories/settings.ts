import { db } from '../schema';

/** Retrieve a setting value by key. Returns undefined if not found. */
export async function get(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

/** Store or overwrite a setting value. */
export async function set(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

/** Remove a setting by key. */
export async function remove(key: string): Promise<void> {
  await db.settings.delete(key);
}
