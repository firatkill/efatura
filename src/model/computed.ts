import { TRY_ALIASES } from '../config';
import { decimal } from '../decimal/decimal';
import type { Amount, ComputedTotals, Invoice } from '../types';

function sum(values: (Amount | null)[]): string | null {
  return values.length
    ? decimal.sum(
        values.flatMap((amount) => (amount?.value === null || amount === null ? [] : [amount.value])),
      )
    : null;
}
/** Compute the seven derived totals using exact decimal strings (TRD §7.8.6).
 * @example
 * computeTotals(invoice).payableTry;
 */
export function computeTotals(
  invoice: Pick<
    Invoice,
    'lines' | 'taxTotals' | 'withholdingTaxTotals' | 'totals' | 'currency' | 'exchangeRate'
  >,
): ComputedTotals {
  const subtotals = invoice.taxTotals.flatMap((total) => total.subtotals);
  const withholding = invoice.withholdingTaxTotals.length
    ? invoice.withholdingTaxTotals
    : invoice.lines.flatMap((line) => line.withholdingTaxTotals);
  const payable = invoice.totals.payableAmount?.value ?? null;
  let payableTry: string | null = null;
  if (payable !== null) {
    if (invoice.currency === 'TRY' || TRY_ALIASES.some((alias) => alias === invoice.currency))
      payableTry = payable;
    else if (invoice.exchangeRate?.rate !== null && invoice.exchangeRate?.rate !== undefined)
      payableTry = decimal.round(decimal.mul(payable, invoice.exchangeRate.rate), 2);
  }
  return {
    sumOfLines: sum(invoice.lines.map((line) => line.lineExtensionAmount)),
    taxTotal: sum(invoice.taxTotals.map((total) => total.taxAmount)),
    kdvTotal: sum(subtotals.filter((sub) => sub.taxTypeCode === '0015').map((sub) => sub.taxAmount)),
    otvTotal: sum(subtotals.filter((sub) => sub.taxType?.kind === 'OTV').map((sub) => sub.taxAmount)),
    otherTaxTotal: sum(
      subtotals
        .filter((sub) => sub.taxType?.kind !== 'KDV' && sub.taxType?.kind !== 'OTV')
        .map((sub) => sub.taxAmount),
    ),
    withholdingTotal: sum(withholding.map((total) => total.taxAmount)),
    payableTry,
  };
}
