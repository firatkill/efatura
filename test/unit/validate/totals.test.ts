import { expect, it } from 'vitest';
import { validateInvoice } from '../../../src';
import type { Amount, AllowanceCharge, Invoice, IssueCode, TaxTotal } from '../../../src/types';
import { expectedIssue, validationInvoice } from '../../helpers/validation';
const amount = (value: string | null): Amount => ({ value, raw: value ?? 'bad', currency: 'USD' });
const issues = (invoice: Invoice, code: IssueCode, tolerance = '0.01') =>
  validateInvoice(invoice, { tolerance }).filter((i) => i.code === code);
const monetary = '/Invoice/cac:LegalMonetaryTotal/cbc:';
const linePath = '/Invoice/cac:InvoiceLine[1]';
function line(invoice: Invoice) {
  const value = invoice.lines[0];
  if (!value) throw new Error('Missing synthetic line');
  return value;
}
function tax(): TaxTotal {
  const value = validationInvoice().taxTotals[0];
  if (!value) throw new Error('Missing synthetic tax');
  return value;
}
const allowance = (isCharge: boolean | null, value: string | null): AllowanceCharge => ({
  isCharge,
  amount: amount(value),
  baseAmount: null,
  reason: null,
  reasonCode: null,
  multiplierFactor: null,
});
it('TC-M2-040 / UT-28 EF040: line sum, inclusive default/custom tolerance and missing prerequisites', () => {
  const i = validationInvoice();
  for (const [declared, tolerance, raised] of [
    ['100.01', '0.01', false],
    ['100.011', '0.01', true],
    ['100.001', '0', true],
    ['100.05', '0.05', false],
    ['100.051', '0.05', true],
  ] as const) {
    i.totals.lineExtensionAmount = amount(declared);
    expect(issues(i, 'EF040', tolerance)).toEqual(
      raised
        ? [expectedIssue('EF040', monetary + 'LineExtensionAmount', { computed: '100.00', declared })]
        : [],
    );
  }
  line(i).lineExtensionAmount = amount(null);
  expect(issues(i, 'EF040')).toEqual([]);
  line(i).lineExtensionAmount = null;
  expect(issues(i, 'EF040')).toEqual([]);
  i.lines = [];
  expect(issues(i, 'EF040')).toEqual([]);
  i.totals.lineExtensionAmount = null;
  expect(issues(i, 'EF040')).toEqual([]);
});
it('TC-M2-041 / UT-28 EF041: either allowance formula can reconcile; ignore null amounts', () => {
  const i = validationInvoice();
  i.allowanceCharges = [
    allowance(false, '10'),
    allowance(true, '2'),
    allowance(null, '99'),
    allowance(false, null),
  ];
  i.totals.taxExclusiveAmount = amount('90');
  expect(issues(i, 'EF041')).toEqual([
    expectedIssue('EF041', monetary + 'TaxExclusiveAmount', { computed: '92.00', declared: '90' }),
  ]);
  i.totals.taxExclusiveAmount = amount('92.00');
  expect(issues(i, 'EF041')).toEqual([]);
  i.totals.allowanceTotalAmount = amount('15');
  i.totals.chargeTotalAmount = amount('5');
  i.totals.taxExclusiveAmount = amount('90');
  expect(issues(i, 'EF041')).toEqual([]);
  i.allowanceCharges = [{ ...allowance(false, null), amount: null }];
  i.totals.lineExtensionAmount = null;
  expect(issues(i, 'EF041')).toEqual([]);
  i.totals.lineExtensionAmount = amount('100');
  i.totals.taxExclusiveAmount = null;
  expect(issues(i, 'EF041')).toEqual([]);
});
it('TC-M2-042 / UT-28 EF042: tax-exclusive plus all invoice taxes; skip absent/invalid taxes', () => {
  const i = validationInvoice();
  i.taxTotals.push({ ...tax(), taxAmount: amount('5') });
  i.totals.taxInclusiveAmount = amount('120');
  expect(issues(i, 'EF042')).toEqual([
    expectedIssue('EF042', monetary + 'TaxInclusiveAmount', { computed: '125.00', declared: '120' }),
  ]);
  i.totals.taxInclusiveAmount = amount('125');
  expect(issues(i, 'EF042')).toEqual([]);
  i.taxTotals = [{ ...tax(), taxAmount: amount(null) }];
  expect(issues(i, 'EF042')).toEqual([]);
  i.taxTotals = [{ ...tax(), taxAmount: null }];
  expect(issues(i, 'EF042')).toEqual([]);
  i.taxTotals = [];
  expect(issues(i, 'EF042')).toEqual([]);
  i.totals.taxInclusiveAmount = null;
  expect(issues(i, 'EF042')).toEqual([]);
});
it('TC-M2-043 / UT-28 EF043: payable includes withholding and rounding, missing prerequisites skip', () => {
  const i = validationInvoice();
  i.totals.payableRoundingAmount = amount('0.02');
  i.totals.payableAmount = amount('109');
  expect(issues(i, 'EF043')).toEqual([
    expectedIssue('EF043', monetary + 'PayableAmount', { computed: '110.02', declared: '109' }),
  ]);
  i.totals.payableAmount = amount('110.02');
  expect(issues(i, 'EF043')).toEqual([]);
  i.computed.withholdingTotal = null;
  i.totals.payableRoundingAmount = null;
  i.totals.payableAmount = amount('120');
  expect(issues(i, 'EF043')).toEqual([]);
  i.totals.payableAmount = null;
  expect(issues(i, 'EF043')).toEqual([]);
  i.totals.taxInclusiveAmount = null;
  expect(issues(i, 'EF043')).toEqual([]);
});
it('TC-M2-044 / UT-28 EF044: withholding not deducted warns instead of EF043', () => {
  const i = validationInvoice();
  i.totals.payableRoundingAmount = amount('0.02');
  i.totals.payableAmount = amount('120.02');
  expect(issues(i, 'EF044')).toEqual([
    expectedIssue('EF044', monetary + 'PayableAmount', { declared: '120.02', withholding: '10.00' }),
  ]);
  expect(issues(i, 'EF043')).toEqual([]);
  i.totals.payableAmount = amount('110.02');
  expect(issues(i, 'EF044')).toEqual([]);
  i.computed.withholdingTotal = '0';
  expect(issues(i, 'EF044')).toEqual([]);
  expect(issues(i, 'EF043')).toHaveLength(1);
});
it('TC-M2-045 / UT-28 EF045: all four TaxTotal kinds and missing subtotal prerequisites', () => {
  const i = validationInvoice();
  const t = tax();
  t.taxAmount = amount('21');
  i.taxTotals = [t];
  i.withholdingTaxTotals = [structuredClone(t)];
  line(i).taxTotal = structuredClone(t);
  line(i).withholdingTaxTotals = [structuredClone(t)];
  const paths = [
    '/Invoice/cac:TaxTotal[1]',
    '/Invoice/cac:WithholdingTaxTotal[1]',
    linePath + '/cac:TaxTotal[1]',
    linePath + '/cac:WithholdingTaxTotal[1]',
  ];
  expect(issues(i, 'EF045')).toEqual(
    paths
      .sort()
      .map((p) => expectedIssue('EF045', p + '/cbc:TaxAmount', { computed: '20.00', declared: '21' })),
  );
  for (const total of [t, ...i.withholdingTaxTotals, ...line(i).withholdingTaxTotals])
    total.taxAmount = amount('20');
  line(i).taxTotal = null;
  expect(issues(i, 'EF045')).toEqual([]);
  t.taxAmount = amount('21');
  t.subtotals = [];
  expect(issues(i, 'EF045')).toEqual([]);
  const subtotal = tax().subtotals[0];
  if (!subtotal) throw new Error('Missing synthetic subtotal');
  t.subtotals = [{ ...subtotal, taxAmount: amount(null) }];
  expect(issues(i, 'EF045')).toEqual([]);
  t.taxAmount = null;
  expect(issues(i, 'EF045')).toEqual([]);
});
it('TC-M2-046 / UT-28 EF046: subtotal percent rounds to two decimals; per-unit and missing values skip', () => {
  const i = validationInvoice();
  const t = tax();
  const sub = t.subtotals[0];
  if (!sub) throw new Error('Missing synthetic subtotal');
  sub.taxableAmount = amount('10.025');
  sub.percent = '20';
  sub.taxAmount = amount('2.00');
  i.taxTotals = [t];
  i.withholdingTaxTotals = [];
  expect(issues(i, 'EF046')).toEqual([]);
  sub.taxAmount = amount('2.03');
  expect(issues(i, 'EF046')).toEqual([
    expectedIssue('EF046', '/Invoice/cac:TaxTotal[1]/cac:TaxSubtotal[1]/cbc:TaxAmount', {
      computed: '2.01',
      declared: '2.03',
    }),
  ]);
  i.withholdingTaxTotals = [structuredClone(t)];
  line(i).taxTotal = structuredClone(t);
  line(i).withholdingTaxTotals = [structuredClone(t)];
  const paths = [
    '/Invoice/cac:TaxTotal[1]',
    '/Invoice/cac:WithholdingTaxTotal[1]',
    linePath + '/cac:TaxTotal[1]',
    linePath + '/cac:WithholdingTaxTotal[1]',
  ];
  expect(issues(i, 'EF046')).toEqual(
    paths.sort().map((path) =>
      expectedIssue('EF046', path + '/cac:TaxSubtotal[1]/cbc:TaxAmount', {
        computed: '2.01',
        declared: '2.03',
      }),
    ),
  );
  i.withholdingTaxTotals = [];
  line(i).taxTotal = null;
  line(i).withholdingTaxTotals = [];
  sub.perUnitAmount = amount('0.5');
  expect(issues(i, 'EF046')).toEqual([]);
  sub.perUnitAmount = null;
  sub.percent = null;
  expect(issues(i, 'EF046')).toEqual([]);
  sub.percent = '20';
  sub.taxableAmount = null;
  expect(issues(i, 'EF046')).toEqual([]);
  sub.taxableAmount = amount('10');
  sub.taxAmount = null;
  expect(issues(i, 'EF046')).toEqual([]);
});
it('TC-M2-047 / UT-28 EF047: quantity/base quantity, charges, high precision and rounded diagnostic', () => {
  const i = validationInvoice();
  const l = line(i);
  l.quantity = { value: '1', raw: '1', unitCode: null, unit: null };
  l.price = { amount: amount('1'), baseQuantity: { value: '3', raw: '3', unitCode: null, unit: null } };
  l.allowanceCharges = [allowance(false, '0.1'), allowance(true, '0.2')];
  l.lineExtensionAmount = amount('0.40');
  expect(issues(i, 'EF047')).toEqual([
    expectedIssue('EF047', linePath + '/cbc:LineExtensionAmount', { computed: '0.43', declared: '0.40' }),
  ]);
  l.lineExtensionAmount = amount('0.43333333');
  expect(issues(i, 'EF047', '0')).toEqual([]);
  l.price.baseQuantity = { value: '0', raw: '0', unitCode: null, unit: null };
  l.lineExtensionAmount = amount('1.1');
  expect(issues(i, 'EF047')).toEqual([]);
  l.price.baseQuantity = null;
  expect(issues(i, 'EF047')).toEqual([]);
  l.price.amount = amount('1.000000001');
  l.price.baseQuantity = { value: '2', raw: '2', unitCode: null, unit: null };
  l.lineExtensionAmount = amount('0.600000001');
  expect(issues(i, 'EF047', '0')).toEqual([]);
  l.price.amount = null;
  expect(issues(i, 'EF047')).toEqual([]);
  l.price = null;
  expect(issues(i, 'EF047')).toEqual([]);
  l.quantity = null;
  expect(issues(i, 'EF047')).toEqual([]);
});
it('TC-M2-048 / UT-28 EF048: line-count tolerance floor, custom tolerance, allowance and missing-tax skips', () => {
  const i = validationInvoice();
  i.allowanceCharges = [];
  const l = line(i);
  l.taxTotal = { taxAmount: amount('5'), subtotals: [] };
  i.lines = Array.from({ length: 4 }, (_, n) => ({ ...structuredClone(l), position: n + 1 }));
  i.computed.taxTotal = '20.02';
  expect(issues(i, 'EF048', '0')).toEqual([]);
  i.computed.taxTotal = '20.021';
  expect(issues(i, 'EF048')).toEqual([
    expectedIssue('EF048', '/Invoice/cac:TaxTotal[1]/cbc:TaxAmount', { computed: '20', declared: '20.021' }),
  ]);
  expect(issues(i, 'EF048', '0.05')).toEqual([]);
  i.allowanceCharges = [allowance(false, '0')];
  expect(issues(i, 'EF048')).toEqual([]);
  i.allowanceCharges = [];
  i.computed.taxTotal = null;
  expect(issues(i, 'EF048')).toEqual([]);
  i.computed.taxTotal = '0';
  i.lines = [{ ...l, taxTotal: null }];
  expect(issues(i, 'EF048')).toEqual([]);
});
it('TC-M2-049 / UT-28 EF049: declared line count versus actual, null skips', () => {
  const i = validationInvoice();
  i.lineCountNumeric = 2;
  expect(issues(i, 'EF049')).toEqual([
    expectedIssue('EF049', '/Invoice/cbc:LineCountNumeric', { declared: '2', computed: '1' }),
  ]);
  i.lineCountNumeric = 1;
  expect(issues(i, 'EF049')).toEqual([]);
  i.lineCountNumeric = null;
  expect(issues(i, 'EF049')).toEqual([]);
});
