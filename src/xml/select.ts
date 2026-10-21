import { NS } from '../config';
import { text } from './query';
import type { NamespacePrefix } from './namespaces';
import type { XmlElement } from './tree';

type Segment = { prefix: NamespacePrefix | '*'; name: string; position: number | null };
function segments(path: string): Segment[] {
  const relative = path.startsWith('/Invoice/') ? path.slice('/Invoice/'.length) : path;
  return relative.split('/').map((part) => {
    const match = /^(cbc|cac|ext|inv|ds|xades|\*):([A-Za-z_][A-Za-z0-9_.-]*)(?:\[([1-9]\d*)\])?$/.exec(part);
    if (!match) throw new TypeError(`Invalid XML path: ${path}`);
    const prefix = match[1] as NamespacePrefix | '*';
    const name = match[2];
    const position = match[3] === undefined ? null : Number(match[3]);
    if (name === undefined || (position !== null && !Number.isSafeInteger(position)))
      throw new TypeError(`Invalid XML path: ${path}`);
    return { prefix, name, position };
  });
}
/** Select all matching elements with canonical namespace prefixes and 1-based indexes.
 * @example
 * selectAll(root, 'cac:InvoiceLine');
 */
export function selectAll(root: XmlElement | null, path: string): XmlElement[] {
  const parsed = segments(path);
  let nodes = root ? [root] : [];
  for (const { prefix, name, position } of parsed) {
    nodes = nodes.flatMap((node) => {
      const matches = node.children.filter(
        (candidate) => candidate.name === name && (prefix === '*' || candidate.ns === NS[prefix]),
      );
      const indexed = position === null ? undefined : matches[position - 1];
      return position === null ? matches : indexed ? [indexed] : [];
    });
  }
  return nodes;
}
/** Select the first matching element or null.
 * @example
 * select(root, 'cbc:ID');
 */
export function select(root: XmlElement | null, path: string): XmlElement | null {
  return selectAll(root, path)[0] ?? null;
}
/** Select trimmed text, returning null for absent/empty elements.
 * @example
 * selectText(root, 'cbc:ID');
 */
export function selectText(root: XmlElement | null, path: string): string | null {
  return text(select(root, path));
}
