import { CURRENCIES } from '../codes/currencies';
import { TRY_ALIASES } from '../config';
import * as decimal from './operations';

/** Get the currency's precision, including Turkish-lira aliases.
 * @example
 * minorUnitsOf('JPY'); // 0
 */
export function minorUnitsOf(currency: string): number | null {
  const code = currency.trim().toUpperCase();
  if (TRY_ALIASES.some((alias) => alias === code)) return 2;
  return CURRENCIES.get(code)?.minorUnits ?? null;
}

/** Convert an exact decimal to integer currency units.
 * @example
 * toMinorUnits('1180.5', 'TRY'); // 118050n
 */
export function toMinorUnits(
  amount: string,
  currency: string,
  options: { rounding?: 'half-away-from-zero' | 'throw'; minorUnits?: number } = {},
): bigint {
  const code = currency.trim().toUpperCase();
  const digits = options.minorUnits ?? minorUnitsOf(code);
  if (digits === null)
    throw new RangeError(`Unknown minor units for currency ${code}; pass options.minorUnits`);
  if (!Number.isInteger(digits) || digits < 0 || digits > 6)
    throw new TypeError('minorUnits must be an integer from 0 to 6');
  const rounded = decimal.round(amount, digits);
  if (options.rounding === 'throw' && !decimal.eq(amount, rounded))
    throw new RangeError(`${amount} has more than ${String(digits)} decimals for ${code}`);
  return BigInt(rounded.replace('.', ''));
}
