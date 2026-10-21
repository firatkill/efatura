import type { Item } from '../types';
import type { XmlElement } from '../xml/tree';
import { attr, child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { code } from './values';
/** Map item details, returning an empty object model when the XML aggregate is absent.
 * @example
 * mapItem(null, context).classificationCodes; // []
 */
export function mapItem(el: XmlElement | null, context: MappingContext): Item {
  const read = (name: string) => textOf(el, 'cbc', name, context);
  const id = (name: string) => textOf(child(el, 'cac', name, context), 'cbc', 'ID', at(context, 'cac', name));
  return {
    name: read('Name'),
    description: read('Description'),
    keyword: read('Keyword'),
    brandName: read('BrandName'),
    modelName: read('ModelName'),
    buyersItemId: id('BuyersItemIdentification'),
    sellersItemId: id('SellersItemIdentification'),
    manufacturersItemId: id('ManufacturersItemIdentification'),
    classificationCodes: children(el, 'cac', 'CommodityClassification', context).flatMap(
      (classification, i) =>
        children(
          classification,
          'cbc',
          'ItemClassificationCode',
          at(context, 'cac', 'CommodityClassification', i + 1),
        ).flatMap((value) => {
          const label = text(value);
          return label === null ? [] : [{ listId: attr(value, 'listID'), value: label }];
        }),
    ),
    originCountryCode: code(
      child(
        child(el, 'cac', 'OriginCountry', context),
        'cbc',
        'IdentificationCode',
        at(context, 'cac', 'OriginCountry'),
      ),
    ),
  };
}
