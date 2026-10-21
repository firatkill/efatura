import type { AllowanceCharge, Amount, Invoice, MonetaryTotals, TaxTotal } from '../../types';
import { elementPath } from '../../xml/path';

type LocatedAmount = { amount: Amount; path: string };
function* present(amount: Amount | null, path: string): Generator<LocatedAmount> {
  if (amount !== null) yield { amount, path };
}
function* allowance(value: AllowanceCharge, path: string): Generator<LocatedAmount> {
  yield* present(value.amount, elementPath(path, 'cbc', 'Amount'));
  yield* present(value.baseAmount, elementPath(path, 'cbc', 'BaseAmount'));
}
function* tax(value: TaxTotal, path: string): Generator<LocatedAmount> {
  yield* present(value.taxAmount, elementPath(path, 'cbc', 'TaxAmount'));
  for (const [index, sub] of value.subtotals.entries()) {
    const subPath = elementPath(path, 'cac', 'TaxSubtotal', index + 1);
    yield* present(sub.taxableAmount, elementPath(subPath, 'cbc', 'TaxableAmount'));
    yield* present(sub.taxAmount, elementPath(subPath, 'cbc', 'TaxAmount'));
    yield* present(sub.perUnitAmount, elementPath(subPath, 'cbc', 'PerUnitAmount'));
  }
}
/** Yield every present Amount, including invalid values, in normative model order.
 * @example
 * for (const { amount, path } of walkAmounts(invoice)) console.log(path, amount.currency);
 */
export function* walkAmounts(invoice: Invoice): Generator<LocatedAmount> {
  const root = '/Invoice';
  for (const [index, value] of invoice.paymentTerms.entries())
    yield* present(
      value.amount,
      elementPath(elementPath(root, 'cac', 'PaymentTerms', index + 1), 'cbc', 'Amount'),
    );
  for (const [index, value] of invoice.allowanceCharges.entries())
    yield* allowance(value, elementPath(root, 'cac', 'AllowanceCharge', index + 1));
  for (const [index, value] of invoice.taxTotals.entries())
    yield* tax(value, elementPath(root, 'cac', 'TaxTotal', index + 1));
  for (const [index, value] of invoice.withholdingTaxTotals.entries())
    yield* tax(value, elementPath(root, 'cac', 'WithholdingTaxTotal', index + 1));
  for (const key of [
    'lineExtensionAmount',
    'taxExclusiveAmount',
    'taxInclusiveAmount',
    'allowanceTotalAmount',
    'chargeTotalAmount',
    'payableRoundingAmount',
    'payableAmount',
  ] as const satisfies readonly (keyof MonetaryTotals)[])
    yield* present(
      invoice.totals[key],
      elementPath(
        elementPath(root, 'cac', 'LegalMonetaryTotal'),
        'cbc',
        key.charAt(0).toUpperCase() + key.slice(1),
      ),
    );
  for (const line of invoice.lines) {
    const path = elementPath(root, 'cac', 'InvoiceLine', line.position);
    yield* present(line.lineExtensionAmount, elementPath(path, 'cbc', 'LineExtensionAmount'));
    for (const [index, value] of line.allowanceCharges.entries())
      yield* allowance(value, elementPath(path, 'cac', 'AllowanceCharge', index + 1));
    if (line.taxTotal !== null) yield* tax(line.taxTotal, elementPath(path, 'cac', 'TaxTotal', 1));
    for (const [index, value] of line.withholdingTaxTotals.entries())
      yield* tax(value, elementPath(path, 'cac', 'WithholdingTaxTotal', index + 1));
    if (line.price !== null)
      yield* present(line.price.amount, elementPath(elementPath(path, 'cac', 'Price'), 'cbc', 'PriceAmount'));
  }
}
