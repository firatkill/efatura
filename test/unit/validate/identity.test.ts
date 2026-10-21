import { expect, it } from 'vitest';
import { parseInvoice, validateInvoice } from '../../../src';
import type { Invoice, IssueCode } from '../../../src/types';
import { NS } from '../../../src/config';
import { validationInvoice, expectedIssue } from '../../helpers/validation';
import { fullInvoiceXml } from '../../helpers/invoice';
const issues = (invoice: Invoice, code: IssueCode) =>
  validateInvoice(invoice).filter((issue) => issue.code === code);
it('TC-M2-012 / UT-24 EF001: every required path, model-based aggregate and invalid amount presence', () => {
  const invoice = validationInvoice();
  expect(issues(invoice, 'EF001')).toEqual([]);
  const fields = {
    ublVersionId: 'cbc:UBLVersionID',
    customizationId: 'cbc:CustomizationID',
    profileIdRaw: 'cbc:ProfileID',
    number: 'cbc:ID',
    uuid: 'cbc:UUID',
    issueDate: 'cbc:IssueDate',
    typeCodeRaw: 'cbc:InvoiceTypeCode',
    currency: 'cbc:DocumentCurrencyCode',
    supplier: 'cac:AccountingSupplierParty',
    customer: 'cac:AccountingCustomerParty',
  } as const;
  for (const [key, field] of Object.entries(fields)) {
    expect(issues({ ...invoice, [key]: null }, 'EF001')).toEqual([
      expectedIssue('EF001', `/Invoice/${field}`, { field }),
    ]);
  }
  expect(issues({ ...invoice, number: '' }, 'EF001')).toEqual([
    expectedIssue('EF001', '/Invoice/cbc:ID', { field: 'cbc:ID' }),
  ]);
  for (const [key, name] of [
    ['lineExtensionAmount', 'LineExtensionAmount'],
    ['taxExclusiveAmount', 'TaxExclusiveAmount'],
    ['taxInclusiveAmount', 'TaxInclusiveAmount'],
    ['payableAmount', 'PayableAmount'],
  ] as const) {
    const field = `cac:LegalMonetaryTotal/cbc:${name}`;
    expect(issues({ ...invoice, totals: { ...invoice.totals, [key]: null } }, 'EF001')).toEqual([
      expectedIssue('EF001', `/Invoice/${field}`, { field }),
    ]);
  }
  for (const includeRaw of [false, true]) {
    const xml = fullInvoiceXml.replace(/<cac:LegalMonetaryTotal>[\s\S]*?<\/cac:LegalMonetaryTotal>/, '');
    const result = parseInvoice(xml, { includeRaw });
    expect(result.issues.filter((issue) => issue.code === 'EF001')).toHaveLength(5);
    expect(result.issues).toContainEqual(
      expectedIssue('EF001', '/Invoice/cac:LegalMonetaryTotal', { field: 'cac:LegalMonetaryTotal' }),
    );
    expect(validateInvoice(result.invoice)).toEqual(result.issues);
  }
  invoice.totals.payableAmount = { value: null, raw: 'bad', currency: 'USD' };
  expect(issues(invoice, 'EF001')).toEqual([]);
});
it('TC-M2-013 / UT-24 EF002: invalid, corrected and missing UUID', () => {
  const invoice = validationInvoice();
  invoice.uuid = 'bad';
  expect(issues(invoice, 'EF002')).toEqual([expectedIssue('EF002', '/Invoice/cbc:UUID', { value: 'bad' })]);
  expect(issues(validationInvoice(), 'EF002')).toEqual([]);
  invoice.uuid = null;
  expect(issues(invoice, 'EF002')).toEqual([]);
});
it('TC-M2-014 / UT-24 EF003: pattern and year variants; invalid dates do not trigger year comparison', () => {
  const invoice = validationInvoice();
  invoice.number = 'bad';
  expect(issues(invoice, 'EF003')).toEqual([
    expectedIssue('EF003', '/Invoice/cbc:ID', { value: 'bad' }, 'pattern'),
  ]);
  invoice.number = 'ORN2024000006001';
  expect(issues(invoice, 'EF003')).toEqual([
    expectedIssue('EF003', '/Invoice/cbc:ID', { numberYear: '2024', dateYear: '2025' }, 'year'),
  ]);
  invoice.issueDate = 'bad';
  expect(issues(invoice, 'EF003')).toEqual([]);
  invoice.number = null;
  expect(issues(invoice, 'EF003')).toEqual([]);
  expect(issues(validationInvoice(), 'EF003')).toEqual([]);
});
it('TC-M2-015 / UT-24 EF004: real Gregorian dates, leap years, malformed and missing values', () => {
  const invoice = validationInvoice();
  for (const value of [
    'bad',
    '2025-02-29',
    '1900-02-29',
    '2025-04-31',
    '2025-13-01',
    '2025-00-01',
    '2025-01-00',
  ]) {
    invoice.issueDate = value;
    expect(issues(invoice, 'EF004')).toEqual([expectedIssue('EF004', '/Invoice/cbc:IssueDate', { value })]);
  }
  for (const value of ['2000-02-29', '2024-02-29', '2025-01-31', null]) {
    invoice.issueDate = value;
    expect(issues(invoice, 'EF004')).toEqual([]);
  }
});
it('TC-M2-016 / UT-24 EF005: time bounds and optional fractions/timezones', () => {
  const invoice = validationInvoice();
  for (const value of ['24:00:00', '10:60:00', '10:00:60', '10:00', '10:00:00+15:00']) {
    invoice.issueTime = value;
    expect(issues(invoice, 'EF005')).toEqual([expectedIssue('EF005', '/Invoice/cbc:IssueTime', { value })]);
  }
  for (const value of ['00:00:00', '23:59:59.123Z', '10:00:00+14:00', '10:00:00-03:30', null]) {
    invoice.issueTime = value;
    expect(issues(invoice, 'EF005')).toEqual([]);
  }
});
it('TC-M2-017 TC-M2-018 / UT-24 EF006 EF007: unknown profiles/types, known and missing values', () => {
  const invoice = validationInvoice();
  invoice.profileId = 'OTHER';
  invoice.profileIdRaw = 'UNKNOWN';
  invoice.typeCode = 'OTHER';
  invoice.typeCodeRaw = 'UNKNOWN';
  expect(issues(invoice, 'EF006')).toEqual([
    expectedIssue('EF006', '/Invoice/cbc:ProfileID', { value: 'UNKNOWN' }),
  ]);
  expect(issues(invoice, 'EF007')).toEqual([
    expectedIssue('EF007', '/Invoice/cbc:InvoiceTypeCode', { value: 'UNKNOWN' }),
  ]);
  for (const code of ['EF006', 'EF007'] as const) expect(issues(validationInvoice(), code)).toEqual([]);
  invoice.profileIdRaw = null;
  invoice.typeCodeRaw = null;
  for (const code of ['EF006', 'EF007'] as const) expect(issues(invoice, code)).toEqual([]);
});
it('TC-M2-019 / UT-24 EF008: both versions and each missing input', () => {
  const invoice = validationInvoice();
  invoice.ublVersionId = 'bad';
  invoice.customizationId = 'bad';
  expect(issues(invoice, 'EF008')).toEqual([
    expectedIssue('EF008', '/Invoice/cbc:CustomizationID', {
      field: 'CustomizationID',
      value: 'bad',
      expected: 'TR1.2 or TR1.2.1',
    }),
    expectedIssue('EF008', '/Invoice/cbc:UBLVersionID', {
      field: 'UBLVersionID',
      value: 'bad',
      expected: '2.1',
    }),
  ]);
  for (const value of ['TR1.2', 'TR1.2.1', null]) {
    invoice.customizationId = value;
    invoice.ublVersionId = null;
    expect(issues(invoice, 'EF008')).toEqual([]);
  }
  expect(issues(validationInvoice(), 'EF008')).toEqual([]);
});
it('TC-M2-020 / UT-24 EF009: parser namespace diagnostics persist independently of validation', () => {
  const xml = fullInvoiceXml.replace(NS.inv, 'urn:synthetic:wrong');
  for (const validate of [false, true])
    expect(parseInvoice(xml, { validate }).issues.filter((issue) => issue.code === 'EF009')).toHaveLength(1);
  expect(parseInvoice(fullInvoiceXml).issues.filter((issue) => issue.code === 'EF009')).toEqual([]);
});
it('TC-M2-013 / FR-19 FR-20 UT-22: parser and standalone validation honor disable and severity overrides', () => {
  const xml = fullInvoiceXml.replace('fea70000-0000-4000-8000-000000006001', 'bad');
  const normal = parseInvoice(xml);
  expect(normal.issues).toEqual([expectedIssue('EF002', '/Invoice/cbc:UUID', { value: 'bad' })]);
  expect(parseInvoice(xml, { validate: false }).issues).toEqual([]);
  expect(parseInvoice(xml, { rules: { EF002: 'off' } }).issues).toEqual([]);
  const overridden = parseInvoice(xml, { rules: { EF002: 'info' } });
  expect(overridden.issues).toEqual([
    { ...expectedIssue('EF002', '/Invoice/cbc:UUID', { value: 'bad' }), severity: 'info' },
  ]);
  expect(validateInvoice(normal.invoice, { rules: { EF002: 'info' } })).toEqual(overridden.issues);
});
