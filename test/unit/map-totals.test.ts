import { expect, it } from 'vitest';
import { NS } from '../../src/config';
import { at, createContext } from '../../src/model/context';
import { mapTotals } from '../../src/model/totals';
import { mapPaymentMeans, mapPaymentTerms } from '../../src/model/payment';
import { parseXmlTree } from '../../src/xml/tree';
const xml = (body: string) =>
  parseXmlTree(`<Root xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</Root>`);
const money = (value: string) => ({ value, raw: value, currency: 'TRY' });
it('TC-M1-029 / FR-09 / UT-19: all seven totals map without rounding or floating point', () => {
  const pairs = [
    ['LineExtensionAmount', 'lineExtensionAmount', '100.000'],
    ['TaxExclusiveAmount', 'taxExclusiveAmount', '90.00'],
    ['TaxInclusiveAmount', 'taxInclusiveAmount', '108.00'],
    ['AllowanceTotalAmount', 'allowanceTotalAmount', '10.00'],
    ['ChargeTotalAmount', 'chargeTotalAmount', '1.00'],
    ['PayableRoundingAmount', 'payableRoundingAmount', '-0.005'],
    ['PayableAmount', 'payableAmount', '108.995'],
  ] as const;
  expect(
    mapTotals(
      xml(pairs.map(([tag, , value]) => `<cbc:${tag} currencyID="TRY">${value}</cbc:${tag}>`).join('')),
      createContext(),
    ),
  ).toEqual(Object.fromEntries(pairs.map(([, key, value]) => [key, money(value)])));
  expect(Object.values(mapTotals(null, createContext()))).toEqual(Array.from({ length: 7 }, () => null));
});
it('TC-M1-029 / FR-10 / UT-19: payment means includes nested account, branch and bank fields', () => {
  expect(
    mapPaymentMeans(
      xml(
        '<cbc:PaymentMeansCode>01</cbc:PaymentMeansCode><cbc:PaymentDueDate>2025-12-01</cbc:PaymentDueDate><cbc:PaymentChannelCode>TEST</cbc:PaymentChannelCode><cbc:InstructionNote>synthetic instruction</cbc:InstructionNote><cac:PayeeFinancialAccount><cbc:ID>SYNTHETIC-ACCOUNT</cbc:ID><cbc:CurrencyCode>TRY</cbc:CurrencyCode><cbc:PaymentNote>synthetic payment</cbc:PaymentNote><cac:FinancialInstitutionBranch><cbc:Name>Örnek Şube</cbc:Name><cac:FinancialInstitution><cbc:Name>Örnek Banka</cbc:Name></cac:FinancialInstitution></cac:FinancialInstitutionBranch></cac:PayeeFinancialAccount>',
      ),
      createContext(),
    ),
  ).toEqual({
    code: '01',
    dueDate: '2025-12-01',
    channelCode: 'TEST',
    instructionNote: 'synthetic instruction',
    accountId: 'SYNTHETIC-ACCOUNT',
    accountCurrency: 'TRY',
    paymentNote: 'synthetic payment',
    bankBranchName: 'Örnek Şube',
    bankName: 'Örnek Banka',
  });
  expect(Object.values(mapPaymentMeans(xml(''), createContext()))).toEqual(
    Array.from({ length: 9 }, () => null),
  );
});
it('TC-M1-029 / UT-19: payment terms preserve exact decimals and diagnose an empty present percentage', () => {
  expect(
    mapPaymentTerms(
      xml(
        '<cbc:Note>synthetic terms</cbc:Note><cbc:PenaltySurchargePercent>1.50</cbc:PenaltySurchargePercent><cbc:Amount currencyID="TRY">2.50</cbc:Amount><cbc:PaymentDueDate>2025-12-01</cbc:PaymentDueDate>',
      ),
      createContext(),
    ),
  ).toEqual({
    note: 'synthetic terms',
    penaltySurchargePercent: '1.50',
    amount: money('2.50'),
    dueDate: '2025-12-01',
  });
  expect(mapPaymentTerms(xml(''), createContext())).toEqual({
    note: null,
    penaltySurchargePercent: null,
    amount: null,
    dueDate: null,
  });
  const context = at(createContext(), 'cac', 'PaymentTerms', 1);
  mapPaymentTerms(xml('<cbc:PenaltySurchargePercent/>'), context);
  expect(context.issues).toEqual([
    {
      code: 'EF030',
      severity: 'error',
      path: '/Invoice/cac:PaymentTerms[1]/cbc:PenaltySurchargePercent',
      message: ' is not a valid number.',
      messageTr: ' geçerli bir sayı değil.',
      details: { value: '' },
    },
  ]);
});
