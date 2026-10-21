type Parts = { c: bigint; s: number };
function parse(v: string): Parts {
  const t = v.trim();
  const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(t);
  if (!m || (m[2] === '' && (m[3] ?? '') === '')) throw new TypeError(`Invalid decimal: ${v}`);
  // TRD §8.2: an empty integer part ('.5') must become '0', not just nullish input.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const int = m[2] || '0';
  const frac = m[3] ?? '';
  const c = BigInt(int + frac) * (m[1] === '-' ? -1n : 1n);
  return { c, s: frac.length };
}
function format({ c, s }: Parts): string {
  const neg = c < 0n;
  const digits = (neg ? -c : c).toString().padStart(s + 1, '0');
  const body = s === 0 ? digits : `${digits.slice(0, -s)}.${digits.slice(-s)}`;
  return neg ? `-${body}` : body;
}
const pow10 = (n: number): bigint => 10n ** BigInt(n);
function align(a: Parts, b: Parts) {
  const s = Math.max(a.s, b.s);
  return [a.c * pow10(s - a.s), b.c * pow10(s - b.s), s] as const;
}
const absolute = (n: bigint): bigint => (n < 0n ? -n : n);
const sign = (n: bigint): bigint => (n < 0n ? -1n : 1n);
function precision(n: number, allowNegative = false): void {
  if (!Number.isSafeInteger(n) || (!allowNegative && n < 0)) throw new TypeError('Invalid decimal precision');
}

/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * isDecimal('1.25'); // true
 */
export function isDecimal(value: string): boolean {
  return /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(value.trim());
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * normalize('+01.20'); // '1.20'
 */
export function normalize(value: string): string {
  return format(parse(value));
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * add('1', '2'); // '3'
 */
export function add(a: string, b: string): string {
  const [ca, cb, s] = align(parse(a), parse(b));
  return format({ c: ca + cb, s });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * sub('3', '1'); // '2'
 */
export function sub(a: string, b: string): string {
  const [ca, cb, s] = align(parse(a), parse(b));
  return format({ c: ca - cb, s });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * mul('2', '3'); // '6'
 */
export function mul(a: string, b: string): string {
  const x = parse(a),
    y = parse(b);
  return format({ c: x.c * y.c, s: x.s + y.s });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * neg('2'); // '-2'
 */
export function neg(a: string): string {
  const { c, s } = parse(a);
  return format({ c: -c, s });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * abs('-2'); // '2'
 */
export function abs(a: string): string {
  const { c, s } = parse(a);
  return format({ c: absolute(c), s });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * cmp('1', '2'); // -1
 */
export function cmp(a: string, b: string): -1 | 0 | 1 {
  const [ca, cb] = align(parse(a), parse(b));
  return ca < cb ? -1 : ca > cb ? 1 : 0;
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * eq('1', '1.0'); // true
 */
export function eq(a: string, b: string): boolean {
  return cmp(a, b) === 0;
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * sum(['1', '2']); // '3'
 */
export function sum(values: Iterable<string>): string {
  let total = '0';
  for (const value of values) total = add(total, value);
  return total;
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * round('1.25', 1); // '1.3'
 */
export function round(
  a: string,
  scale: number,
  mode: 'half-away-from-zero' | 'half-even' = 'half-away-from-zero',
): string {
  precision(scale);
  const { c, s } = parse(a);
  if (s <= scale) return format({ c: c * pow10(scale - s), s: scale });
  const divisor = pow10(s - scale);
  let q = c / divisor;
  const twice = 2n * absolute(c % divisor);
  if (twice > divisor || (twice === divisor && (mode === 'half-away-from-zero' || q % 2n !== 0n)))
    q += sign(c);
  return format({ c: q, s: scale });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * div('1', '2', 2); // '0.50'
 */
export function div(a: string, b: string, scale: number): string {
  precision(scale);
  const x = parse(a),
    y = parse(b);
  if (y.c === 0n) throw new RangeError('Division by zero');
  const num = x.c * pow10(y.s + scale),
    den = y.c * pow10(x.s);
  let q = num / den;
  if (2n * absolute(num % den) >= absolute(den)) q += sign(num) * sign(den);
  return format({ c: q, s: scale });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * movePoint('1.25', 2); // '125'
 */
export function movePoint(a: string, places: number): string {
  precision(places, true);
  const { c, s } = parse(a);
  return places <= s ? format({ c, s: s - places }) : format({ c: c * pow10(places - s), s: 0 });
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * within('1', '1.01', '0.01'); // true
 */
export function within(a: string, b: string, tolerance: string): boolean {
  return cmp(abs(sub(a, b)), tolerance) <= 0;
}
/** Internal exact-decimal operation used by the public decimal facade.
 * @example
 * scale('1.20'); // 2
 */
export function scale(a: string): number {
  return parse(a).s;
}
