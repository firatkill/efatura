import { decimal } from '../decimal/decimal';
import type { InvoiceLine, LineDelivery, TaxTotal } from '../types';
import type { XmlElement } from '../xml/tree';
import { attr, child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { amount, quantity } from './values';
import { mapItem } from './item';
import { mapAllowance } from './allowance';
import { mapAddress } from './party';

/** Tax mapping boundary; supplied by T-14's mapper when composing the invoice.
 * @example
 * const mapper: TaxMapper = mapTaxTotal;
 */
export type TaxMapper = (el: XmlElement, context: MappingContext, withholding: boolean) => TaxTotal;

function delivery(el: XmlElement | null, context: MappingContext): LineDelivery | null {
  if (!el) return null;
  const terms = children(el, 'cac', 'DeliveryTerms', context).flatMap((term, i) =>
    children(term, 'cbc', 'ID', at(context, 'cac', 'DeliveryTerms', i + 1)),
  );
  const shipment = child(el, 'cac', 'Shipment', context);
  const shipmentContext = at(context, 'cac', 'Shipment');
  const handling = child(shipment, 'cac', 'TransportHandlingUnit', shipmentContext);
  const handlingContext = at(shipmentContext, 'cac', 'TransportHandlingUnit');
  return {
    incoterms: text(terms.find((term) => attr(term, 'schemeID') === 'INCOTERMS') ?? terms[0] ?? null),
    customsTariffCode: textOf(
      child(shipment, 'cac', 'GoodsItem', shipmentContext),
      'cbc',
      'RequiredCustomsID',
      at(shipmentContext, 'cac', 'GoodsItem'),
    ),
    transportModeCode: textOf(
      child(shipment, 'cac', 'ShipmentStage', shipmentContext),
      'cbc',
      'TransportModeCode',
      at(shipmentContext, 'cac', 'ShipmentStage'),
    ),
    packagingTypeCode: textOf(
      child(handling, 'cac', 'ActualPackage', handlingContext),
      'cbc',
      'PackagingTypeCode',
      at(handlingContext, 'cac', 'ActualPackage'),
    ),
    deliveryAddress: mapAddress(
      child(el, 'cac', 'DeliveryAddress', context),
      at(context, 'cac', 'DeliveryAddress'),
    ),
  };
}
function merged(totals: TaxTotal[]): TaxTotal | null {
  if (totals.length < 2) return totals[0] ?? null;
  const amounts = totals.flatMap((total) => (total.taxAmount ? [total.taxAmount] : []));
  const values = amounts.flatMap((value) => (value.value === null ? [] : [value.value]));
  return {
    subtotals: totals.flatMap((total) => total.subtotals),
    taxAmount: amounts.length
      ? {
          value: values.length ? decimal.sum(values) : null,
          raw: amounts.map((value) => value.raw).join('+'),
          currency: totals[0]?.taxAmount?.currency ?? null,
        }
      : null,
  };
}
/** Map one invoice line, merging ordinary tax totals while retaining separate withholding totals.
 * @example
 * mapLine(element, 1, context, mapTaxTotal).position; // 1
 */
export function mapLine(
  el: XmlElement,
  position: number,
  context: MappingContext,
  mapTax: TaxMapper,
): InvoiceLine {
  const price = child(el, 'cac', 'Price', context);
  const priceContext = at(context, 'cac', 'Price');
  return {
    position,
    id: textOf(el, 'cbc', 'ID', context),
    notes: children(el, 'cbc', 'Note', context)
      .map(text)
      .filter((v) => v !== null),
    quantity: quantity(child(el, 'cbc', 'InvoicedQuantity', context), at(context, 'cbc', 'InvoicedQuantity')),
    lineExtensionAmount: amount(
      child(el, 'cbc', 'LineExtensionAmount', context),
      at(context, 'cbc', 'LineExtensionAmount'),
    ),
    allowanceCharges: children(el, 'cac', 'AllowanceCharge', context).map((value, i) =>
      mapAllowance(value, at(context, 'cac', 'AllowanceCharge', i + 1)),
    ),
    taxTotal: merged(
      children(el, 'cac', 'TaxTotal', context).map((value, i) =>
        mapTax(value, at(context, 'cac', 'TaxTotal', i + 1), false),
      ),
    ),
    withholdingTaxTotals: children(el, 'cac', 'WithholdingTaxTotal', context).map((value, i) =>
      mapTax(value, at(context, 'cac', 'WithholdingTaxTotal', i + 1), true),
    ),
    item: mapItem(child(el, 'cac', 'Item', context), at(context, 'cac', 'Item')),
    price: price
      ? {
          amount: amount(
            child(price, 'cbc', 'PriceAmount', priceContext),
            at(priceContext, 'cbc', 'PriceAmount'),
          ),
          baseQuantity: quantity(
            child(price, 'cbc', 'BaseQuantity', priceContext),
            at(priceContext, 'cbc', 'BaseQuantity'),
          ),
        }
      : null,
    delivery: delivery(child(el, 'cac', 'Delivery', context), at(context, 'cac', 'Delivery')),
  };
}
