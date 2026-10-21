import { expect, it } from 'vitest';
import { NS } from '../../src/config';
import { createContext } from '../../src/model/context';
import { mapExchangeRate } from '../../src/model/exchange-rate';
import { mapDueDate } from '../../src/model/payment';
import { parseXmlTree } from '../../src/xml/tree';
const root = (body: string) =>
  parseXmlTree(`<Invoice xmlns="${NS.inv}" xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</Invoice>`);
const candidate = (name: string, value: string) =>
  `<cac:${name}><cbc:SourceCurrencyCode> usd </cbc:SourceCurrencyCode><cbc:TargetCurrencyCode> try </cbc:TargetCurrencyCode><cbc:CalculationRate>${value}</cbc:CalculationRate><cbc:Date>2025-11-29</cbc:Date></cac:${name}>`;

it('TC-M1-021 / FR-11 / UT-15: follows source priority and preserves raw values', () => {
  const sources = [
    'PricingExchangeRate',
    'TaxExchangeRate',
    'PaymentExchangeRate',
    'PaymentAlternativeExchangeRate',
  ] as const;
  for (const [i, source] of sources.entries()) {
    const context = createContext();
    const xml =
      sources
        .slice(0, i)
        .map((s) => candidate(s, ' '))
        .join('') +
      candidate(source, '35.10') +
      candidate('PaymentAlternativeExchangeRate', '99') +
      '<cbc:Note>Kur: 1</cbc:Note>';
    expect(mapExchangeRate(root(xml), 'USD', context)).toEqual({
      sourceCurrency: 'USD',
      targetCurrency: 'TRY',
      rateRaw: '35.10',
      rate: '35.10',
      date: '2025-11-29',
      source,
    });
    expect(context.issues).toEqual(
      i === 0
        ? []
        : [
            {
              code: 'EF023',
              severity: 'warning',
              path: `/Invoice/cac:${source}`,
              message: `Exchange rate 35.10 was taken from ${source}, not from PricingExchangeRate.`,
              messageTr: `35.10 döviz kuru PricingExchangeRate yerine ${source} kaynağından alındı.`,
              details: { rate: '35.10', source },
            },
          ],
    );
  }
});
it('TC-M1-021 / UT-15: first nonempty candidate wins even when invalid, including TRY invoices', () => {
  const context = createContext();
  expect(
    mapExchangeRate(
      root(candidate('PricingExchangeRate', 'bad') + candidate('TaxExchangeRate', '35')),
      'TRY',
      context,
    )?.rate,
  ).toBeNull();
  expect(context.issues).toEqual([
    {
      code: 'EF030',
      severity: 'error',
      path: '/Invoice/cac:PricingExchangeRate/cbc:CalculationRate',
      message: 'bad is not a valid number.',
      messageTr: 'bad geçerli bir sayı değil.',
      details: { value: 'bad' },
    },
  ]);
  const comma = createContext();
  expect(
    mapExchangeRate(
      root(
        '<cac:PricingExchangeRate><cbc:CalculationRate>35,1</cbc:CalculationRate></cac:PricingExchangeRate>',
      ),
      'TRY',
      comma,
    ),
  ).toEqual({
    sourceCurrency: null,
    targetCurrency: null,
    rateRaw: '35,1',
    rate: '35.1',
    date: null,
    source: 'PricingExchangeRate',
  });
  expect(comma.issues[0]).toMatchObject({
    code: 'EF031',
    path: '/Invoice/cac:PricingExchangeRate/cbc:CalculationRate',
  });
  expect(mapExchangeRate(root(candidate('PricingExchangeRate', ' ')), 'USD', createContext())).toBeNull();
});
it.each([
  ['Döviz Kuru:40,6467', '40,6467', '40.6467'],
  ['DÖVİZ KURU = 35.1', '35.1', '35.1'],
  ['Exchange rate: 1.5', '1.5', '1.5'],
  ['Kur: 30', '30', '30'],
])('TC-M1-022 / FR-11 / UT-15: parses note %s without EF031', (note, raw, rate) => {
  const context = createContext();
  expect(
    mapExchangeRate(
      root(`<cbc:Note> </cbc:Note><cbc:Note>${note}</cbc:Note><cbc:Note>Kur: 99</cbc:Note>`),
      'EUR',
      context,
    ),
  ).toEqual({ sourceCurrency: 'EUR', targetCurrency: 'TRY', rateRaw: raw, rate, date: null, source: 'Note' });
  expect(context.issues).toEqual([
    {
      code: 'EF023',
      severity: 'warning',
      path: '/Invoice/cbc:Note[2]',
      message: `Exchange rate ${raw} was taken from Note, not from PricingExchangeRate.`,
      messageTr: `${raw} döviz kuru PricingExchangeRate yerine Note kaynağından alındı.`,
      details: { rate: raw, source: 'Note' },
    },
  ]);
});
it('TC-M1-022 / UT-15: ignores Kurum and keeps absent currency null', () => {
  expect(mapExchangeRate(root('<cbc:Note>Kurum: 12</cbc:Note>'), 'TRY', createContext())).toBeNull();
  expect(
    mapExchangeRate(root('<cbc:Note>Kur: 30</cbc:Note>'), null, createContext())?.sourceCurrency,
  ).toBeNull();
});
it('TC-M1-023 / FR-10 / UT-15: payment means precede terms and notes; XML dates retain text', () => {
  const note = '<cbc:Note>Vade Tarihi: 1.12.2025</cbc:Note>';
  const terms = '<cac:PaymentTerms><cbc:PaymentDueDate>2025-12-02</cbc:PaymentDueDate></cac:PaymentTerms>';
  expect(
    mapDueDate(
      root(
        note +
          terms +
          '<cac:PaymentMeans/><cac:PaymentMeans><cbc:PaymentDueDate>2025-12-03</cbc:PaymentDueDate></cac:PaymentMeans>',
      ),
      createContext(),
    ),
  ).toEqual({ date: '2025-12-03', source: 'PaymentMeans' });
  expect(mapDueDate(root(note + '<cac:PaymentTerms/>' + terms), createContext())).toEqual({
    date: '2025-12-02',
    source: 'PaymentTerms',
  });
  expect(
    mapDueDate(
      root('<cac:PaymentMeans><cbc:PaymentDueDate>not-a-date</cbc:PaymentDueDate></cac:PaymentMeans>'),
      createContext(),
    ),
  ).toEqual({ date: 'not-a-date', source: 'PaymentMeans' });
});
it.each([
  ['VADE TARİHİ: 01.12.2025', '2025-12-01'],
  ['vade tarihi 1/2/2025', '2025-02-01'],
  ['Vade Tarihi=1-2-2025', '2025-02-01'],
  ['Vade Tarihi: 2025-12-01', '2025-12-01'],
  ['Vade tarihi: 29.02.2024', '2024-02-29'],
  ['Vade tarihi: 29.02.2000', '2000-02-29'],
])('TC-M1-023 / UT-15: normalizes valid note %s', (note, date) => {
  expect(mapDueDate(root(`<cbc:Note>${note}</cbc:Note>`), createContext())).toEqual({ date, source: 'Note' });
});
it('TC-M1-023 / UT-15: rejects impossible calendar dates and applies note-format precedence', () => {
  for (const note of [
    'Vade tarihi: 29.02.2025',
    'Vade tarihi: 29.02.1900',
    'Vade tarihi: 31.04.2025',
    'Vade tarihi: 00.01.2025',
    'Vade tarihi: 01.13.2025',
    'Vade tarihi: 2025-00-01',
    'unrelated',
    '',
  ])
    expect(mapDueDate(root(`<cbc:Note>${note}</cbc:Note>`), createContext())).toBeNull();
  expect(
    mapDueDate(
      root(
        '<cbc:Note>Vade tarihi: 2025-12-01</cbc:Note><cbc:Note>Vade tarihi: 31.02.2025</cbc:Note><cbc:Note>Vade tarihi: 2.12.2025</cbc:Note>',
      ),
      createContext(),
    ),
  ).toEqual({ date: '2025-12-02', source: 'Note' });
  expect(mapDueDate(root(''), createContext())).toBeNull();
});
