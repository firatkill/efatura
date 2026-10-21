import { expect, it, vi, afterEach } from 'vitest';
import { parseInvoice, EfaturaParseError, decodeXml, selectText } from '@firatkill/efatura';
import type { ParseOptions } from '@firatkill/efatura';
import { fullInvoiceXml } from '../helpers/invoice';
import { NS } from '../../src/config';
import { ISSUE_CODES } from '../../src/validate/catalogue';
import * as mapping from '../../src/model/invoice';
afterEach(() => vi.restoreAllMocks());

it('TC-M1-034 / FR-01 FR-04 / UT-22: parses string, BOM, bytes and ArrayBuffer synchronously', () => {
  const bytes = new TextEncoder().encode(fullInvoiceXml);
  const expected = parseInvoice(fullInvoiceXml);
  for (const input of ['\ufeff' + fullInvoiceXml, bytes, bytes.buffer])
    expect(parseInvoice(input)).toEqual(expected);
  const { invoice, issues, encoding } = expected;
  expect(encoding).toBe('utf-8');
  expect(issues).toEqual([]);
  expect(invoice).toMatchObject({
    number: 'ORN2025000006001',
    profileId: 'TEMELFATURA',
    typeCode: 'TEVKIFAT',
    signed: true,
    period: { description: 'synthetic period' },
    supplier: { taxId: { scheme: 'VKN' } },
    customer: { person: { firstName: 'Ayşe' } },
    buyerCustomer: { displayName: 'Example Trading GmbH (fictitious)' },
    exchangeRate: { rate: '35.1' },
    dueDate: { date: '2025-08-01', source: 'PaymentMeans' },
    computed: {
      sumOfLines: '100.00',
      taxTotal: '20.00',
      kdvTotal: '20.00',
      withholdingTotal: '10.00',
      payableTry: '3861.00',
    },
  });
  for (const field of [
    'orderReferences',
    'billingReferences',
    'despatchReferences',
    'receiptReferences',
    'contractReferences',
    'additionalReferences',
    'attachments',
    'paymentMeans',
    'paymentTerms',
    'allowanceCharges',
    'taxTotals',
    'withholdingTaxTotals',
    'lines',
  ] as const)
    expect(invoice[field]).toHaveLength(1);
  expect(invoice.lines[0]?.quantity?.unit?.code).toBe('C62');
  expect(selectText(invoice.raw, '/Invoice/cbc:ID')).toBe(invoice.number);
  expect(decodeXml(bytes)).toEqual({ text: fullInvoiceXml, encoding: 'utf-8', issues: [] });
});
it.each([
  ['', 'EMPTY_INPUT'],
  ['   ', 'EMPTY_INPUT'],
  ['<Invoice>', 'NOT_XML'],
  ['<!DOCTYPE Invoice><Invoice/>', 'DOCTYPE_FORBIDDEN'],
  ['<Other/>', 'NOT_INVOICE'],
])('TC-M1-034 / UT-38: unacceptable input %s throws %s', (input, code) => {
  expect(() => parseInvoice(input)).toThrow(EfaturaParseError);
  expect(() => parseInvoice(input)).toThrow(expect.objectContaining({ code }));
});
it('TC-M1-034 / UT-38: non-Invoice roots include namespace and the envelope hint', () => {
  expect(() => parseInvoice('<Other xmlns="urn:other"/>')).toThrow(
    expect.objectContaining({ code: 'NOT_INVOICE', details: { root: 'Other', namespace: 'urn:other' } }),
  );
  expect(() =>
    parseInvoice(
      '<StandardBusinessDocument xmlns="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader"/>',
    ),
  ).toThrow(
    expect.objectContaining({
      code: 'NOT_INVOICE',
      details: {
        root: 'StandardBusinessDocument',
        namespace: 'http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader',
        hint: 'envelope',
      },
    }),
  );
  expect(() => parseInvoice('<Other/>')).toThrow(
    expect.objectContaining({ details: { root: 'Other', namespace: 'none' } }),
  );
  expect(() => parseInvoice('<x:Other/>')).toThrow(
    expect.objectContaining({ details: { root: 'Other', namespace: 'prefix:x' } }),
  );
});
it('TC-M1-035 / FR-04 FR-13 / UT-22: mapping diagnostics survive validate false and obey off/overrides applied last', () => {
  const input = `<Invoice xmlns="${NS.inv}" xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}"><cbc:Note>Kur: 35</cbc:Note><cac:LegalMonetaryTotal><cbc:PayableAmount>bad</cbc:PayableAmount></cac:LegalMonetaryTotal></Invoice>`;
  const normal = parseInvoice(input, { validate: false });
  expect(normal.issues.map((i) => i.code)).toEqual(['EF030', 'EF032', 'EF023']);
  const overridden = parseInvoice(input, {
    validate: false,
    rules: { EF030: 'info', EF032: 'off', EF023: 'error' },
  });
  expect(overridden.issues.map((i) => [i.code, i.severity])).toEqual([
    ['EF030', 'info'],
    ['EF023', 'error'],
  ]);
  expect(
    parseInvoice(fullInvoiceXml, { includeRaw: false, attachments: 'metadata', tolerance: '0' }).invoice,
  ).toMatchObject({ raw: null, attachments: [{ base64: null, size: 3 }] });
  expect(parseInvoice(fullInvoiceXml, { tolerance: '0.01' }).issues).toEqual([]);
});
it('TC-M1-035 / UT-22: root namespace issues and repeated fallback events deduplicate', () => {
  const result = parseInvoice(
    '<Invoice><Note>A</Note><Note>B</Note><LineCountNumeric>bad</LineCountNumeric></Invoice>',
  );
  expect(result.issues.filter((i) => i.code === 'EF009')).toHaveLength(2);
  expect(result.issues.find((i) => i.path === '/Invoice' && i.code === 'EF009')).toMatchObject({
    code: 'EF009',
    details: { expected: NS.inv, actual: 'none' },
  });
  expect(parseInvoice('<x:Invoice/>').issues.find((issue) => issue.code === 'EF009')?.details).toEqual({
    expected: NS.inv,
    actual: 'prefix:x',
  });
});
it('TC-M1-035 / UT-22: issue deduplication and code-point path/code sorting precede overrides', () => {
  const actual = mapping.mapInvoice;
  vi.spyOn(mapping, 'mapInvoice').mockImplementation((root, ctx) => {
    const value = actual(root, ctx);
    const base = { severity: 'warning' as const, message: 'test diagnostic', messageTr: 'test diagnostic' };
    ctx.issues.push(
      { ...base, code: 'EF032', path: '/Invoice/b' },
      { ...base, code: 'EF031', path: '/Invoice/A' },
      { ...base, code: 'EF032', path: '/Invoice/A' },
      { ...base, code: 'EF031', path: '/Invoice/A' },
    );
    return value;
  });
  const result = parseInvoice(`<Invoice xmlns="${NS.inv}"/>`, { validate: false });
  expect(result.issues.map((i) => [i.path, i.code])).toEqual([
    ['/Invoice/A', 'EF031'],
    ['/Invoice/A', 'EF032'],
    ['/Invoice/b', 'EF032'],
  ]);
});
it('TC-M1-035 / UT-22: invalid options throw TypeError and valid rule names are accepted', () => {
  for (const options of [
    null,
    [],
    { validate: 'yes' },
    { includeRaw: 1 },
    { attachments: 'all' },
    { maxBytes: 0 },
    { maxBytes: -1 },
    { maxBytes: NaN },
    { maxBytes: Infinity },
    { maxBytes: '10' },
    { tolerance: '-0.1' },
    { tolerance: 'bad' },
    { tolerance: 1 },
    { rules: null },
    { rules: [] },
    { rules: { EF018: 'off' } },
    { rules: { EF009: 'fatal' } },
  ])
    expect(() => parseInvoice('<Invoice/>', options as unknown as ParseOptions)).toThrow(TypeError);
  for (const code of ISSUE_CODES)
    expect(() => parseInvoice('<Invoice/>', { rules: { [code]: 'off' } })).not.toThrow();
  expect(() => parseInvoice('<Invoice/>', { maxBytes: 9 })).toThrow(
    expect.objectContaining({ code: 'INPUT_TOO_LARGE', details: { size: 10, limit: 9 } }),
  );
  expect(() => parseInvoice('<Invoice/>', { maxBytes: 10 })).not.toThrow();
});
it('TC-M1-036 / FR-16 NFR-09 / UT-23: full model is deterministic, JSON-safe and structured-cloneable', () => {
  const first = parseInvoice(fullInvoiceXml);
  expect(parseInvoice(fullInvoiceXml)).toEqual(first);
  expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  expect(structuredClone(first)).toEqual(first);
});
