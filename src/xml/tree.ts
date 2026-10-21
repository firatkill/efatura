import { EfaturaParseError } from '../errors';
import { xmlParser } from './fxp';

/** A namespace-resolved XML element with JSON-safe data only.
 * @example
 * const root = parseXmlTree('<Invoice/>');
 */
export interface XmlElement {
  ns: string | null;
  prefix: string | null;
  name: string;
  attrs: Readonly<Record<string, string>>;
  children: XmlElement[];
  text: string;
}
const entities: Readonly<Record<string, string>> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g, (raw: string, name: string) => {
    if (!name.startsWith('#')) return entities[name] ?? raw;
    const point = Number.parseInt(name.slice(name.startsWith('#x') ? 2 : 1), name.startsWith('#x') ? 16 : 10);
    return point === 9 ||
      point === 10 ||
      point === 13 ||
      (point >= 0x20 && point <= 0xd7ff) ||
      (point >= 0xe000 && point <= 0xfffd) ||
      (point >= 0x10000 && point <= 0x10ffff)
      ? String.fromCodePoint(point)
      : raw;
  });
}
function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Build the namespace-resolved tree iteratively, without recursion over input depth.
 * @example
 * parseXmlTree('<Invoice><ID>A</ID></Invoice>').children[0]?.text; // 'A'
 */
export function parseXmlTree(text: string): XmlElement {
  let ordered: unknown;
  try {
    ordered = xmlParser.parse(text);
  } catch (error) {
    throw new EfaturaParseError('NOT_XML', {
      line: 1,
      column: 1,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
  const roots: XmlElement[] = [];
  type Frame = {
    nodes: unknown[];
    index: number;
    scope: Map<string, string>;
    parent: XmlElement | null;
    texts: { value: string; cdata: boolean }[];
  };
  const stack: Frame[] = [{ nodes: array(ordered), index: 0, scope: new Map(), parent: null, texts: [] }];
  while (stack.length) {
    const frame = stack[stack.length - 1];
    if (!frame) break;
    if (frame.index >= frame.nodes.length) {
      if (frame.parent)
        frame.parent.text = frame.texts
          .filter((piece) => piece.cdata || piece.value.trim() !== '' || frame.parent?.children.length === 0)
          .map((piece) => piece.value)
          .join('');
      stack.pop();
      continue;
    }
    const node = record(frame.nodes[frame.index++]);
    if (!node) continue;
    if (typeof node['#text'] === 'string') {
      frame.texts.push({ value: decodeEntities(node['#text']), cdata: false });
      continue;
    }
    if ('#cdata' in node) {
      for (const chunk of array(node['#cdata'])) {
        const content = record(chunk)?.['#text'];
        if (typeof content === 'string') frame.texts.push({ value: content, cdata: true });
      }
      continue;
    }
    const name = Object.keys(node).find(
      (key) => key !== ':@' && !key.startsWith('#') && !key.startsWith('?'),
    );
    if (!name) continue;
    const scope = new Map(frame.scope);
    const attributes: [string, string][] = [];
    for (const [key, value] of Object.entries(record(node[':@']) ?? {})) {
      if (typeof value !== 'string') continue;
      const decoded = decodeEntities(value);
      if (key === 'xmlns') scope.set('', decoded);
      else if (key.startsWith('xmlns:')) scope.set(key.slice(6), decoded);
      else attributes.push([key, decoded]);
    }
    const colon = name.indexOf(':');
    const prefix = colon < 0 ? null : name.slice(0, colon);
    const namespace = scope.get(prefix ?? '');
    const element: XmlElement = {
      ns: namespace === '' ? null : (namespace ?? null),
      prefix,
      name: colon < 0 ? name : name.slice(colon + 1),
      attrs: Object.fromEntries(attributes),
      children: [],
      text: '',
    };
    if (frame.parent) frame.parent.children.push(element);
    else roots.push(element);
    stack.push({ nodes: array(node[name]), index: 0, scope, parent: element, texts: [] });
  }
  const root = roots[0];
  if (!root) throw new EfaturaParseError('NOT_XML', { line: 1, column: 1, reason: 'No root element' });
  return root;
}
