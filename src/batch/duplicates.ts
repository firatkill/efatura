import type { DuplicateTracker } from '../types';
/** Track first UUID paths and supplier/number UUIDs across calls.
 * @example
 * const tracker = createDuplicateTracker(); tracker.check('uuid', 'one.xml');
 */
export function createDuplicateTracker(): DuplicateTracker {
  const paths = new Map<string, string>();
  const numbers = new Map<string, string>();
  return {
    check(uuid, path) {
      const key = uuid.toLowerCase();
      const first = paths.get(key);
      if (first !== undefined) return first;
      paths.set(key, path);
      return null;
    },
    checkNumber(taxId, number, uuid) {
      const key = `${taxId}|${number}`,
        value = uuid.toLowerCase();
      const first = numbers.get(key);
      if (first === undefined) numbers.set(key, value);
      return first !== undefined && first !== value ? first : null;
    },
    reset() {
      paths.clear();
      numbers.clear();
    },
  };
}
