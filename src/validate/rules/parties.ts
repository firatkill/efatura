import { ANONYMOUS_TCKN } from '../../config';
import { isValidVkn } from '../../ids/vkn';
import { isValidTckn } from '../../ids/tckn';
import { elementPath } from '../../xml/path';
import type { Rule } from '../index';
/** Apply party identity and name rules EF010–EF017.
 * @example
 * partyRules(invoice, context);
 */
export const partyRules: Rule = (invoice, ctx) => {
  const parties = [
    [invoice.supplier, 'AccountingSupplierParty', { en: 'supplier', tr: 'Satıcı' }],
    [invoice.customer, 'AccountingCustomerParty', { en: 'customer', tr: 'Alıcı' }],
    [invoice.buyerCustomer, 'BuyerCustomerParty', { en: 'buyer', tr: 'Asıl alıcı' }],
  ] as const;
  for (const [party, element, role] of parties) {
    if (party === null) continue;
    const path = elementPath(elementPath('/Invoice', 'cac', element), 'cac', 'Party');
    const tax = party.taxId;
    if (tax === null) {
      if (element === 'AccountingSupplierParty') ctx.report('EF010', path);
      if (element === 'AccountingCustomerParty') ctx.report('EF011', path);
    } else {
      const position =
        party.identifiers.findIndex(
          (id) => id.schemeId === tax.schemeRaw && id.value.replace(/\s+/g, '') === tax.value,
        ) + 1;
      const idPath = elementPath(elementPath(path, 'cac', 'PartyIdentification', position), 'cbc', 'ID');
      const format = (tax.scheme === 'VKN' ? /^\d{10}$/ : /^[1-9]\d{10}$/).test(tax.value);
      if (format && tax.scheme === 'VKN' && !isValidVkn(tax.value))
        ctx.report('EF012', idPath, { value: tax.value });
      if (format && tax.scheme === 'TCKN' && tax.value !== ANONYMOUS_TCKN && !isValidTckn(tax.value))
        ctx.report('EF013', idPath, { value: tax.value });
      if (!format) ctx.report('EF014', idPath, { scheme: tax.scheme, value: tax.value });
      if (tax.scheme === 'TCKN' && tax.value === ANONYMOUS_TCKN) ctx.report('EF016', idPath);
    }
    if (party.displayName === null) ctx.report('EF017', path, { role });
  }
};
