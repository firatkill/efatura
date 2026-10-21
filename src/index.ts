/** Parse an invoice synchronously into model data and issues.
 * @example
 * const result = parseInvoice(xml);
 */
export { parseInvoice } from './parse';
/** Decode XML using its BOM or supported declaration.
 * @example
 * const decoded = decodeXml(bytes);
 */
export { decodeXml } from './xml/decode';
/** Select namespace-aware raw XML nodes and text.
 * @example
 * selectText(invoice.raw, '/Invoice/cbc:ID');
 */
export { select, selectAll, selectText } from './xml/select';
/** Perform exact decimal-string arithmetic.
 * @example
 * decimal.add('0.1', '0.2'); // '0.3'
 */
export { decimal } from './decimal/decimal';
/** Convert exact amounts to integer minor units or inspect currency precision.
 * @example
 * toMinorUnits('1.25', 'TRY'); // 125n
 */
export { toMinorUnits, minorUnitsOf } from './decimal/minor-units';
/** Decode attachments on demand and locate the first official-view stylesheet.
 * @example
 * const xslt = findXslt(invoice);
 */
export { decodeAttachment, attachmentText, findXslt } from './attachments/attachments';
/** Read verified bilingual code lists and source versions.
 * @example
 * TAX_TYPES.get('0015')?.label.tr;
 */
export {
  PROFILES,
  INVOICE_TYPES,
  TAX_TYPES,
  WITHHOLDING_CODES,
  EXEMPTION_CODES,
  UNIT_CODES,
  CURRENCIES,
  CODE_LISTS_VERIFIED,
} from './codes';
/** Identify fatal input errors without treating content diagnostics as exceptions.
 * @example
 * if (error instanceof EfaturaParseError) console.log(error.code);
 */
export { EfaturaParseError } from './errors';
/** Inspect frozen parser and application limits.
 * @example
 * efaturaConfig.maxXmlBytes;
 */
export { efaturaConfig } from './config-public';
/** Public model and parser option types.
 * @example
 * import type { Invoice, ParseOptions } from '@firatkill/efatura';
 */
export type * from './types';
