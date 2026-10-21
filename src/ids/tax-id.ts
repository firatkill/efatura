import { ANONYMOUS_TCKN } from '../config';
import { isValidTckn } from './tckn';
import { isValidVkn } from './vkn';

/** Classify a numeric identifier, retaining anonymous-consumer status separately.
 * @example
 * classifyTaxId('9990000013'); // { scheme: 'VKN', valid: true, anonymous: false }
 */
export function classifyTaxId(value: string): {
  scheme: 'VKN' | 'TCKN' | null;
  valid: boolean;
  anonymous: boolean;
} {
  if (/^\d{10}$/.test(value)) return { scheme: 'VKN', valid: isValidVkn(value), anonymous: false };
  if (/^\d{11}$/.test(value))
    return { scheme: 'TCKN', valid: isValidTckn(value), anonymous: value === ANONYMOUS_TCKN };
  return { scheme: null, valid: false, anonymous: false };
}
