import { expect, it } from 'vitest';
import { parseInvoice, validateInvoice } from '../../../src';
import type { Invoice, IssueCode, Party } from '../../../src/types';
import { ANONYMOUS_TCKN } from '../../../src/config';
import { IDENTITIES } from '../../../fixtures/identities';
import { validationInvoice, expectedIssue } from '../../helpers/validation';
import { fullInvoiceXml } from '../../helpers/invoice';
const issues = (invoice: Invoice, code: IssueCode) =>
  validateInvoice(invoice).filter((issue) => issue.code === code);
function party(): Party {
  const result = validationInvoice().supplier;
  if (!result) throw new Error('Synthetic supplier missing');
  return result;
}
function identified(scheme: 'VKN' | 'TCKN', value: string): Party {
  return {
    ...party(),
    identifiers: [
      { schemeId: 'OTHER', value: 'F-0001' },
      { schemeId: scheme, value },
    ],
    taxId: { scheme, value, inferred: false, schemeRaw: scheme },
  };
}
const root = '/Invoice/cac:AccountingSupplierParty/cac:Party';
const idPath = `${root}/cac:PartyIdentification[2]/cbc:ID`;
it('TC-M2-021 TC-M2-022 / UT-25 EF010 EF011: missing party identifiers, corrected and absent parties', () => {
  const invoice = validationInvoice();
  invoice.supplier = { ...party(), taxId: null };
  invoice.customer = { ...party(), taxId: null };
  expect(issues(invoice, 'EF010')).toEqual([expectedIssue('EF010', root)]);
  expect(issues(invoice, 'EF011')).toEqual([
    expectedIssue('EF011', '/Invoice/cac:AccountingCustomerParty/cac:Party'),
  ]);
  for (const code of ['EF010', 'EF011'] as const) {
    expect(issues(validationInvoice(), code)).toEqual([]);
    expect(issues({ ...invoice, supplier: null, customer: null, buyerCustomer: null }, code)).toEqual([]);
  }
});
it('TC-M2-023 TC-M2-024 / UT-25 EF012 EF013: selected indexed identifier checksums in every party', () => {
  const invoice = validationInvoice();
  for (const [scheme, bad, good, code] of [
    ['VKN', IDENTITIES.BAD_VKN.taxId, IDENTITIES.SUP_A.taxId, 'EF012'],
    ['TCKN', IDENTITIES.BAD_TCKN.taxId, IDENTITIES.PER_A.taxId, 'EF013'],
  ] as const) {
    invoice.supplier = identified(scheme, bad);
    expect(issues(invoice, code)).toEqual([expectedIssue(code, idPath, { value: bad })]);
    invoice.supplier = identified(scheme, good);
    expect(issues(invoice, code)).toEqual([]);
    for (const [key, element] of [
      ['customer', 'AccountingCustomerParty'],
      ['buyerCustomer', 'BuyerCustomerParty'],
    ] as const) {
      const copy = validationInvoice();
      copy[key] = identified(scheme, bad);
      expect(issues(copy, code)).toEqual([
        expectedIssue(code, `/Invoice/cac:${element}/cac:Party/cac:PartyIdentification[2]/cbc:ID`, {
          value: bad,
        }),
      ]);
    }
  }
});
it('TC-M2-025 / UT-25 EF014: malformed identifiers skip checksums and valid format clears issue', () => {
  const invoice = validationInvoice();
  for (const scheme of ['VKN', 'TCKN'] as const) {
    invoice.supplier = identified(scheme, 'bad');
    expect(issues(invoice, 'EF014')).toEqual([expectedIssue('EF014', idPath, { scheme, value: 'bad' })]);
    expect(issues(invoice, 'EF012')).toEqual([]);
    expect(issues(invoice, 'EF013')).toEqual([]);
  }
  expect(issues(validationInvoice(), 'EF014')).toEqual([]);
});
it('TC-M2-026 / UT-25 EF015: inferred and lower-case scheme mapping survives validation', () => {
  for (const [schemeAttribute, variant, params, details] of [
    [
      '',
      'missing',
      { value: IDENTITIES.SUP_A.taxId, scheme: 'VKN' },
      { reason: 'missing', value: IDENTITIES.SUP_A.taxId, scheme: 'VKN' },
    ],
    [
      'schemeID="vkn"',
      'case',
      { schemeId: 'vkn', scheme: 'VKN' },
      { reason: 'case', value: IDENTITIES.SUP_A.taxId, scheme: 'VKN', schemeId: 'vkn' },
    ],
  ] as const) {
    const xml = fullInvoiceXml.replace('schemeID="VKN"', schemeAttribute);
    const result = parseInvoice(xml);
    expect(result.issues.filter((issue) => issue.code === 'EF015')).toEqual([
      { ...expectedIssue('EF015', `${root}/cac:PartyIdentification[1]/cbc:ID`, params, variant), details },
    ]);
    expect(issues(result.invoice, 'EF015')).toEqual([]);
  }
  expect(parseInvoice(fullInvoiceXml).issues.filter((issue) => issue.code === 'EF015')).toEqual([]);
});
it('TC-M2-027 / UT-25 EF016: anonymous consumer info replaces checksum error', () => {
  const invoice = validationInvoice();
  invoice.supplier = identified('TCKN', ANONYMOUS_TCKN);
  expect(issues(invoice, 'EF016')).toEqual([expectedIssue('EF016', idPath)]);
  expect(issues(invoice, 'EF013')).toEqual([]);
  expect(issues(validationInvoice(), 'EF016')).toEqual([]);
});
it('TC-M2-028 / UT-25 EF017: each role uses its exact translated label', () => {
  for (const [key, element, role] of [
    ['supplier', 'AccountingSupplierParty', { en: 'supplier', tr: 'Satıcı' }],
    ['customer', 'AccountingCustomerParty', { en: 'customer', tr: 'Alıcı' }],
    ['buyerCustomer', 'BuyerCustomerParty', { en: 'buyer', tr: 'Asıl alıcı' }],
  ] as const) {
    const invoice = validationInvoice();
    invoice[key] = { ...party(), displayName: null };
    expect(issues(invoice, 'EF017')).toEqual([
      expectedIssue('EF017', `/Invoice/cac:${element}/cac:Party`, { role }),
    ]);
    invoice[key] = null;
    expect(issues(invoice, 'EF017')).toEqual([]);
  }
  expect(issues(validationInvoice(), 'EF017')).toEqual([]);
});
