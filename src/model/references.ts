import type { DocumentReference, Invoice } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';

/** Map the five document-reference fields from TRD §7.3.1.
 * @example
 * mapReference(referenceElement, context).id;
 */
export function mapReference(el: XmlElement, context: MappingContext): DocumentReference {
  return {
    id: textOf(el, 'cbc', 'ID', context),
    issueDate: textOf(el, 'cbc', 'IssueDate', context),
    documentTypeCode: textOf(el, 'cbc', 'DocumentTypeCode', context),
    documentType: textOf(el, 'cbc', 'DocumentType', context),
    descriptions: children(el, 'cbc', 'DocumentDescription', context)
      .map(text)
      .filter((v) => v !== null),
  };
}

/** Map reference collections, keeping embedded documents for the attachment mapper.
 * @example
 * mapReferences(root, context).orderReferences;
 */
export function mapReferences(
  root: XmlElement,
  context: MappingContext,
): Pick<
  Invoice,
  | 'orderReferences'
  | 'billingReferences'
  | 'despatchReferences'
  | 'receiptReferences'
  | 'contractReferences'
  | 'additionalReferences'
> {
  const list = (name: string) =>
    children(root, 'cac', name, context).map((el, i) => mapReference(el, at(context, 'cac', name, i + 1)));
  return {
    orderReferences: list('OrderReference'),
    billingReferences: children(root, 'cac', 'BillingReference', context).flatMap((el, i) => {
      const parent = at(context, 'cac', 'BillingReference', i + 1);
      return children(el, 'cac', 'InvoiceDocumentReference', parent).map((ref) =>
        mapReference(ref, at(parent, 'cac', 'InvoiceDocumentReference')),
      );
    }),
    despatchReferences: list('DespatchDocumentReference'),
    receiptReferences: list('ReceiptDocumentReference'),
    contractReferences: list('ContractDocumentReference'),
    additionalReferences: children(root, 'cac', 'AdditionalDocumentReference', context).flatMap((el, i) => {
      const parent = at(context, 'cac', 'AdditionalDocumentReference', i + 1);
      const attachment = child(el, 'cac', 'Attachment', parent);
      return child(attachment, 'cbc', 'EmbeddedDocumentBinaryObject', at(parent, 'cac', 'Attachment'))
        ? []
        : [mapReference(el, parent)];
    }),
  };
}
