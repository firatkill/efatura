import { expect, it } from 'vitest';
import { NS } from '../../src/config';
import { computeTotals } from '../../src/model/computed';
import { createContext } from '../../src/model/context';
import { mapLine } from '../../src/model/line';
import { mapTaxTotal } from '../../src/model/tax';
import { mapTotals } from '../../src/model/totals';
import { mapExchangeRate } from '../../src/model/exchange-rate';
import { parseXmlTree } from '../../src/xml/tree';
const xml = (body: string) =>
  parseXmlTree(`<Root xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</Root>`);
const tax = (code: string, value: string) =>
  `<cac:TaxSubtotal><cbc:TaxAmount currencyID="TRY">${value}</cbc:TaxAmount><cac:TaxCategory><cac:TaxScheme><cbc:TaxTypeCode>${code}</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>`;
const empty = () => ({
  lines: [],
  taxTotals: [],
  withholdingTaxTotals: [],
  totals: mapTotals(null, createContext()),
  currency: null,
  exchangeRate: null,
});
it('TC-M1-030 / FR-08 FR-09 / UT-21: all absent derived totals are null', () => {
  expect(computeTotals(empty())).toEqual({
    sumOfLines: null,
    taxTotal: null,
    kdvTotal: null,
    otvTotal: null,
    otherTaxTotal: null,
    withholdingTotal: null,
    payableTry: null,
  });
});
it('TC-M1-030 / UT-21: exact totals, unknown tax kinds and document withholding precedence', () => {
  const line = mapLine(
    xml(
      '<cbc:LineExtensionAmount currencyID="TRY">0.10</cbc:LineExtensionAmount><cac:WithholdingTaxTotal><cbc:TaxAmount currencyID="TRY">1.00</cbc:TaxAmount></cac:WithholdingTaxTotal>',
    ),
    1,
    createContext(),
    mapTaxTotal,
  );
  const totals = mapTotals(
    xml('<cbc:PayableAmount currencyID="TRY">120.00</cbc:PayableAmount>'),
    createContext(),
  );
  const taxes = mapTaxTotal(
    xml(
      '<cbc:TaxAmount currencyID="TRY">20.50</cbc:TaxAmount>' +
        tax('0015', '20.00') +
        tax('9077', '0.30') +
        tax('UNKNOWN', '0.20'),
    ),
    createContext(),
  );
  const withheld = mapTaxTotal(
    xml('<cbc:TaxAmount currencyID="TRY">10.00</cbc:TaxAmount>'),
    createContext(),
    true,
  );
  const input = {
    lines: [line, line],
    taxTotals: [taxes],
    withholdingTaxTotals: [withheld],
    totals,
    currency: 'TRY',
    exchangeRate: null,
  };
  expect(computeTotals(input)).toEqual({
    sumOfLines: '0.20',
    taxTotal: '20.50',
    kdvTotal: '20.00',
    otvTotal: '0.30',
    otherTaxTotal: '0.20',
    withholdingTotal: '10.00',
    payableTry: '120.00',
  });
  expect(computeTotals({ ...input, withholdingTaxTotals: [] }).withholdingTotal).toBe('2.00');
});
it('TC-M1-030 / UT-21: null amounts are excluded from sums in present groups', () => {
  const line = mapLine(xml(''), 1, createContext(), mapTaxTotal);
  const taxes = mapTaxTotal(
    xml(
      '<cac:TaxSubtotal><cbc:TaxAmount currencyID="TRY">bad</cbc:TaxAmount><cac:TaxCategory><cac:TaxScheme><cbc:TaxTypeCode>0015</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>',
    ),
    createContext(),
  );
  expect(computeTotals({ ...empty(), lines: [line], taxTotals: [taxes] })).toMatchObject({
    sumOfLines: '0',
    taxTotal: '0',
    kdvTotal: '0',
    otvTotal: null,
    otherTaxTotal: null,
    withholdingTotal: null,
    payableTry: null,
  });
});
it('TC-M1-030 / UT-21: payableTry accepts lira aliases, rounds foreign conversion, and requires a valid rate', () => {
  const totals = mapTotals(
    xml('<cbc:PayableAmount currencyID="USD">0.105</cbc:PayableAmount>'),
    createContext(),
  );
  const rate = mapExchangeRate(
    xml('<cac:PricingExchangeRate><cbc:CalculationRate>1</cbc:CalculationRate></cac:PricingExchangeRate>'),
    'USD',
    createContext(),
  );
  for (const currency of ['TRY', 'TL', 'YTL'])
    expect(computeTotals({ ...empty(), totals, currency }).payableTry).toBe('0.105');
  expect(computeTotals({ ...empty(), totals, currency: 'USD', exchangeRate: rate }).payableTry).toBe('0.11');
  expect(computeTotals({ ...empty(), totals, currency: 'USD' }).payableTry).toBeNull();
  const invalid = mapExchangeRate(
    xml('<cac:PricingExchangeRate><cbc:CalculationRate>bad</cbc:CalculationRate></cac:PricingExchangeRate>'),
    'USD',
    createContext(),
  );
  expect(computeTotals({ ...empty(), totals, currency: 'USD', exchangeRate: invalid }).payableTry).toBeNull();
});
