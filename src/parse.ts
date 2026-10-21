import { checkOptions } from './validate/options';
import { finishIssues } from './validate/issue';
import { validationIssues } from './validate';
import { NS } from './config';
import { UNIT_CODES } from './codes';
import { EfaturaParseError } from './errors';
import { createContext } from './model/context';
import { mapInvoice } from './model/invoice';
import { decodeInput } from './xml/decode';
import { guardXml } from './xml/guard';
import { parseXmlTree } from './xml/tree';
import { namespaceActual, namespaceIssues } from './xml/namespaces';
import type { ParseOptions, ParseResult, XmlInput } from './types';

/** Parse a Turkish UBL invoice into exact, JSON-safe model data and diagnostics.
 * @example
 * const { invoice, issues } = parseInvoice(xml, { includeRaw: false });
 */
export function parseInvoice(input: XmlInput, options: ParseOptions = {}): ParseResult {
  checkOptions(options);
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
  const issues = finishIssues(
    [
      ...decoded.issues,
      ...context.issues,
      ...namespaceIssues(context.events),
      ...(options.validate === false ? [] : validationIssues(invoice, options)),
    ],
    options,
  );
  return { invoice, issues, encoding: decoded.encoding };
}
