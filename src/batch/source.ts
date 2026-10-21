import type { SourceRef } from '../types';
/** Construct a virtual source label without filesystem access.
 * @example
 * sourceRef('a.zip!/b.xml', 12, 1);
 */
export function sourceRef(path: string, bytes: number, depth = 0): SourceRef {
  return { path, name: path.slice(path.lastIndexOf('/') + 1), bytes, depth };
}
