import { expect, it } from 'vitest';
import { validateInvoice } from '../../../src';
import type { Invoice, IssueCode } from '../../../src/types';
import { expectedIssue, validationInvoice } from '../../helpers/validation';
const issues = (i: Invoice, code: IssueCode) => validateInvoice(i).filter((issue) => issue.code === code);
function line(i: Invoice) {
  const l = i.lines[0];
  if (!l) throw new Error('Missing synthetic line');
  return l;
}
const path = '/Invoice/cac:InvoiceLine[1]';
it('TC-M2-050 / UT-29 EF050: no invoice lines', () => {
  const i = validationInvoice();
  expect(issues(i, 'EF050')).toEqual([]);
  i.lines = [];
  expect(issues(i, 'EF050')).toEqual([expectedIssue('EF050', '/Invoice')]);
});
it('TC-M2-051 / UT-29 EF051: one issue per repeated non-null ID', () => {
  const i = validationInvoice(),
    l = line(i);
  i.lines = [l, { ...structuredClone(l), position: 2 }, { ...structuredClone(l), position: 3 }];
  expect(issues(i, 'EF051')).toEqual(
    [2, 3].map((n) =>
      expectedIssue('EF051', `/Invoice/cac:InvoiceLine[${String(n)}]/cbc:ID`, { value: '1' }),
    ),
  );
  i.lines.forEach((l, n) => {
    l.id = String(n);
  });
  expect(issues(i, 'EF051')).toEqual([]);
  i.lines.forEach((l) => {
    l.id = null;
  });
  expect(issues(i, 'EF051')).toEqual([]);
});
it('TC-M2-052 / UT-29 EF052: negative quantity only', () => {
  const i = validationInvoice(),
    l = line(i);
  l.quantity = { value: '-1.25', raw: '-1.25', unitCode: null, unit: null };
  expect(issues(i, 'EF052')).toEqual([
    expectedIssue('EF052', path + '/cbc:InvoicedQuantity', { value: '-1.25' }),
  ]);
  for (const value of ['0', '1', null]) {
    l.quantity.value = value;
    expect(issues(i, 'EF052')).toEqual([]);
  }
  l.quantity = null;
  expect(issues(i, 'EF052')).toEqual([]);
});
it('TC-M2-053 / UT-29 EF053: unknown unit code only', () => {
  const i = validationInvoice(),
    l = line(i);
  expect(issues(i, 'EF053')).toEqual([]);
  l.quantity = { value: '1', raw: '1', unitCode: 'UNKNOWN', unit: null };
  expect(issues(i, 'EF053')).toEqual([
    expectedIssue('EF053', path + '/cbc:InvoicedQuantity', { value: 'UNKNOWN' }),
  ]);
  l.quantity.unitCode = null;
  expect(issues(i, 'EF053')).toEqual([]);
  l.quantity = null;
  expect(issues(i, 'EF053')).toEqual([]);
});
it('TC-M2-054 / UT-29 EF054: missing line ID reports position', () => {
  const i = validationInvoice();
  expect(issues(i, 'EF054')).toEqual([]);
  line(i).id = null;
  expect(issues(i, 'EF054')).toEqual([expectedIssue('EF054', path, { position: '1' })]);
});
it('TC-M2-055 / UT-29 EF055: missing item name reports item path', () => {
  const i = validationInvoice();
  expect(issues(i, 'EF055')).toEqual([]);
  line(i).item.name = null;
  expect(issues(i, 'EF055')).toEqual([expectedIssue('EF055', path + '/cac:Item', { position: '1' })]);
});
