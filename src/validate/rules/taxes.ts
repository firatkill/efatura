import { eq } from '../../decimal/operations';
import { elementPath } from '../../xml/path';
import type { Rule } from '../index';
import { walkTaxTotals } from './tax-totals';
/** Validate tax codes, exemptions and withholding presence (EF060–EF066).
 * @example
 * taxRules(invoice, context);
 */
export const taxRules: Rule = (invoice, ctx) => {
  const taxes = [...walkTaxTotals(invoice)];
  const unknown = (withholding: boolean) => {
    for (const { total, path, withholding: isWithholding } of taxes)
      if (withholding === isWithholding)
        for (const [index, sub] of total.subtotals.entries())
          if (sub.taxTypeCode !== null && sub.taxType === null)
            ctx.report(
              withholding ? 'EF065' : 'EF060',
              elementPath(path, 'cac', 'TaxSubtotal', index + 1) +
                '/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode',
              { value: sub.taxTypeCode },
            );
  };
  unknown(false);
  const vat = taxes
    .filter((t) => t.invoiceLevel && !t.withholding)
    .flatMap(({ total, path }) =>
      total.subtotals.map((sub, index) => ({
        sub,
        path: elementPath(path, 'cac', 'TaxSubtotal', index + 1),
      })),
    )
    .filter(({ sub }) => sub.taxTypeCode === '0015');
  const zero = (value: string | null) => value !== null && eq(value, '0');
  for (const { sub, path } of vat)
    if ((zero(sub.percent) || zero(sub.taxAmount?.value ?? null)) && sub.exemptionReasonCode === null)
      ctx.report('EF061', path, { percent: sub.percent ?? '(none)' });
  const exemptionType = ['ISTISNA', 'IHRACKAYITLI', 'YTBISTISNA'].includes(invoice.typeCode);
  if (
    (exemptionType || invoice.profileId === 'IHRACAT') &&
    !vat.some(({ sub }) => sub.exemptionReasonCode !== null)
  )
    ctx.report('EF062', '/Invoice/cac:TaxTotal[1]', {
      value: exemptionType ? invoice.typeCode : invoice.profileId,
    });
  const withholdingType = ['TEVKIFAT', 'TEVKIFATIADE', 'YTBTEVKIFAT', 'YTBTEVKIFATIADE'].includes(
      invoice.typeCode,
    ),
    w = invoice.computed.withholdingTotal;
  if (withholdingType && w === null)
    ctx.report('EF063', '/Invoice/cbc:InvoiceTypeCode', { value: invoice.typeCode });
  if (!withholdingType && invoice.typeCode !== 'OTHER' && w !== null)
    ctx.report('EF064', '/Invoice/cbc:InvoiceTypeCode', { value: invoice.typeCode });
  unknown(true);
  if (invoice.taxTotals.length === 0) ctx.report('EF066', '/Invoice');
};
