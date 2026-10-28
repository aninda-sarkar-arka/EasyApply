import { selectors } from './selectors';

/** Mutable selector config shape: same keys as the bundled selectors, mutable string arrays. */
export type SelectorConfig = { readonly [K in keyof typeof selectors]: readonly string[] };

let active: SelectorConfig = selectors;

export function getSelectors(): SelectorConfig { return active; }
export function setSelectors(config: SelectorConfig): void { active = config; }
/** Reset to bundled defaults. Intended for use in tests. */
export function resetSelectors(): void { active = selectors; }
