import { expect, it, vi } from 'vitest';
import { NS } from '../../src/config';
import { UNIT_CODES } from '../../src/codes';
import { at, createContext } from '../../src/model/context';
import { mapLine } from '../../src/model/line';
import { mapAllowance } from '../../src/model/allowance';
import type { TaxSubtotal, TaxTotal } from '../../src/types';
import { parseXmlTree } from '../../src/xml/tree';
const line = (body: string) =>
  parseXmlTree(`<cac:InvoiceLine xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</cac:InvoiceLine>`);
const context = () =>
  at(
    createContext({}, (code) => UNIT_CODES.get(code) ?? null),
    'cac',
    'InvoiceLine',
    2,
  );
const money = (value: string) => ({ value, raw: value, currency: 'TRY' });
const unusedTax = (): TaxTotal => {
  throw new Error('No tax mapping expected');
};

it('TC-M1-026 / FR-07 / UT-17: maps every item, price, allowance and delivery field', () => {
  const result = mapLine(
    line(`<cbc:ID>LINE-A</cbc:ID><cbc:Note> first </cbc:Note><cbc:Note> </cbc:Note><cbc:Note>second</cbc:Note>
    <cbc:InvoicedQuantity unitCode=" c62 ">2.00</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="try">18.00</cbc:LineExtensionAmount>
    <cac:AllowanceCharge><cbc:ChargeIndicator>false</cbc:ChargeIndicator><cbc:AllowanceChargeReasonCode>TEST</cbc:AllowanceChargeReasonCode><cbc:AllowanceChargeReason>synthetic discount</cbc:AllowanceChargeReason><cbc:MultiplierFactorNumeric>0.1</cbc:MultiplierFactorNumeric><cbc:Amount currencyID="TRY">2.00</cbc:Amount><cbc:BaseAmount currencyID="TRY">20.00</cbc:BaseAmount></cac:AllowanceCharge>
    <cac:Item><cbc:Name>Örnek Ürün</cbc:Name><cbc:Description>synthetic item</cbc:Description><cbc:Keyword>example</cbc:Keyword><cbc:BrandName>Örnek</cbc:BrandName><cbc:ModelName>Test</cbc:ModelName><cac:BuyersItemIdentification><cbc:ID>BUY-A</cbc:ID></cac:BuyersItemIdentification><cac:SellersItemIdentification><cbc:ID>SELL-A</cbc:ID></cac:SellersItemIdentification><cac:ManufacturersItemIdentification><cbc:ID>MAKE-A</cbc:ID></cac:ManufacturersItemIdentification><cac:CommodityClassification><cbc:ItemClassificationCode listID=" test "> A </cbc:ItemClassificationCode></cac:CommodityClassification><cac:CommodityClassification><cbc:ItemClassificationCode>B</cbc:ItemClassificationCode></cac:CommodityClassification><cac:OriginCountry><cbc:IdentificationCode>tr</cbc:IdentificationCode></cac:OriginCountry></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">10.00</cbc:PriceAmount><cbc:BaseQuantity unitCode="C62">1</cbc:BaseQuantity></cac:Price>
    <cac:Delivery><cac:DeliveryTerms><cbc:ID>other</cbc:ID></cac:DeliveryTerms><cac:DeliveryTerms><cbc:ID schemeID="INCOTERMS">CIF</cbc:ID></cac:DeliveryTerms><cac:Shipment><cac:GoodsItem><cbc:RequiredCustomsID>TEST-GTIP</cbc:RequiredCustomsID></cac:GoodsItem><cac:ShipmentStage><cbc:TransportModeCode>1</cbc:TransportModeCode></cac:ShipmentStage><cac:TransportHandlingUnit><cac:ActualPackage><cbc:PackagingTypeCode>BX</cbc:PackagingTypeCode></cac:ActualPackage></cac:TransportHandlingUnit></cac:Shipment><cac:DeliveryAddress><cbc:StreetName>Örnek Sokak</cbc:StreetName><cac:Country><cbc:IdentificationCode>tr</cbc:IdentificationCode></cac:Country></cac:DeliveryAddress></cac:Delivery><cac:Delivery><cac:DeliveryTerms><cbc:ID>ignored</cbc:ID></cac:DeliveryTerms></cac:Delivery>`),
    2,
    context(),
    unusedTax,
  );
  expect(result).toMatchObject({
    position: 2,
    id: 'LINE-A',
    notes: ['first', 'second'],
    quantity: { value: '2.00', raw: '2.00', unitCode: 'C62', unit: UNIT_CODES.get('C62') },
    lineExtensionAmount: money('18.00'),
    allowanceCharges: [
      {
        isCharge: false,
        reasonCode: 'TEST',
        reason: 'synthetic discount',
        multiplierFactor: '0.1',
        amount: money('2.00'),
        baseAmount: money('20.00'),
      },
    ],
    item: {
      name: 'Örnek Ürün',
      description: 'synthetic item',
      keyword: 'example',
      brandName: 'Örnek',
      modelName: 'Test',
      buyersItemId: 'BUY-A',
      sellersItemId: 'SELL-A',
      manufacturersItemId: 'MAKE-A',
      classificationCodes: [
        { listId: 'test', value: 'A' },
        { listId: null, value: 'B' },
      ],
      originCountryCode: 'TR',
    },
    price: {
      amount: money('10.00'),
      baseQuantity: { value: '1', raw: '1', unitCode: 'C62', unit: UNIT_CODES.get('C62') },
    },
    delivery: {
      incoterms: 'CIF',
      customsTariffCode: 'TEST-GTIP',
      transportModeCode: '1',
      packagingTypeCode: 'BX',
      deliveryAddress: { streetName: 'Örnek Sokak', countryCode: 'TR' },
    },
    taxTotal: null,
    withholdingTaxTotals: [],
  });
  expect(JSON.parse(JSON.stringify(result))).toEqual(result);
});
it('TC-M1-026 / UT-17: absent aggregates and incoterms fallback follow value conventions', () => {
  const empty = mapLine(line(''), 1, context(), unusedTax);
  expect(empty).toMatchObject({
    position: 1,
    id: null,
    notes: [],
    quantity: null,
    lineExtensionAmount: null,
    allowanceCharges: [],
    taxTotal: null,
    withholdingTaxTotals: [],
    price: null,
    delivery: null,
  });
  expect(empty.item).toEqual({
    name: null,
    description: null,
    keyword: null,
    brandName: null,
    modelName: null,
    buyersItemId: null,
    sellersItemId: null,
    manufacturersItemId: null,
    classificationCodes: [],
    originCountryCode: null,
  });
  expect(
    mapLine(
      line(
        '<cac:Delivery><cac:DeliveryTerms><cbc:ID>first</cbc:ID></cac:DeliveryTerms><cac:DeliveryTerms><cbc:ID>second</cbc:ID></cac:DeliveryTerms></cac:Delivery><cac:Price/>',
      ),
      1,
      context(),
      unusedTax,
    ),
  ).toMatchObject({
    delivery: {
      incoterms: 'first',
      customsTariffCode: null,
      transportModeCode: null,
      packagingTypeCode: null,
      deliveryAddress: null,
    },
    price: { amount: null, baseQuantity: null },
  });
  expect(mapLine(line('<cac:Delivery/>'), 1, context(), unusedTax).delivery?.incoterms).toBeNull();
});
it('TC-M1-026 / FR-09 / UT-17: allowance nulls, charge booleans and decimal diagnostics', () => {
  expect(mapAllowance(line(''), context())).toEqual({
    isCharge: null,
    reasonCode: null,
    reason: null,
    multiplierFactor: null,
    amount: null,
    baseAmount: null,
  });
  const ctx = context();
  expect(
    mapAllowance(
      line(
        '<cbc:ChargeIndicator>TRUE</cbc:ChargeIndicator><cbc:MultiplierFactorNumeric> </cbc:MultiplierFactorNumeric>',
      ),
      ctx,
    ).isCharge,
  ).toBe(true);
  expect(ctx.issues).toEqual([
    {
      code: 'EF030',
      severity: 'error',
      path: '/Invoice/cac:InvoiceLine[2]/cbc:MultiplierFactorNumeric',
      message: ' is not a valid number.',
      messageTr: ' geçerli bir sayı değil.',
      details: { value: '' },
    },
  ]);
});
const subtotal = (name: string): TaxSubtotal => ({
  taxableAmount: null,
  taxAmount: null,
  percent: null,
  calculationSequence: null,
  perUnitAmount: null,
  baseUnitMeasure: null,
  categoryName: name,
  exemptionReasonCode: null,
  exemptionReason: null,
  exemption: null,
  taxSchemeName: null,
  taxTypeCode: null,
  taxType: null,
  withholdingRatio: null,
});
it('TC-M1-027 / FR-07 / UT-17: merges taxes exactly and keeps withholding separate', () => {
  const first = { taxAmount: money('0.10'), subtotals: [subtotal('first')] };
  const second = {
    taxAmount: { value: '0.20', raw: '0,20', currency: 'USD' },
    subtotals: [subtotal('second')],
  };
  const withheld = { taxAmount: money('0.05'), subtotals: [subtotal('withheld')] };
  const mapper = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second).mockReturnValueOnce(withheld);
  const result = mapLine(
    line('<cac:TaxTotal/><cac:TaxTotal/><cac:WithholdingTaxTotal/>'),
    2,
    context(),
    mapper,
  );
  expect(result.taxTotal).toEqual({
    taxAmount: { value: '0.30', raw: '0.10+0,20', currency: 'TRY' },
    subtotals: [subtotal('first'), subtotal('second')],
  });
  expect(result.withholdingTaxTotals).toEqual([withheld]);
  expect(mapper.mock.calls.map((call: unknown[]) => [(call[1] as { path: string }).path, call[2]])).toEqual([
    ['/Invoice/cac:InvoiceLine[2]/cac:TaxTotal[1]', false],
    ['/Invoice/cac:InvoiceLine[2]/cac:TaxTotal[2]', false],
    ['/Invoice/cac:InvoiceLine[2]/cac:WithholdingTaxTotal[1]', true],
  ]);
  expect(mapLine(line('<cac:TaxTotal/>'), 1, context(), () => first).taxTotal).toBe(first);
});
