import { RATE_NOTE_PATTERN } from '../config';
import type { ExchangeRate } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { code, decimalValue } from './values';

function fallback(context: MappingContext, rate: string, source: string): void {
  context.issues.push({
    code: 'EF023',
    severity: 'warning',
    path: context.path,
    message: `Exchange rate ${rate} was taken from ${source}, not from PricingExchangeRate.`,
    messageTr: `${rate} döviz kuru PricingExchangeRate yerine ${source} kaynağından alındı.`,
    details: { rate, source },
  });
}

/** Resolve exchange rates in the normative priority order, then inspect notes.
 * @example
 * mapExchangeRate(root, 'USD', context)?.rate;
 */
export function mapExchangeRate(
  root: XmlElement,
  currency: string | null,
  context: MappingContext,
): ExchangeRate | null {
  for (const source of [
    'PricingExchangeRate',
    'TaxExchangeRate',
    'PaymentExchangeRate',
    'PaymentAlternativeExchangeRate',
  ] as const) {
    for (const el of children(root, 'cac', source, context)) {
      const parent = at(context, 'cac', source);
      const rateRaw = textOf(el, 'cbc', 'CalculationRate', parent);
      if (rateRaw === null) continue;
      const rate = decimalValue(rateRaw, at(parent, 'cbc', 'CalculationRate'));
      if (source !== 'PricingExchangeRate') fallback(parent, rateRaw, source);
      return {
        sourceCurrency: code(child(el, 'cbc', 'SourceCurrencyCode', parent)),
        targetCurrency: code(child(el, 'cbc', 'TargetCurrencyCode', parent)),
        rateRaw,
        rate,
        date: textOf(el, 'cbc', 'Date', parent),
        source,
      };
    }
  }
  for (const [i, note] of children(root, 'cbc', 'Note', context).entries()) {
    const match = RATE_NOTE_PATTERN.exec(text(note) ?? '');
    const rateRaw = match?.[1];
    if (rateRaw === undefined) continue;
    fallback(at(context, 'cbc', 'Note', i + 1), rateRaw, 'Note');
    return {
      sourceCurrency: currency,
      targetCurrency: 'TRY',
      rateRaw,
      rate: rateRaw.replace(',', '.'),
      date: null,
      source: 'Note',
    };
  }
  return null;
}
