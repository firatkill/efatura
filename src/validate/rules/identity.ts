import { EXPECTED_UBL_VERSION, EXPECTED_CUSTOMIZATION_IDS } from '../../config';
import { isValidUuid } from '../../ids/uuid';
import { elementPath } from '../../xml/path';
import type { Rule } from '../index';

function validDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number.parseInt(value.slice(0, 4), 10);
  const month = Number.parseInt(value.slice(5, 7), 10);
  const day = Number.parseInt(value.slice(8, 10), 10);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return year > 0 && days !== undefined && day > 0 && day <= days;
}
/** Apply required-field and identity rules EF001–EF008.
 * @example
 * identityRules(invoice, context);
 */
export const identityRules: Rule = (invoice, ctx) => {
  const required = {
    'cbc:UBLVersionID': invoice.ublVersionId,
    'cbc:CustomizationID': invoice.customizationId,
    'cbc:ProfileID': invoice.profileIdRaw,
    'cbc:ID': invoice.number,
    'cbc:UUID': invoice.uuid,
    'cbc:IssueDate': invoice.issueDate,
    'cbc:InvoiceTypeCode': invoice.typeCodeRaw,
    'cbc:DocumentCurrencyCode': invoice.currency,
    'cac:AccountingSupplierParty': invoice.supplier,
    'cac:AccountingCustomerParty': invoice.customer,
    'cac:LegalMonetaryTotal': Object.values(invoice.totals).every((value) => value === null)
      ? null
      : invoice.totals,
    'cac:LegalMonetaryTotal/cbc:LineExtensionAmount': invoice.totals.lineExtensionAmount,
    'cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount': invoice.totals.taxExclusiveAmount,
    'cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount': invoice.totals.taxInclusiveAmount,
    'cac:LegalMonetaryTotal/cbc:PayableAmount': invoice.totals.payableAmount,
  };
  for (const [field, value] of Object.entries(required)) {
    if (value === null || value === '') ctx.report('EF001', `/Invoice/${field}`, { field });
  }
  const path = (name: string) => elementPath('/Invoice', 'cbc', name);
  if (invoice.uuid !== null && !isValidUuid(invoice.uuid))
    ctx.report('EF002', path('UUID'), { value: invoice.uuid });
  const dateValid = invoice.issueDate !== null && validDate(invoice.issueDate);
  if (invoice.number !== null) {
    if (!/^[A-Z0-9]{3}\d{13}$/.test(invoice.number))
      ctx.report('EF003', path('ID'), { value: invoice.number }, undefined, 'pattern');
    else if (dateValid && invoice.number.slice(3, 7) !== invoice.issueDate?.slice(0, 4))
      ctx.report(
        'EF003',
        path('ID'),
        { numberYear: invoice.number.slice(3, 7), dateYear: invoice.issueDate?.slice(0, 4) ?? '' },
        undefined,
        'year',
      );
  }
  if (invoice.issueDate !== null && !dateValid)
    ctx.report('EF004', path('IssueDate'), { value: invoice.issueDate });
  if (
    invoice.issueTime !== null &&
    !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-](0\d|1[0-4]):[0-5]\d)?$/.test(invoice.issueTime)
  )
    ctx.report('EF005', path('IssueTime'), { value: invoice.issueTime });
  if (invoice.profileIdRaw !== null && invoice.profileId === 'OTHER')
    ctx.report('EF006', path('ProfileID'), { value: invoice.profileIdRaw });
  if (invoice.typeCodeRaw !== null && invoice.typeCode === 'OTHER')
    ctx.report('EF007', path('InvoiceTypeCode'), { value: invoice.typeCodeRaw });
  if (invoice.ublVersionId !== null && invoice.ublVersionId !== EXPECTED_UBL_VERSION)
    ctx.report('EF008', path('UBLVersionID'), {
      field: 'UBLVersionID',
      value: invoice.ublVersionId,
      expected: EXPECTED_UBL_VERSION,
    });
  if (
    invoice.customizationId !== null &&
    !EXPECTED_CUSTOMIZATION_IDS.some((id) => id === invoice.customizationId)
  )
    ctx.report('EF008', path('CustomizationID'), {
      field: 'CustomizationID',
      value: invoice.customizationId,
      expected: EXPECTED_CUSTOMIZATION_IDS.join(' or '),
    });
};
