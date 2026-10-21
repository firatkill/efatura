import type { Attachment, Invoice } from '../types';
import { decodeBase64 } from './base64';
/** Decode attachment bytes on demand; metadata-only attachments have no data to decode.
 * @example
 * const bytes = decodeAttachment(invoice.attachments[0]);
 */
export function decodeAttachment(attachment: Attachment): Uint8Array {
  if (attachment.base64 === null) throw new TypeError('Attachment data is not available');
  return decodeBase64(attachment.base64);
}
/** Decode attachment text using its declared character set, falling back to UTF-8 for unknown labels.
 * @example
 * const stylesheet = attachmentText(xsltAttachment);
 */
export function attachmentText(attachment: Attachment): string {
  const bytes = decodeAttachment(attachment);
  let decoder: TextDecoder;
  try {
    decoder = new TextDecoder(attachment.characterSetCode ?? 'utf-8');
  } catch {
    decoder = new TextDecoder('utf-8');
  }
  return decoder.decode(bytes);
}
/** Find the first attachment identified as the official-view stylesheet.
 * @example
 * const stylesheet = findXslt(invoice);
 */
export function findXslt(invoice: Invoice): Attachment | null {
  return invoice.attachments.find((attachment) => attachment.isXslt) ?? null;
}
