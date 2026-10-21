import { expect, it } from 'vitest';
import { parseInvoice, validateInvoice } from '../../../src';
import type { ExchangeRate, Invoice, IssueCode } from '../../../src/types';
import { CURRENCIES, CURRENCY_CODES } from '../../../src/codes/currencies';
import { validationInvoice, expectedIssue } from '../../helpers/validation';
import { fullInvoiceXml } from '../../helpers/invoice';
const issues = (invoice: Invoice, code: IssueCode) =>
  validateInvoice(invoice).filter((issue) => issue.code === code);
const exchange = (): ExchangeRate => ({
  source: 'PricingExchangeRate',
  sourceCurrency: 'USD',
  targetCurrency: 'TRY',
  rate: '35.1',
  rateRaw: '35.1',
  date: null,
});
it('TC-M2-029 / UT-26 EF020: active ISO membership and TL/YTL alias variants', () => {
  expect(CURRENCY_CODES).toEqual([...CURRENCIES.keys()]);
  const invoice = validationInvoice();
  for (const value of ['UNKNOWN', 'TL', 'YTL']) {
    invoice.currency = value;
    expect(issues(invoice, 'EF020')).toEqual([
      expectedIssue(
        'EF020',
        '/Invoice/cbc:DocumentCurrencyCode',
        { value },
        value === 'UNKNOWN' ? undefined : 'alias',
      ),
    ]);
  }
  for (const value of ['USD', 'TRY', 'JPY', null]) {
    invoice.currency = value;
    expect(issues(invoice, 'EF020')).toEqual([]);
  }
});
it('TC-M2-030 / UT-26 EF021: one invoice-level issue with count and first model-order path', () => {
  const invoice = validationInvoice();
  invoice.paymentTerms = [
    {
      note: null,
      dueDate: null,
      penaltySurchargePercent: null,
      amount: { value: null, raw: 'bad', currency: 'EUR' },
    },
  ];
  invoice.totals.payableAmount = { value: '1', raw: '1', currency: 'TRY' };
  const first = '/Invoice/cac:PaymentTerms[1]/cbc:Amount';
  expect(issues(invoice, 'EF021')).toEqual([
    expectedIssue('EF021', first, { count: '2', currency: 'USD', first }),
  ]);
  invoice.paymentTerms = [];
  invoice.totals.payableAmount.currency = null;
  expect(issues(invoice, 'EF021')).toEqual([]);
  invoice.currency = null;
  expect(issues(invoice, 'EF021')).toEqual([]);
});
it('TC-M2-031 / UT-26 EF022: foreign currency needs a valid rate; TRY and aliases do not', () => {
  const invoice = validationInvoice();
  invoice.exchangeRate = null;
  expect(issues(invoice, 'EF022')).toEqual([
    expectedIssue('EF022', '/Invoice/cac:PricingExchangeRate', { currency: 'USD' }),
  ]);
  invoice.exchangeRate = { ...exchange(), rate: null };
  expect(issues(invoice, 'EF022')).toHaveLength(1);
  invoice.exchangeRate = exchange();
  expect(issues(invoice, 'EF022')).toEqual([]);
  for (const value of ['TRY', 'TL', 'YTL', null]) {
    invoice.currency = value;
    invoice.exchangeRate = null;
    expect(issues(invoice, 'EF022')).toEqual([]);
  }
});
it('TC-M2-032 / UT-26 EF023: fallback mapping is separate from validation', () => {
  const xml = fullInvoiceXml.replaceAll('PricingExchangeRate', 'TaxExchangeRate');
  const result = parseInvoice(xml);
  expect(result.issues.filter((issue) => issue.code === 'EF023')).toEqual([
    {
      ...expectedIssue('EF023', '/Invoice/cac:TaxExchangeRate', { rate: '35.1', source: 'TaxExchangeRate' }),
      details: { rate: '35.1', source: 'TaxExchangeRate' },
    },
  ]);
  expect(issues(result.invoice, 'EF023')).toEqual([]);
  expect(parseInvoice(fullInvoiceXml).issues.filter((issue) => issue.code === 'EF023')).toEqual([]);
});
it('TC-M2-033 / UT-26 EF024: nonpositive rates use their source element path', () => {
  const invoice = validationInvoice();
  for (const value of ['0', '-1']) {
    invoice.exchangeRate = { ...exchange(), rate: value };
    expect(issues(invoice, 'EF024')).toEqual([
      expectedIssue('EF024', '/Invoice/cac:PricingExchangeRate/cbc:CalculationRate', { value }),
    ]);
  }
  invoice.exchangeRate = { ...exchange(), source: 'Note', rate: '0' };
  invoice.notes = ['synthetic', 'Kur: 0'];
  expect(issues(invoice, 'EF024')).toEqual([expectedIssue('EF024', '/Invoice/cbc:Note[2]', { value: '0' })]);
  for (const rate of ['1', null]) {
    invoice.exchangeRate = { ...exchange(), rate };
    expect(issues(invoice, 'EF024')).toEqual([]);
  }
});
it('TC-M2-034 / UT-26 EF025: source and target mismatches, correct currencies and non-pricing sources', () => {
  const invoice = validationInvoice();
  for (const [source, target] of [
    ['EUR', 'TRY'],
    ['USD', 'EUR'],
  ]) {
    if (source === undefined || target === undefined) throw new Error('Missing test vector');
    invoice.exchangeRate = { ...exchange(), sourceCurrency: source, targetCurrency: target };
    expect(issues(invoice, 'EF025')).toEqual([
      expectedIssue('EF025', '/Invoice/cac:PricingExchangeRate', { source, target, currency: 'USD' }),
    ]);
  }
  invoice.exchangeRate = exchange();
  expect(issues(invoice, 'EF025')).toEqual([]);
  invoice.exchangeRate = { ...exchange(), source: 'TaxExchangeRate', sourceCurrency: 'EUR' };
  expect(issues(invoice, 'EF025')).toEqual([]);
  invoice.currency = null;
  expect(issues(invoice, 'EF025')).toEqual([]);
});
it('TC-M2-035 / UT-26 EF026: domestic and alias rates other than one', () => {
  const invoice = validationInvoice();
  for (const currency of ['TRY', 'TL', 'YTL']) {
    invoice.currency = currency;
    expect(issues(invoice, 'EF026')).toEqual([
      expectedIssue('EF026', '/Invoice/cac:PricingExchangeRate/cbc:CalculationRate', { rate: '35.1' }),
    ]);
  }
  invoice.exchangeRate = { ...exchange(), rate: '1.00' };
  expect(issues(invoice, 'EF026')).toEqual([]);
  invoice.exchangeRate = { ...exchange(), rate: null };
  expect(issues(invoice, 'EF026')).toEqual([]);
  expect(issues(validationInvoice(), 'EF026')).toEqual([]);
});
it('TC-M2-034 / D-78 EF025: partial currency inputs render the approved missing-value descriptor', () => {
  const invoice = validationInvoice();
  for (const [source, target] of [
    [null, 'EUR'],
    ['EUR', null],
  ] as const) {
    invoice.exchangeRate = { ...exchange(), sourceCurrency: source, targetCurrency: target };
    expect(issues(invoice, 'EF025')).toEqual([
      expectedIssue('EF025', '/Invoice/cac:PricingExchangeRate', {
        source: source ?? '(none)',
        target: target ?? '(none)',
        currency: 'USD',
      }),
    ]);
  }
  invoice.exchangeRate = { ...exchange(), sourceCurrency: null, targetCurrency: null };
  expect(issues(invoice, 'EF025')).toEqual([]);
});
