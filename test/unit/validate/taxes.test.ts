import { expect, it } from 'vitest';
import { validateInvoice } from '../../../src';
import type { Amount, Invoice, IssueCode, TaxTotal } from '../../../src/types';
import { expectedIssue, validationInvoice } from '../../helpers/validation';
const issues = (i: Invoice, code: IssueCode) => validateInvoice(i).filter((issue) => issue.code === code);
const amount = (value: string | null): Amount => ({ value, raw: value ?? 'bad', currency: 'USD' });
function tax(i: Invoice) {
  const t = i.taxTotals[0];
  if (!t) throw new Error('Missing synthetic tax');
  return t;
}
function sub(t: TaxTotal) {
  const s = t.subtotals[0];
  if (!s) throw new Error('Missing synthetic subtotal');
  return s;
}
function line(i: Invoice) {
  const l = i.lines[0];
  if (!l) throw new Error('Missing synthetic line');
  return l;
}
const base = '/Invoice/cac:TaxTotal[1]/cac:TaxSubtotal[1]';
const suffix = '/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode';
it('TC-M2-056 / UT-30 EF060: unknown normal tax code at invoice and line levels', () => {
  const i = validationInvoice(),
    t = tax(i),
    s = sub(t);
  expect(issues(i, 'EF060')).toEqual([]);
  s.taxTypeCode = 'UNKNOWN';
  s.taxType = null;
  line(i).taxTotal = structuredClone(t);
  expect(issues(i, 'EF060')).toEqual([
    expectedIssue('EF060', '/Invoice/cac:InvoiceLine[1]/cac:TaxTotal[1]/cac:TaxSubtotal[1]' + suffix, {
      value: 'UNKNOWN',
    }),
    expectedIssue('EF060', base + suffix, { value: 'UNKNOWN' }),
  ]);
  s.taxTypeCode = null;
  line(i).taxTotal = null;
  expect(issues(i, 'EF060')).toEqual([]);
  i.withholdingTaxTotals = [structuredClone(t)];
  sub(i.withholdingTaxTotals[0] ?? t).taxTypeCode = 'UNKNOWN';
  expect(issues(i, 'EF060')).toEqual([]);
});
it('TC-M2-057 / UT-30 EF061: zero invoice VAT requires exemption; missing percent uses approved (none)', () => {
  const i = validationInvoice(),
    s = sub(tax(i));
  expect(issues(i, 'EF061')).toEqual([]);
  s.percent = '0.00';
  expect(issues(i, 'EF061')).toEqual([expectedIssue('EF061', base, { percent: '0.00' })]);
  s.percent = null;
  s.taxAmount = amount('0');
  expect(issues(i, 'EF061')).toEqual([expectedIssue('EF061', base, { percent: '(none)' })]);
  s.exemptionReasonCode = '301';
  expect(issues(i, 'EF061')).toEqual([]);
  s.exemptionReasonCode = null;
  s.taxAmount = null;
  expect(issues(i, 'EF061')).toEqual([]);
  s.percent = '0';
  s.taxTypeCode = 'UNKNOWN';
  expect(issues(i, 'EF061')).toEqual([]);
  s.taxTypeCode = '0015';
  line(i).taxTotal = tax(i);
  i.taxTotals = [];
  expect(issues(i, 'EF061')).toEqual([]);
});
it('TC-M2-058 / UT-30 EF062: exemption types and export profile require invoice KDV exemption', () => {
  const i = validationInvoice(),
    s = sub(tax(i));
  for (const type of ['ISTISNA', 'IHRACKAYITLI', 'YTBISTISNA'] as const) {
    i.typeCode = type;
    expect(issues(i, 'EF062')).toEqual([expectedIssue('EF062', '/Invoice/cac:TaxTotal[1]', { value: type })]);
  }
  i.typeCode = 'SATIS';
  i.profileId = 'IHRACAT';
  expect(issues(i, 'EF062')).toEqual([
    expectedIssue('EF062', '/Invoice/cac:TaxTotal[1]', { value: 'IHRACAT' }),
  ]);
  s.exemptionReasonCode = '301';
  expect(issues(i, 'EF062')).toEqual([]);
  s.taxTypeCode = 'UNKNOWN';
  expect(issues(i, 'EF062')).toHaveLength(1);
  i.profileId = 'TEMELFATURA';
  expect(issues(i, 'EF062')).toEqual([]);
});
it('TC-M2-059 / UT-30 EF063: each withholding type requires computed withholding', () => {
  const i = validationInvoice();
  for (const type of ['TEVKIFAT', 'TEVKIFATIADE', 'YTBTEVKIFAT', 'YTBTEVKIFATIADE'] as const) {
    i.typeCode = type;
    i.computed.withholdingTotal = null;
    expect(issues(i, 'EF063')).toEqual([
      expectedIssue('EF063', '/Invoice/cbc:InvoiceTypeCode', { value: type }),
    ]);
    i.computed.withholdingTotal = '0';
    expect(issues(i, 'EF063')).toEqual([]);
  }
  i.typeCode = 'SATIS';
  i.computed.withholdingTotal = null;
  expect(issues(i, 'EF063')).toEqual([]);
});
it('TC-M2-060 / UT-30 EF064: withholding on non-withholding known type warns', () => {
  const i = validationInvoice();
  i.typeCode = 'SATIS';
  expect(issues(i, 'EF064')).toEqual([
    expectedIssue('EF064', '/Invoice/cbc:InvoiceTypeCode', { value: 'SATIS' }),
  ]);
  i.computed.withholdingTotal = null;
  expect(issues(i, 'EF064')).toEqual([]);
  i.computed.withholdingTotal = '0';
  for (const type of ['OTHER', 'TEVKIFAT', 'TEVKIFATIADE', 'YTBTEVKIFAT', 'YTBTEVKIFATIADE'] as const) {
    i.typeCode = type;
    expect(issues(i, 'EF064')).toEqual([]);
  }
});
it('TC-M2-061 / UT-30 EF065: unknown withholding code at invoice and line levels', () => {
  const i = validationInvoice();
  expect(issues(i, 'EF065')).toEqual([]);
  const t = i.withholdingTaxTotals[0];
  if (!t) throw new Error('Missing synthetic withholding');
  const s = sub(t);
  s.taxTypeCode = 'UNKNOWN';
  s.taxType = null;
  line(i).withholdingTaxTotals = [structuredClone(t)];
  expect(issues(i, 'EF065')).toEqual(
    ['/Invoice/cac:InvoiceLine[1]/cac:WithholdingTaxTotal[1]', '/Invoice/cac:WithholdingTaxTotal[1]'].map(
      (p) => expectedIssue('EF065', p + '/cac:TaxSubtotal[1]' + suffix, { value: 'UNKNOWN' }),
    ),
  );
  s.taxTypeCode = null;
  line(i).withholdingTaxTotals = [];
  expect(issues(i, 'EF065')).toEqual([]);
});
it('TC-M2-062 / UT-30 EF066: no invoice TaxTotal warns even with line taxes', () => {
  const i = validationInvoice();
  expect(issues(i, 'EF066')).toEqual([]);
  line(i).taxTotal = tax(i);
  i.taxTotals = [];
  expect(issues(i, 'EF066')).toEqual([expectedIssue('EF066', '/Invoice')]);
});
