import { cmp } from '../../decimal/operations';
import { elementPath } from '../../xml/path';
import type { Rule } from '../index';
/** Validate line presence, identifiers, quantities, units and names (EF050–EF055).
 * @example
 * lineRules(invoice, context);
 */
export const lineRules: Rule = (invoice, ctx) => {
  if (invoice.lines.length === 0) ctx.report('EF050', '/Invoice');
  const lines = invoice.lines.map((line) => ({
    line,
    path: elementPath('/Invoice', 'cac', 'InvoiceLine', line.position),
  }));
  const seen = new Set<string>();
  for (const { line, path } of lines) {
    if (line.id !== null) {
      if (seen.has(line.id)) ctx.report('EF051', elementPath(path, 'cbc', 'ID'), { value: line.id });
      seen.add(line.id);
    }
  }
  for (const { line, path } of lines) {
    const value = line.quantity?.value ?? null;
    if (value !== null && cmp(value, '0') < 0)
      ctx.report('EF052', elementPath(path, 'cbc', 'InvoicedQuantity'), { value });
  }
  for (const { line, path } of lines) {
    const q = line.quantity;
    if (q !== null && q.unitCode !== null && q.unit === null)
      ctx.report('EF053', elementPath(path, 'cbc', 'InvoicedQuantity'), { value: q.unitCode });
  }
  for (const { line, path } of lines)
    if (line.id === null)
      ctx.report('EF054', path, {
        position: String(line.position),
      });
  for (const { line, path } of lines)
    if (line.item.name === null)
      ctx.report('EF055', elementPath(path, 'cac', 'Item'), { position: String(line.position) });
};
