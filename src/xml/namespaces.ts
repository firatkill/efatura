import { createIssue } from '../validate/issue';
import type { NS } from '../config';
import type { XmlElement } from './tree';

/** Canonical namespace prefixes used in mapper and selector paths.
 * @example
 * const prefix: NamespacePrefix = 'cbc';
 */
export type NamespacePrefix = keyof typeof NS;
/** One tolerant namespace match, folded by expected/actual pair.
 * @example
 * const event: NamespaceEvent = { expected: NS.cbc, actual: 'none', path: '/Invoice/cbc:ID' };
 */
export type NamespaceEvent = { expected: string; actual: string; path: string };
/** Describe an unresolved or foreign namespace without losing an undeclared prefix.
 * @example
 * namespaceActual({ ns: null, prefix: null }); // 'none'
 */
export function namespaceActual(element: Pick<XmlElement, 'ns' | 'prefix'>): string {
  return element.ns ?? (element.prefix ? `prefix:${element.prefix}` : 'none');
}
/** Deduplicate namespace events in first-occurrence order.
 * @example
 * namespaceIssues([]); // []
 */
export function namespaceIssues(events: readonly NamespaceEvent[]) {
  const seen = new Set<string>();
  return events
    .filter(({ expected, actual }) => {
      const key = JSON.stringify([expected, actual]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ expected, actual, path }) => createIssue('EF009', path, { expected }, { expected, actual }));
}
