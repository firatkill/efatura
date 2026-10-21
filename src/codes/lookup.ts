import type { InvoiceTypeCode, ProfileId } from '../types';
import { PROFILES } from './profiles';
import { INVOICE_TYPES } from './invoice-types';

/** Resolve a trimmed, case-insensitive profile code (TRD §7.1).
 * @example
 * lookupProfile(' temelFatura '); // 'TEMELFATURA'
 */
export function lookupProfile(raw: string | null): ProfileId {
  const key = raw?.trim().toUpperCase() ?? '';
  return PROFILES.has(key) ? (key as ProfileId) : 'OTHER';
}

/** Resolve a trimmed, case-insensitive invoice type (TRD §7.1).
 * @example
 * lookupInvoiceType(' satis '); // 'SATIS'
 */
export function lookupInvoiceType(raw: string | null): InvoiceTypeCode {
  const key = raw?.trim().toUpperCase() ?? '';
  return INVOICE_TYPES.has(key) ? (key as InvoiceTypeCode) : 'OTHER';
}
