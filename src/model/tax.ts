import { TAX_TYPES, WITHHOLDING_CODES, EXEMPTION_CODES } from '../codes';
import * as decimal from '../decimal/operations';
import type { TaxSubtotal, TaxTotal } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { amount, decimalValue, quantity } from './values';

function subtotal(el: XmlElement, context: MappingContext, withholding: boolean): TaxSubtotal {
  const category = child(el, 'cac', 'TaxCategory', context);
  const categoryContext = at(context, 'cac', 'TaxCategory');
  const scheme = child(category, 'cac', 'TaxScheme', categoryContext);
  const schemeContext = at(categoryContext, 'cac', 'TaxScheme');
  const taxTypeCode = textOf(scheme, 'cbc', 'TaxTypeCode', schemeContext);
  const exemptionReasonCode = textOf(category, 'cbc', 'TaxExemptionReasonCode', categoryContext);
  const percentElement = child(el, 'cbc', 'Percent', context);
  const percent = percentElement
    ? decimalValue(text(percentElement) ?? '', at(context, 'cbc', 'Percent'))
    : null;
  let withholdingRatio: string | null = null;
  if (withholding && percent !== null) {
    const whole = decimal.round(percent, 0);
    if (decimal.eq(percent, whole) && /^(?:[1-9]0|100)$/.test(whole))
      withholdingRatio = `${whole.slice(0, -1)}/10`;
  }
  return {
    taxableAmount: amount(child(el, 'cbc', 'TaxableAmount', context), at(context, 'cbc', 'TaxableAmount')),
    taxAmount: amount(child(el, 'cbc', 'TaxAmount', context), at(context, 'cbc', 'TaxAmount')),
    percent,
    calculationSequence: textOf(el, 'cbc', 'CalculationSequenceNumeric', context),
    perUnitAmount: amount(child(el, 'cbc', 'PerUnitAmount', context), at(context, 'cbc', 'PerUnitAmount')),
    baseUnitMeasure: quantity(
      child(el, 'cbc', 'BaseUnitMeasure', context),
      at(context, 'cbc', 'BaseUnitMeasure'),
    ),
    categoryName: textOf(category, 'cbc', 'Name', categoryContext),
    exemptionReasonCode,
    exemptionReason: textOf(category, 'cbc', 'TaxExemptionReason', categoryContext),
    exemption:
      exemptionReasonCode === null ? null : (EXEMPTION_CODES.get(exemptionReasonCode.toUpperCase()) ?? null),
    taxSchemeName: textOf(scheme, 'cbc', 'Name', schemeContext),
    taxTypeCode,
    taxType:
      taxTypeCode === null
        ? null
        : ((withholding ? WITHHOLDING_CODES : TAX_TYPES).get(taxTypeCode.toUpperCase()) ?? null),
    withholdingRatio,
  };
}
/** Map ordinary or withholding taxes with the corresponding verified code list.
 * @example
 * mapTaxTotal(element, context, true).subtotals[0]?.withholdingRatio; // '5/10'
 */
export function mapTaxTotal(el: XmlElement, context: MappingContext, withholding = false): TaxTotal {
  return {
    taxAmount: amount(child(el, 'cbc', 'TaxAmount', context), at(context, 'cbc', 'TaxAmount')),
    subtotals: children(el, 'cac', 'TaxSubtotal', context).map((value, i) =>
      subtotal(value, at(context, 'cac', 'TaxSubtotal', i + 1), withholding),
    ),
  };
}
