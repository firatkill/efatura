import type { Attachment } from '../types';
import type { XmlElement } from '../xml/tree';
import { attr, child, children, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { mapReference } from './references';
import { base64Size } from '../attachments/base64';
/** Map embedded attachment metadata without decoding bytes or fetching external references.
 * @example
 * mapAttachments(root, context)[0]?.size;
 */
export function mapAttachments(root: XmlElement, context: MappingContext): Attachment[] {
  return children(root, 'cac', 'AdditionalDocumentReference', context).flatMap((reference, i) => {
    const referenceContext = at(context, 'cac', 'AdditionalDocumentReference', i + 1);
    const attachment = child(reference, 'cac', 'Attachment', referenceContext);
    const attachmentContext = at(referenceContext, 'cac', 'Attachment');
    const binary = child(attachment, 'cbc', 'EmbeddedDocumentBinaryObject', attachmentContext);
    if (!binary) return [];
    const fields = mapReference(reference, referenceContext);
    const filename = attr(binary, 'filename');
    const mimeCode = attr(binary, 'mimeCode')?.toLowerCase() ?? null;
    const stripped = binary.text.replace(/\s+/g, '');
    return [
      {
        ...fields,
        filename,
        mimeCode,
        encodingCode: attr(binary, 'encodingCode'),
        characterSetCode: attr(binary, 'characterSetCode'),
        isXslt:
          mimeCode !== 'application/pdf' &&
          !mimeCode?.startsWith('image/') &&
          (/\.xslt?$/i.test(filename ?? '') ||
            fields.documentType?.toUpperCase() === 'XSLT' ||
            mimeCode === 'application/xslt+xml' ||
            mimeCode === 'text/xsl'),
        size: base64Size(stripped),
        base64: context.options.attachments === 'metadata' ? null : stripped,
        externalUri: textOf(
          child(attachment, 'cac', 'ExternalReference', attachmentContext),
          'cbc',
          'URI',
          at(attachmentContext, 'cac', 'ExternalReference'),
        ),
      },
    ];
  });
}
