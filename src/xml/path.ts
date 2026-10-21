import type { NamespacePrefix } from './namespaces';
/** Append a canonical XML segment, optionally with its 1-based position.
 * @example
 * elementPath('/Invoice', 'cac', 'InvoiceLine', 2);
 */
export function elementPath(
  parent: string,
  prefix: NamespacePrefix,
  name: string,
  position?: number,
): string {
  return `${parent}/${prefix}:${name}${position === undefined ? '' : `[${String(position)}]`}`;
}
