/** Verify both check digits of a TCKN (TRD §9.2).
 * @example
 * isValidTckn('50000000128'); // true
 */
export function isValidTckn(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = Array.from(value, Number);
  // The regex guarantees all eleven indexed digits exist.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The preceding regex guarantees these digit positions (TRD §9.2).
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The preceding regex guarantees these digit positions (TRD §9.2).
  const even = d[1]! + d[3]! + d[5]! + d[7]!;
  const d10 = (((odd * 7 - even) % 10) + 10) % 10;
  const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d10 === d[9] && d11 === d[10];
}
