import { NS } from '../config';
import { namespaceActual } from './namespaces';
import type { NamespaceEvent, NamespacePrefix } from './namespaces';
import { elementPath } from './path';
import type { XmlElement } from './tree';
/** Mapper location and namespace-event sink.
 * @example
 * const context: QueryContext = { path: '/Invoice', events: [] };
 */
export type QueryContext = { path: string; events: NamespaceEvent[] };
/** Read direct children, preferring strict namespace matches before tolerant ones.
 * @example
 * children(root, 'cac', 'InvoiceLine');
 */
export function children(
  el: XmlElement | null,
  prefix: NamespacePrefix,
  name: string,
  context?: QueryContext,
): XmlElement[] {
  const candidates = el?.children.filter((node) => node.name === name) ?? [];
  const strict = candidates.filter((node) => node.ns === NS[prefix]);
  if (strict.length) return strict;
  for (const [index, node] of candidates.entries())
    context?.events.push({
      expected: NS[prefix],
      actual: namespaceActual(node),
      path: elementPath(context.path, prefix, name, candidates.length > 1 ? index + 1 : undefined),
    });
  return candidates;
}
/** Read the first matching direct child.
 * @example
 * child(root, 'cbc', 'ID');
 */
export function child(
  el: XmlElement | null,
  prefix: NamespacePrefix,
  name: string,
  context?: QueryContext,
): XmlElement | null {
  return children(el, prefix, name, context)[0] ?? null;
}
/** Return trimmed direct text, or null when missing/empty.
 * @example
 * text(null); // null
 */
export function text(el: XmlElement | null): string | null {
  const value = el?.text.trim();
  return value === '' ? null : (value ?? null);
}
/** Return a trimmed attribute, or null when missing/empty.
 * @example
 * attr(null, 'currencyID'); // null
 */
export function attr(el: XmlElement | null, name: string): string | null {
  const value = el?.attrs[name]?.trim();
  return value === '' ? null : (value ?? null);
}
/** Combine child selection with trimmed text.
 * @example
 * textOf(root, 'cbc', 'ID');
 */
export function textOf(
  el: XmlElement | null,
  prefix: NamespacePrefix,
  name: string,
  context?: QueryContext,
): string | null {
  return text(child(el, prefix, name, context));
}
