import { ISSUE_CODES } from './catalogue';
import * as decimal from '../decimal/operations';

/** Validate parser and standalone validation options before processing input.
 * @example
 * checkOptions({ tolerance: '0.01', rules: { EF040: 'off' } });
 */
export function checkOptions(input: unknown): void {
  if (input === null || typeof input !== 'object' || Array.isArray(input))
    throw new TypeError('Invalid parse options');
  const options = input as Record<string, unknown>;
  for (const key of ['validate', 'includeRaw'])
    if (options[key] !== undefined && typeof options[key] !== 'boolean')
      throw new TypeError(`Invalid ${key}`);
  const attachments = options['attachments'];
  if (attachments !== undefined && attachments !== 'data' && attachments !== 'metadata')
    throw new TypeError('Invalid attachments option');
  const maxBytes = options['maxBytes'];
  if (maxBytes !== undefined && (typeof maxBytes !== 'number' || !Number.isFinite(maxBytes) || maxBytes <= 0))
    throw new TypeError('Invalid maxBytes');
  const tolerance = options['tolerance'];
  if (
    tolerance !== undefined &&
    (typeof tolerance !== 'string' || !decimal.isDecimal(tolerance) || decimal.cmp(tolerance, '0') < 0)
  )
    throw new TypeError('Invalid tolerance');
  const rules = options['rules'];
  if (rules !== undefined) {
    if (rules === null || typeof rules !== 'object' || Array.isArray(rules))
      throw new TypeError('Invalid rules');
    for (const [key, value] of Object.entries(rules as Record<string, unknown>))
      if (
        !ISSUE_CODES.some((code) => code === key) ||
        typeof value !== 'string' ||
        !['error', 'warning', 'info', 'off'].includes(value)
      )
        throw new TypeError(`Invalid rule ${key}`);
  }
}
