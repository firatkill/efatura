import { LINE_TAX_TOLERANCE_STEP } from '../../config';
import * as d from '../../decimal/operations';
import type { AllowanceCharge, Amount, IssueCode } from '../../types';
import { elementPath } from '../../xml/path';
import type { Rule } from '../index';
import { walkTaxTotals } from './tax-totals';
const value = (amount: Amount | null) => amount?.value ?? null;
const sum = (amounts: (Amount | null)[]) =>
  d.sum(
    amounts.flatMap((amount) => {
      const v = value(amount);
      return v === null ? [] : [v];
    }),
  );
const adjusted = (base: string, entries: AllowanceCharge[]) =>
  d.add(
    d.sub(base, sum(entries.filter((a) => a.isCharge === false).map((a) => a.amount))),
    sum(entries.filter((a) => a.isCharge === true).map((a) => a.amount)),
  );
/** Reconcile monetary totals using the exact formulas and tolerance in TRD §9.3.1.
 * @example
 * totalsRules(invoice, context);
 */
export const totalsRules: Rule = (invoice, ctx) => {
  const totals = invoice.totals;
  const lea = value(totals.lineExtensionAmount),
    tea = value(totals.taxExclusiveAmount),
    tia = value(totals.taxInclusiveAmount),
    pa = value(totals.payableAmount);
  const monetary = '/Invoice/cac:LegalMonetaryTotal';
  const within = (a: string, b: string) => d.within(a, b, ctx.tolerance);
  const compare = (code: IssueCode, path: string, computed: string, declared: string) => {
    if (!within(computed, declared)) ctx.report(code, path, { computed, declared });
  };
  if (
    lea !== null &&
    invoice.lines.length > 0 &&
    invoice.lines.every((line) => value(line.lineExtensionAmount) !== null)
  )
    compare(
      'EF040',
      elementPath(monetary, 'cbc', 'LineExtensionAmount'),
      sum(invoice.lines.map((line) => line.lineExtensionAmount)),
      lea,
    );
  if (lea !== null && tea !== null) {
    const c1 = adjusted(lea, invoice.allowanceCharges),
      c2 = d.add(
        d.sub(lea, value(totals.allowanceTotalAmount) ?? '0'),
        value(totals.chargeTotalAmount) ?? '0',
      );
    if (!within(c2, tea)) compare('EF041', elementPath(monetary, 'cbc', 'TaxExclusiveAmount'), c1, tea);
  }
  if (
    tea !== null &&
    tia !== null &&
    invoice.taxTotals.length > 0 &&
    invoice.taxTotals.every((t) => value(t.taxAmount) !== null)
  )
    compare(
      'EF042',
      elementPath(monetary, 'cbc', 'TaxInclusiveAmount'),
      d.add(tea, sum(invoice.taxTotals.map((t) => t.taxAmount))),
      tia,
    );
  if (tia !== null && pa !== null) {
    const w = invoice.computed.withholdingTotal ?? '0',
      r = value(totals.payableRoundingAmount) ?? '0',
      computed = d.add(d.sub(tia, w), r),
      path = elementPath(monetary, 'cbc', 'PayableAmount');
    if (!within(computed, pa)) {
      if (d.cmp(w, '0') > 0 && within(d.add(tia, r), pa))
        ctx.report('EF044', path, { declared: pa, withholding: w });
      else ctx.report('EF043', path, { computed, declared: pa });
    }
  }
  const taxes = [...walkTaxTotals(invoice)];
  for (const { total, path } of taxes) {
    const declared = value(total.taxAmount);
    if (
      declared !== null &&
      total.subtotals.length > 0 &&
      total.subtotals.every((s) => value(s.taxAmount) !== null)
    )
      compare(
        'EF045',
        elementPath(path, 'cbc', 'TaxAmount'),
        sum(total.subtotals.map((s) => s.taxAmount)),
        declared,
      );
  }
  for (const { total, path } of taxes)
    for (const [index, sub] of total.subtotals.entries()) {
      const taxable = value(sub.taxableAmount),
        declared = value(sub.taxAmount);
      if (taxable !== null && declared !== null && sub.percent !== null && sub.perUnitAmount === null)
        compare(
          'EF046',
          elementPath(elementPath(path, 'cac', 'TaxSubtotal', index + 1), 'cbc', 'TaxAmount'),
          d.round(d.movePoint(d.mul(taxable, sub.percent), -2), 2),
          declared,
        );
    }
  for (const line of invoice.lines) {
    const qty = line.quantity?.value ?? null,
      price = value(line.price?.amount ?? null),
      declared = value(line.lineExtensionAmount);
    if (qty === null || price === null || declared === null) continue;
    let base = d.mul(qty, price);
    const baseQty = line.price?.baseQuantity?.value ?? null;
    if (baseQty !== null && !d.eq(baseQty, '0')) base = d.div(base, baseQty, Math.max(d.scale(base), 8));
    const computed = adjusted(base, line.allowanceCharges);
    if (!within(computed, declared))
      ctx.report(
        'EF047',
        elementPath(
          elementPath('/Invoice', 'cac', 'InvoiceLine', line.position),
          'cbc',
          'LineExtensionAmount',
        ),
        { computed: d.round(computed, 2), declared },
      );
  }
  if (
    invoice.allowanceCharges.length === 0 &&
    invoice.computed.taxTotal !== null &&
    invoice.lines.some((line) => line.taxTotal !== null)
  ) {
    const computed = sum(invoice.lines.map((line) => line.taxTotal?.taxAmount ?? null)),
      declared = invoice.computed.taxTotal,
      step = d.mul(LINE_TAX_TOLERANCE_STEP, String(invoice.lines.length));
    if (!d.within(computed, declared, d.cmp(ctx.tolerance, step) > 0 ? ctx.tolerance : step))
      ctx.report('EF048', '/Invoice/cac:TaxTotal[1]/cbc:TaxAmount', { computed, declared });
  }
  if (invoice.lineCountNumeric !== null && invoice.lineCountNumeric !== invoice.lines.length)
    ctx.report('EF049', '/Invoice/cbc:LineCountNumeric', {
      declared: String(invoice.lineCountNumeric),
      computed: String(invoice.lines.length),
    });
};
