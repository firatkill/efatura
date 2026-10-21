/** Independent fixed-scale bigint addition oracle for test vectors.
 * @example
 * referenceAdd('1.00', '2'); // '3.00'
 */
export function referenceAdd(a: string, b: string): string {
  const scale = Math.max(a.split('.')[1]?.length ?? 0, b.split('.')[1]?.length ?? 0);
  const coefficient = (value: string) => {
    const sign = value.startsWith('-') ? -1n : 1n;
    const [whole = '0', fraction = ''] = value.replace(/^[+-]/, '').split('.');
    return sign * BigInt(whole + fraction.padEnd(scale, '0'));
  };
  const value = coefficient(a) + coefficient(b);
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(scale + 1, '0');
  const point = digits.length - scale;
  return (negative ? '-' : '') + digits.slice(0, point) + (scale ? '.' + digits.slice(point) : '');
}
