import type { MonetaryTotals } from '../types';
import type { XmlElement } from '../xml/tree';
import { child } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { amount } from './values';
/** Map every monetary-total field, retaining an object even when the aggregate is absent.
 * @example
 * mapTotals(null, context).payableAmount; // null
 */
export function mapTotals(el: XmlElement | null, context: MappingContext): MonetaryTotals {
  const read = (name: string) => amount(child(el, 'cbc', name, context), at(context, 'cbc', name));
  return {
    lineExtensionAmount: read('LineExtensionAmount'),
    taxExclusiveAmount: read('TaxExclusiveAmount'),
    taxInclusiveAmount: read('TaxInclusiveAmount'),
    allowanceTotalAmount: read('AllowanceTotalAmount'),
    chargeTotalAmount: read('ChargeTotalAmount'),
    payableRoundingAmount: read('PayableRoundingAmount'),
    payableAmount: read('PayableAmount'),
  };
}
