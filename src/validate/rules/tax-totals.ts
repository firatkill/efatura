import type { Invoice, TaxTotal } from '../../types';
import { elementPath } from '../../xml/path';
type LocatedTax = { total: TaxTotal; path: string; withholding: boolean; invoiceLevel: boolean };
/** Visit all four normative tax-total kinds with canonical paths.
 * @example
 * for (const { total, path } of walkTaxTotals(invoice)) console.log(path, total.taxAmount);
 */
export function* walkTaxTotals(invoice: Invoice): Generator<LocatedTax> {
  for (const [parent, normal, withholding, invoiceLevel] of [
    ['/Invoice', invoice.taxTotals, invoice.withholdingTaxTotals, true],
    ...invoice.lines.map(
      (line) =>
        [
          elementPath('/Invoice', 'cac', 'InvoiceLine', line.position),
          line.taxTotal ? [line.taxTotal] : [],
          line.withholdingTaxTotals,
          false,
        ] as const,
    ),
  ] as const) {
    for (const [values, name, isWithholding] of [
      [normal, 'TaxTotal', false],
      [withholding, 'WithholdingTaxTotal', true],
    ] as const)
      for (const [index, total] of values.entries())
        yield {
          total,
          path: elementPath(parent, 'cac', name, index + 1),
          withholding: isWithholding,
          invoiceLevel,
        };
  }
}
