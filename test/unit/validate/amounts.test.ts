import { expect, it } from 'vitest';
import { parseInvoice } from '../../../src/parse';
import { validateInvoice } from '../../../src/validate';
import { walkAmounts } from '../../../src/validate/rules/amounts';
import { NS } from '../../../src/config';
import { IDENTITIES } from '../../../fixtures/identities';
import { fullInvoiceXml } from '../../helpers/invoice';
import type { Amount, AllowanceCharge, TaxTotal } from '../../../src/types';

const wrap = (body: string) =>
  `<Invoice xmlns="${NS.inv}" xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</Invoice>`;
const total = (value: string, attr = ' currencyID="TRY"') =>
  wrap(
    `<cac:LegalMonetaryTotal><cbc:PayableAmount${attr}>${value}</cbc:PayableAmount></cac:LegalMonetaryTotal>`,
  );

it.each([
  [
    'TC-M2-036',
    'EF030',
    total('bad'),
    total('1'),
    'error',
    'bad is not a valid number.',
    'bad geçerli bir sayı değil.',
    { value: 'bad' },
  ],
  [
    'TC-M2-037',
    'EF031',
    total('1,2'),
    total('1.2'),
    'warning',
    '1,2 uses a decimal comma; it was read as 1.2.',
    '1,2 ondalık ayırıcı olarak virgül kullanıyor; 1.2 olarak okundu.',
    { value: '1,2', normalized: '1.2' },
  ],
  [
    'TC-M2-038',
    'EF032',
    total('1', ''),
    total('1'),
    'warning',
    'Amount 1 has no currencyID.',
    '1 tutarında currencyID yok.',
    { value: '1' },
  ],
] as const)(
  '%s / FR-17 FR-18 UT-27: %s raised and corrected',
  (_tc, code, bad, fixed, severity, message, messageTr, details) => {
    const result = parseInvoice(bad, { validate: false });
    expect(result.issues.filter((i) => i.code === code)).toEqual([
      {
        code,
        severity,
        path: '/Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount',
        message,
        messageTr,
        details,
      },
    ]);
    expect(parseInvoice(fixed).issues.some((i) => i.code === code)).toBe(false);
    expect(parseInvoice(bad, { rules: { [code]: 'off' } }).issues.some((i) => i.code === code)).toBe(false);
    expect(validateInvoice(result.invoice).some((i) => i.code === code)).toBe(false);
  },
);
it('TC-M2-020 / FR-17 FR-18 UT-24: EF009 is mapping-only, deduplicated and absent for strict namespaces', () => {
  expect(parseInvoice('<Invoice/>', { validate: false }).issues).toEqual([
    {
      code: 'EF009',
      severity: 'warning',
      path: '/Invoice',
      message: `Element is not in the expected namespace ${NS.inv}; it was matched by its local name.`,
      messageTr: `Eleman beklenen ${NS.inv} ad alanında değil; yerel adıyla eşleştirildi.`,
      details: { expected: NS.inv, actual: 'none' },
    },
  ]);
  expect(parseInvoice(wrap('')).issues.some((i) => i.code === 'EF009')).toBe(false);
});
it('TC-M2-026 / FR-17 FR-18 UT-25: EF015 preserves both approved variants and filtered identifier path', () => {
  const xml = (attr: string) =>
    wrap(
      `<cac:AccountingSupplierParty><cac:Party><cac:PartyIdentification><cbc:ID${attr}>${IDENTITIES.SUP_A.taxId}</cbc:ID></cac:PartyIdentification></cac:Party></cac:AccountingSupplierParty>`,
    );
  const path = '/Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification[1]/cbc:ID';
  const value = IDENTITIES.SUP_A.taxId;
  expect(parseInvoice(xml(''), { validate: false }).issues.find((i) => i.code === 'EF015')).toEqual({
    code: 'EF015',
    severity: 'info',
    path,
    message: `Identifier ${value} has no schemeID; it was read as VKN from its length.`,
    messageTr: `${value} tanımlayıcısında schemeID yok; uzunluğundan VKN olarak okundu.`,
    details: { reason: 'missing', value, scheme: 'VKN' },
  });
  expect(parseInvoice(xml(' schemeID="vkn"')).issues.find((i) => i.code === 'EF015')).toEqual({
    code: 'EF015',
    severity: 'info',
    path,
    message: 'schemeID vkn is not upper-case; it was read as VKN.',
    messageTr: 'schemeID vkn büyük harfle yazılmamış; VKN olarak okundu.',
    details: { reason: 'case', value, scheme: 'VKN', schemeId: 'vkn' },
  });
  expect(parseInvoice(xml(' schemeID="VKN"')).issues.some((i) => i.code === 'EF015')).toBe(false);
});
it('TC-M2-032 / FR-17 FR-18 UT-26: EF023 fallback versus prescribed pricing rate', () => {
  const xml = (source: string) =>
    wrap(`<cac:${source}><cbc:CalculationRate>35</cbc:CalculationRate></cac:${source}>`);
  expect(
    parseInvoice(xml('TaxExchangeRate'), { validate: false }).issues.find((i) => i.code === 'EF023'),
  ).toEqual({
    code: 'EF023',
    severity: 'warning',
    path: '/Invoice/cac:TaxExchangeRate',
    message: 'Exchange rate 35 was taken from TaxExchangeRate, not from PricingExchangeRate.',
    messageTr: '35 döviz kuru PricingExchangeRate yerine TaxExchangeRate kaynağından alındı.',
    details: { rate: '35', source: 'TaxExchangeRate' },
  });
  expect(parseInvoice(xml('PricingExchangeRate')).issues.some((i) => i.code === 'EF023')).toBe(false);
});
it('TC-M2-039 / FR-17 FR-18 UT-27: EF035 encoding variants and corrected UTF-8', () => {
  const encode = (s: string) => new TextEncoder().encode(s);
  expect(
    parseInvoice(encode('<?xml version="1.0" encoding="unsupported"?>' + wrap(''))).issues.find(
      (i) => i.code === 'EF035',
    ),
  ).toEqual({
    code: 'EF035',
    severity: 'warning',
    path: '/Invoice',
    message: 'Declared encoding unsupported is not supported; the file was read as UTF-8.',
    messageTr: 'Bildirilen unsupported kodlaması desteklenmiyor; dosya UTF-8 olarak okundu.',
    details: { declared: 'unsupported' },
  });
  const before = encode(wrap('<cbc:Note>~</cbc:Note>'));
  const index = before.indexOf(126);
  before[index] = 0xe7;
  expect(parseInvoice(before, { validate: false }).issues.find((i) => i.code === 'EF035')).toEqual({
    code: 'EF035',
    severity: 'warning',
    path: '/Invoice',
    message: 'The file is not valid UTF-8 and declares no encoding; it was read as windows-1254.',
    messageTr: 'Dosya geçerli UTF-8 değil ve kodlama bildirmiyor; windows-1254 olarak okundu.',
    details: { declared: '(none)', used: 'windows-1254' },
  });
  expect(parseInvoice(encode(wrap('<cbc:Note>ç</cbc:Note>'))).issues.some((i) => i.code === 'EF035')).toBe(
    false,
  );
});
it('TC-M2-005 / FR-17 UT-27: every Amount location appears once in normative model order', () => {
  const invoice = parseInvoice(fullInvoiceXml, { includeRaw: false, validate: false }).invoice;
  const amount: Amount = { value: null, raw: 'bad', currency: 'USD' };
  const allowance: AllowanceCharge = {
    isCharge: false,
    reason: null,
    reasonCode: null,
    multiplierFactor: null,
    amount,
    baseAmount: amount,
  };
  const source = invoice.taxTotals[0];
  if (!source?.subtotals[0] || !invoice.lines[0] || !invoice.paymentTerms[0])
    throw new Error('Synthetic helper must include each model section');
  const tax: TaxTotal = {
    taxAmount: amount,
    subtotals: [{ ...source.subtotals[0], taxableAmount: amount, taxAmount: amount, perUnitAmount: amount }],
  };
  invoice.paymentTerms = [
    { ...invoice.paymentTerms[0], amount },
    { ...invoice.paymentTerms[0], amount: null },
  ];
  invoice.allowanceCharges = [allowance];
  invoice.taxTotals = [tax];
  invoice.withholdingTaxTotals = [tax];
  for (const key of Object.keys(invoice.totals) as (keyof typeof invoice.totals)[])
    invoice.totals[key] = amount;
  invoice.lines = [
    {
      ...invoice.lines[0],
      position: 3,
      lineExtensionAmount: amount,
      allowanceCharges: [allowance],
      taxTotal: tax,
      withholdingTaxTotals: [tax],
      price: { amount, baseQuantity: null },
    },
  ];
  const root = '/Invoice';
  const line = root + '/cac:InvoiceLine[3]';
  const taxPaths = (base: string) => [
    base + '/cbc:TaxAmount',
    ...['TaxableAmount', 'TaxAmount', 'PerUnitAmount'].map(
      (name) => base + '/cac:TaxSubtotal[1]/cbc:' + name,
    ),
  ];
  const expected = [
    root + '/cac:PaymentTerms[1]/cbc:Amount',
    root + '/cac:AllowanceCharge[1]/cbc:Amount',
    root + '/cac:AllowanceCharge[1]/cbc:BaseAmount',
    ...taxPaths(root + '/cac:TaxTotal[1]'),
    ...taxPaths(root + '/cac:WithholdingTaxTotal[1]'),
    ...[
      'LineExtensionAmount',
      'TaxExclusiveAmount',
      'TaxInclusiveAmount',
      'AllowanceTotalAmount',
      'ChargeTotalAmount',
      'PayableRoundingAmount',
      'PayableAmount',
    ].map((name) => root + '/cac:LegalMonetaryTotal/cbc:' + name),
    line + '/cbc:LineExtensionAmount',
    line + '/cac:AllowanceCharge[1]/cbc:Amount',
    line + '/cac:AllowanceCharge[1]/cbc:BaseAmount',
    ...taxPaths(line + '/cac:TaxTotal[1]'),
    ...taxPaths(line + '/cac:WithholdingTaxTotal[1]'),
    line + '/cac:Price/cbc:PriceAmount',
  ];
  expect([...walkAmounts(invoice)]).toEqual(expected.map((path) => ({ amount, path })));
  const empty = parseInvoice(wrap('')).invoice;
  expect([...walkAmounts(empty)]).toEqual([]);
  const completeLine = invoice.lines[0];
  if (!completeLine) throw new Error('Synthetic line missing');
  empty.lines = [
    {
      ...completeLine,
      position: 1,
      taxTotal: null,
      withholdingTaxTotals: [],
      price: null,
      lineExtensionAmount: null,
      allowanceCharges: [],
    },
  ];
  expect([...walkAmounts(empty)]).toEqual([]);
});
