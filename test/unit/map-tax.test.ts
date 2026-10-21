import { expect, it } from 'vitest';
import { NS } from '../../src/config';
import { EXEMPTION_CODES, TAX_TYPES, UNIT_CODES, WITHHOLDING_CODES } from '../../src/codes';
import { at, createContext } from '../../src/model/context';
import { mapTaxTotal } from '../../src/model/tax';
import { mapLine } from '../../src/model/line';
import { parseXmlTree } from '../../src/xml/tree';
const xml = (body: string) =>
  parseXmlTree(`<Root xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</Root>`);
const context = () =>
  at(
    createContext({}, (code) => UNIT_CODES.get(code) ?? null),
    'cac',
    'TaxTotal',
  );
const money = (value: string) => ({ value, raw: value, currency: 'TRY' });
it('TC-M1-028 / FR-08 / UT-18: maps every tax subtotal field and verified labels', () => {
  const result = mapTaxTotal(
    xml(
      '<cbc:TaxAmount currencyID="TRY">20.00</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="TRY">100.00</cbc:TaxableAmount><cbc:TaxAmount currencyID="TRY">20.00</cbc:TaxAmount><cbc:CalculationSequenceNumeric>01</cbc:CalculationSequenceNumeric><cbc:Percent>20.00</cbc:Percent><cbc:BaseUnitMeasure unitCode="C62">2</cbc:BaseUnitMeasure><cbc:PerUnitAmount currencyID="TRY">10.00</cbc:PerUnitAmount><cac:TaxCategory><cbc:Name>synthetic category</cbc:Name><cbc:TaxExemptionReasonCode>301</cbc:TaxExemptionReasonCode><cbc:TaxExemptionReason>synthetic exemption</cbc:TaxExemptionReason><cac:TaxScheme><cbc:Name>KDV</cbc:Name><cbc:TaxTypeCode>0015</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>',
    ),
    context(),
  );
  expect(result).toEqual({
    taxAmount: money('20.00'),
    subtotals: [
      {
        taxableAmount: money('100.00'),
        taxAmount: money('20.00'),
        calculationSequence: '01',
        percent: '20.00',
        baseUnitMeasure: { value: '2', raw: '2', unitCode: 'C62', unit: UNIT_CODES.get('C62') },
        perUnitAmount: money('10.00'),
        categoryName: 'synthetic category',
        exemptionReasonCode: '301',
        exemptionReason: 'synthetic exemption',
        exemption: EXEMPTION_CODES.get('301'),
        taxSchemeName: 'KDV',
        taxTypeCode: '0015',
        taxType: TAX_TYPES.get('0015'),
        withholdingRatio: null,
      },
    ],
  });
});
it.each([
  ['50', '5/10'],
  ['90', '9/10'],
  ['25', null],
  ['100', '10/10'],
  ['50.00', '5/10'],
  ['10', '1/10'],
  ['0', null],
  ['110', null],
  ['-10', null],
  ['50.5', null],
])('TC-M1-028 / UT-18: withholding percent %s produces %s', (percent, ratio) => {
  const result = mapTaxTotal(
    xml(
      `<cac:TaxSubtotal><cbc:Percent>${percent}</cbc:Percent><cac:TaxCategory><cac:TaxScheme><cbc:TaxTypeCode>601</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>`,
    ),
    context(),
    true,
  );
  expect(result.subtotals[0]?.withholdingRatio).toBe(ratio);
  expect(result.subtotals[0]?.taxType).toEqual(WITHHOLDING_CODES.get('601'));
});
it('TC-M1-028 / UT-18: missing values, unknown codes and invalid percent retain their prescribed nulls', () => {
  expect(mapTaxTotal(xml(''), context())).toEqual({ taxAmount: null, subtotals: [] });
  const missing = mapTaxTotal(xml('<cac:TaxSubtotal/>'), context(), true).subtotals[0];
  expect(missing).toEqual({
    taxableAmount: null,
    taxAmount: null,
    percent: null,
    calculationSequence: null,
    perUnitAmount: null,
    baseUnitMeasure: null,
    categoryName: null,
    exemptionReasonCode: null,
    exemptionReason: null,
    exemption: null,
    taxSchemeName: null,
    taxTypeCode: null,
    taxType: null,
    withholdingRatio: null,
  });
  const ctx = context();
  const unknown = mapTaxTotal(
    xml(
      '<cac:TaxSubtotal><cbc:Percent/><cac:TaxCategory><cbc:TaxExemptionReasonCode>UNKNOWN</cbc:TaxExemptionReasonCode><cac:TaxScheme><cbc:TaxTypeCode>UNKNOWN</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>',
    ),
    ctx,
    true,
  ).subtotals[0];
  expect(unknown).toMatchObject({
    percent: null,
    taxTypeCode: 'UNKNOWN',
    taxType: null,
    exemptionReasonCode: 'UNKNOWN',
    exemption: null,
    withholdingRatio: null,
  });
  expect(ctx.issues).toEqual([
    {
      code: 'EF030',
      severity: 'error',
      path: '/Invoice/cac:TaxTotal/cac:TaxSubtotal[1]/cbc:Percent',
      message: ' is not a valid number.',
      messageTr: ' geçerli bir sayı değil.',
      details: { value: '' },
    },
  ]);
});
it('TC-M1-027 / UT-17: actual tax mapping integrates with line merging and separate withholding', () => {
  const result = mapLine(
    xml(
      '<cac:TaxTotal><cbc:TaxAmount currencyID="TRY">20</cbc:TaxAmount></cac:TaxTotal><cac:TaxTotal><cbc:TaxAmount currencyID="TRY">5</cbc:TaxAmount></cac:TaxTotal><cac:WithholdingTaxTotal><cbc:TaxAmount currencyID="TRY">10</cbc:TaxAmount><cac:TaxSubtotal><cbc:Percent>50.00</cbc:Percent><cac:TaxCategory><cac:TaxScheme><cbc:TaxTypeCode>601</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:WithholdingTaxTotal>',
    ),
    1,
    createContext(),
    mapTaxTotal,
  );
  expect(result.taxTotal?.taxAmount).toEqual({ value: '25', raw: '20+5', currency: 'TRY' });
  expect(result.withholdingTaxTotals[0]?.taxAmount).toEqual(money('10'));
  expect(result.withholdingTaxTotals[0]?.subtotals[0]?.withholdingRatio).toBe('5/10');
});
