/** Verify a ten-digit VKN checksum (TRD §9.2).
 * @example
 * isValidVkn('9990000013'); // true
 */
export function isValidVkn(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;
  const d = Array.from(value, Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    // The regex guarantees ten digits and the loop visits only the first nine.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The preceding regex guarantees these digit positions (TRD §9.2).
    const t = (d[i]! + 9 - i) % 10;
    let r = (t * 2 ** (9 - i)) % 9;
    if (t !== 0 && r === 0) r = 9;
    sum += r;
  }
  return (10 - (sum % 10)) % 10 === d[9];
}
