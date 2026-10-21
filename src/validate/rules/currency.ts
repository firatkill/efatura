import { CURRENCY_CODES } from '../../codes/currencies';
import { RATE_NOTE_PATTERN, TRY_ALIASES } from '../../config';
import * as d from '../../decimal/operations';
import { elementPath } from '../../xml/path';
import { walkAmounts } from './amounts';
import type { Rule } from '../index';
/** Apply currency and exchange-rate validation rules EF020–EF026.
 * @example
 * currencyRules(invoice, context);
 */
export const currencyRules: Rule = (invoice, ctx) => {
  const currency = invoice.currency;
  const alias = currency !== null && TRY_ALIASES.some((value) => value === currency);
  const domestic = currency === 'TRY' || alias;
  if (currency !== null) {
    if (!CURRENCY_CODES.includes(currency))
      ctx.report(
        'EF020',
        '/Invoice/cbc:DocumentCurrencyCode',
        { value: currency },
        undefined,
        alias ? 'alias' : undefined,
      );
    const mismatches = [...walkAmounts(invoice)].filter(
      ({ amount }) => amount.currency !== null && amount.currency !== currency,
    );
    const first = mismatches[0];
    if (first)
      ctx.report('EF021', first.path, { count: String(mismatches.length), currency, first: first.path });
    if (!domestic && (invoice.exchangeRate?.rate ?? null) === null)
      ctx.report('EF022', '/Invoice/cac:PricingExchangeRate', { currency });
  }
  const exchange = invoice.exchangeRate;
  if (exchange === null) return;
  const ratePath =
    exchange.source === 'Note'
      ? elementPath(
          '/Invoice',
          'cbc',
          'Note',
          invoice.notes.findIndex((note) => RATE_NOTE_PATTERN.test(note)) + 1,
        )
      : elementPath(elementPath('/Invoice', 'cac', exchange.source), 'cbc', 'CalculationRate');
  if (exchange.rate !== null && d.cmp(exchange.rate, '0') <= 0)
    ctx.report('EF024', ratePath, { value: exchange.rate });
  if (
    exchange.source === 'PricingExchangeRate' &&
    currency !== null &&
    ((exchange.sourceCurrency !== null && exchange.sourceCurrency !== currency) ||
      (exchange.targetCurrency !== null && exchange.targetCurrency !== 'TRY'))
  ) {
    ctx.report('EF025', '/Invoice/cac:PricingExchangeRate', {
      source: exchange.sourceCurrency ?? '(none)',
      target: exchange.targetCurrency ?? '(none)',
      currency,
    });
  }
  if (domestic && exchange.rate !== null && !d.eq(exchange.rate, '1'))
    ctx.report('EF026', ratePath, { rate: exchange.rate });
};
