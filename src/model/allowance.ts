import type { AllowanceCharge } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { amount, bool, decimalValue } from './values';
/** Map an invoice or line allowance/charge, preserving fractional multipliers.
 * @example
 * mapAllowance(element, context).isCharge; // false
 */
export function mapAllowance(el: XmlElement, context: MappingContext): AllowanceCharge {
  const multiplier = child(el, 'cbc', 'MultiplierFactorNumeric', context);
  return {
    isCharge: bool(child(el, 'cbc', 'ChargeIndicator', context)),
    reasonCode: textOf(el, 'cbc', 'AllowanceChargeReasonCode', context),
    reason: textOf(el, 'cbc', 'AllowanceChargeReason', context),
    multiplierFactor: multiplier
      ? decimalValue(text(multiplier) ?? '', at(context, 'cbc', 'MultiplierFactorNumeric'))
      : null,
    amount: amount(child(el, 'cbc', 'Amount', context), at(context, 'cbc', 'Amount')),
    baseAmount: amount(child(el, 'cbc', 'BaseAmount', context), at(context, 'cbc', 'BaseAmount')),
  };
}
