import type { Invoice } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, children } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { mapIdentity } from './identity';
import { mapReferences } from './references';
import { mapParty } from './party';
import { mapLine } from './line';
import { mapTaxTotal } from './tax';
import { mapTotals } from './totals';
import { mapAllowance } from './allowance';
import { mapPaymentMeans, mapPaymentTerms, mapDueDate } from './payment';
import { mapExchangeRate } from './exchange-rate';
import { mapAttachments } from './attachments';
import { computeTotals } from './computed';
/** Compose all invoice model sections from the namespace-resolved tree.
 * @example
 * mapInvoice(root, context).lines;
 */
export function mapInvoice(root: XmlElement, context: MappingContext): Invoice {
  const identity = mapIdentity(root, context);
  const party = (name: string) => {
    const parent = child(root, 'cac', name, context),
      parentContext = at(context, 'cac', name);
    return mapParty(child(parent, 'cac', 'Party', parentContext), at(parentContext, 'cac', 'Party'));
  };
  const fields = {
    ...identity,
    ...mapReferences(root, context),
    exchangeRate: mapExchangeRate(root, identity.currency, context),
    dueDate: mapDueDate(root, context),
    supplier: party('AccountingSupplierParty'),
    customer: party('AccountingCustomerParty'),
    buyerCustomer: party('BuyerCustomerParty'),
    lines: children(root, 'cac', 'InvoiceLine', context).map((el, i) =>
      mapLine(el, i + 1, at(context, 'cac', 'InvoiceLine', i + 1), mapTaxTotal),
    ),
    taxTotals: children(root, 'cac', 'TaxTotal', context).map((el, i) =>
      mapTaxTotal(el, at(context, 'cac', 'TaxTotal', i + 1)),
    ),
    withholdingTaxTotals: children(root, 'cac', 'WithholdingTaxTotal', context).map((el, i) =>
      mapTaxTotal(el, at(context, 'cac', 'WithholdingTaxTotal', i + 1), true),
    ),
    totals: mapTotals(
      child(root, 'cac', 'LegalMonetaryTotal', context),
      at(context, 'cac', 'LegalMonetaryTotal'),
    ),
    allowanceCharges: children(root, 'cac', 'AllowanceCharge', context).map((el, i) =>
      mapAllowance(el, at(context, 'cac', 'AllowanceCharge', i + 1)),
    ),
    paymentMeans: children(root, 'cac', 'PaymentMeans', context).map((el, i) =>
      mapPaymentMeans(el, at(context, 'cac', 'PaymentMeans', i + 1)),
    ),
    paymentTerms: children(root, 'cac', 'PaymentTerms', context).map((el, i) =>
      mapPaymentTerms(el, at(context, 'cac', 'PaymentTerms', i + 1)),
    ),
    attachments: mapAttachments(root, context),
    raw: context.options.includeRaw === false ? null : root,
  };
  return { ...fields, computed: computeTotals(fields) };
}
