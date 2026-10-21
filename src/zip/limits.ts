import { efaturaConfig } from '@firatkill/efatura';
import type { ZipLimits } from '../types';
/** Merge positive finite limits without mutating shared defaults.
 * @example
 * mergeLimits({maxEntries: 3}).maxEntries; // 3
 */
export function mergeLimits(overrides: Partial<ZipLimits> = {}): ZipLimits {
  const limits = { ...efaturaConfig.zipLimits, ...overrides };
  for (const key of Object.keys(efaturaConfig.zipLimits) as (keyof ZipLimits)[]) {
    const value = limits[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
      throw new TypeError(`Invalid ZIP limit: ${key}`);
  }
  return limits;
}
