// Global Vitest setup: runs before every test file.
// fake-indexeddb replaces window.indexedDB so Dexie works in jsdom.
import 'fake-indexeddb/auto';
