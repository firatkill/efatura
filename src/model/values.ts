import { decimal } from '../decimal/decimal';
import type { Amount, Decimal, Quantity } from '../types';
import { text, attr } from '../xml/query';
import type { XmlElement } from '../xml/tree';
import { numberIssue } from './context';
import type { MappingContext } from './context';

/** Trim text without collapsing internal whitespace.
 * @example
 * text(null); // null
 */
export { text };
/** Normalize a code for lookup, keeping raw text in the caller's separate field.
 * @example
 * code(null); // null
 */
export function code(el: XmlElement | null): string | null {
  return text(el)?.toUpperCase() ?? null;
}
/** Read the XSD boolean forms, case-insensitively.
 * @example
 * bool(null); // null
 */
export function bool(el: XmlElement | null): boolean | null {
  switch (text(el)?.toLowerCase()) {
    case 'true':
    case '1':
      return true;
    case 'false':
    case '0':
      return false;
    default:
      return null;
  }
}
/** Read a safe nonnegative integer and diagnose invalid present values.
 * @example
 * integer(null, createContext()); // null
 */
export function integer(el: XmlElement | null, context: MappingContext): number | null {
  if (!el) return null;
  const raw = el.text.trim();
  if (/^\d+$/.test(raw)) {
    const value = Number(raw);
    if (Number.isSafeInteger(value)) return value;
  }
  numberIssue(context, 'EF030', raw);
  return null;
}
/** Preserve XML decimal strings, normalizing only the prescribed lexical variants.
 * @example
 * decimalValue('1.00', createContext()); // '1.00'
 */
export function decimalValue(raw: string, context: MappingContext): Decimal | null {
  if (/^-?\d+(\.\d+)?$/.test(raw)) return raw;
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(raw)) return decimal.normalize(raw);
  if (/^-?\d+,\d+$/.test(raw)) {
    numberIssue(context, 'EF031', raw);
    return raw.replace(',', '.');
  }
  numberIssue(context, 'EF030', raw);
  return null;
}
/** Build an amount, retaining invalid raw values for diagnostics.
 * @example
 * amount(null, createContext()); // null
 */
export function amount(el: XmlElement | null, context: MappingContext): Amount | null {
  if (!el) return null;
  const raw = el.text.trim();
  const value = decimalValue(raw, context);
  const currency = attr(el, 'currencyID')?.toUpperCase() ?? null;
  if (currency === null) numberIssue(context, 'EF032', raw);
  return { value, raw, currency };
}
/** Build a quantity with its optional unit-code lookup.
 * @example
 * quantity(null, createContext()); // null
 */
export function quantity(el: XmlElement | null, context: MappingContext): Quantity | null {
  if (!el) return null;
  const raw = el.text.trim();
  const value = decimalValue(raw, context);
  const unitCode = attr(el, 'unitCode')?.toUpperCase() ?? null;
  return { value, raw, unitCode, unit: unitCode === null ? null : context.unitLookup(unitCode) };
}
