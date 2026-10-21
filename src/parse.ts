import { KNOWN_ISSUE_CODES, NS } from './config';
import { UNIT_CODES } from './codes';
import * as decimal from './decimal/operations';
import { EfaturaParseError } from './errors';
import { createContext } from './model/context';
import { mapInvoice } from './model/invoice';
import { decodeInput } from './xml/decode';
import { guardXml } from './xml/guard';
import { parseXmlTree } from './xml/tree';
import { namespaceActual, namespaceIssues } from './xml/namespaces';
import type { Issue, ParseOptions, ParseResult, XmlInput } from './types';

function optionsCheck(input: unknown): void {
  if (input === null || typeof input !== 'object' || Array.isArray(input))
    throw new TypeError('Invalid parse options');
  const options = input as Record<string, unknown>;
  for (const key of ['validate', 'includeRaw'])
    if (options[key] !== undefined && typeof options[key] !== 'boolean')
      throw new TypeError(`Invalid ${key}`);
  const attachments = options['attachments'];
  if (attachments !== undefined && attachments !== 'data' && attachments !== 'metadata')
    throw new TypeError('Invalid attachments option');
  const maxBytes = options['maxBytes'];
  if (maxBytes !== undefined && (typeof maxBytes !== 'number' || !Number.isFinite(maxBytes) || maxBytes <= 0))
    throw new TypeError('Invalid maxBytes');
  const tolerance = options['tolerance'];
  if (
    tolerance !== undefined &&
    (typeof tolerance !== 'string' || !decimal.isDecimal(tolerance) || decimal.cmp(tolerance, '0') < 0)
  )
    throw new TypeError('Invalid tolerance');
  const rules = options['rules'];
  if (rules !== undefined) {
    if (rules === null || typeof rules !== 'object' || Array.isArray(rules))
      throw new TypeError('Invalid rules');
    for (const [key, value] of Object.entries(rules as Record<string, unknown>))
      if (
        !KNOWN_ISSUE_CODES.some((code) => code === key) ||
        typeof value !== 'string' ||
        !['error', 'warning', 'info', 'off'].includes(value)
      )
        throw new TypeError(`Invalid rule ${key}`);
  }
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
function finish(issues: Issue[], options: ParseOptions): Issue[] {
  const seen = new Set<string>();
  const severity = { error: 0, warning: 1, info: 2 };
  return issues
    .filter((issue) => {
      const key = JSON.stringify([issue.code, issue.path, issue.message]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        severity[a.severity] - severity[b.severity] || compare(a.path, b.path) || compare(a.code, b.code),
    )
    .flatMap((issue) => {
      const override = options.rules?.[issue.code];
      return override === 'off' ? [] : [{ ...issue, severity: override ?? issue.severity }];
    });
}
/** Parse a Turkish UBL invoice into exact, JSON-safe model data and diagnostics.
 * @example
 * const { invoice, issues } = parseInvoice(xml, { includeRaw: false });
 */
export function parseInvoice(input: XmlInput, options: ParseOptions = {}): ParseResult {
  optionsCheck(options);
  const decoded = decodeInput(input, options.maxBytes);
  guardXml(decoded.text);
  const root = parseXmlTree(decoded.text);
  if (root.name !== 'Invoice')
    throw new EfaturaParseError('NOT_INVOICE', {
      root: root.name,
      namespace: namespaceActual(root),
      ...(root.name === 'StandardBusinessDocument' ? { hint: 'envelope' } : {}),
    });
  const context = createContext(options, (code) => UNIT_CODES.get(code) ?? null);
  if (root.ns !== NS.inv)
    context.events.push({ expected: NS.inv, actual: namespaceActual(root), path: '/Invoice' });
  const invoice = mapInvoice(root, context);
  // Validation is intentionally a no-op in M1; T-17 introduces the rule framework.
  const issues = finish([...decoded.issues, ...context.issues, ...namespaceIssues(context.events)], options);
  return { invoice, issues, encoding: decoded.encoding };
}
