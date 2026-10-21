import { NS } from '../config';
import { lookupInvoiceType, lookupProfile } from '../codes/lookup';
import type { Invoice } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { bool, code, integer } from './values';

/** Map identity, period and signature presence (TRD §7.3).
 * @example
 * mapIdentity(root, context).number;
 */
export function mapIdentity(
  root: XmlElement,
  context: MappingContext,
): Pick<
  Invoice,
  | 'ublVersionId'
  | 'customizationId'
  | 'profileIdRaw'
  | 'profileId'
  | 'number'
  | 'copyIndicator'
  | 'uuid'
  | 'issueDate'
  | 'issueTime'
  | 'typeCodeRaw'
  | 'typeCode'
  | 'notes'
  | 'currency'
  | 'lineCountNumeric'
  | 'period'
  | 'signed'
> {
  const read = (name: string) => textOf(root, 'cbc', name, context);
  const profileIdRaw = read('ProfileID');
  const typeCodeRaw = read('InvoiceTypeCode');
  const period = child(root, 'cac', 'InvoicePeriod', context);
  const periodContext = at(context, 'cac', 'InvoicePeriod');
  const stack = root.children.filter((el) => el.ns === NS.ext && el.name === 'UBLExtensions');
  let signed = false;
  while (stack.length) {
    const node = stack.pop();
    if (!node) break;
    if (node.ns === NS.ds && node.name === 'Signature') {
      signed = true;
      break;
    }
    for (const item of node.children) stack.push(item);
  }
  return {
    ublVersionId: read('UBLVersionID'),
    customizationId: read('CustomizationID'),
    profileIdRaw,
    profileId: lookupProfile(profileIdRaw),
    number: read('ID'),
    copyIndicator: bool(child(root, 'cbc', 'CopyIndicator', context)),
    uuid: read('UUID'),
    issueDate: read('IssueDate'),
    issueTime: read('IssueTime'),
    typeCodeRaw,
    typeCode: lookupInvoiceType(typeCodeRaw),
    notes: children(root, 'cbc', 'Note', context)
      .map(text)
      .filter((v) => v !== null),
    currency: code(child(root, 'cbc', 'DocumentCurrencyCode', context)),
    lineCountNumeric: integer(
      child(root, 'cbc', 'LineCountNumeric', context),
      at(context, 'cbc', 'LineCountNumeric'),
    ),
    period: period
      ? {
          startDate: textOf(period, 'cbc', 'StartDate', periodContext),
          endDate: textOf(period, 'cbc', 'EndDate', periodContext),
          description: textOf(period, 'cbc', 'Description', periodContext),
        }
      : null,
    signed,
  };
}
