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

/** Exact decimal-string arithmetic; results preserve the specified scale.
 * @example
 * decimal.add('100.50', '0.5'); // '101.00'
 */
export const decimal = {
  isDecimal(value: string): boolean {
    return /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(value.trim());
  },
  normalize(value: string): string {
    return format(parse(value));
  },
  add(a: string, b: string): string {
    const [ca, cb, s] = align(parse(a), parse(b));
    return format({ c: ca + cb, s });
  },
  sub(a: string, b: string): string {
    const [ca, cb, s] = align(parse(a), parse(b));
    return format({ c: ca - cb, s });
  },
  mul(a: string, b: string): string {
    const x = parse(a),
      y = parse(b);
    return format({ c: x.c * y.c, s: x.s + y.s });
  },
  neg(a: string): string {
    const { c, s } = parse(a);
    return format({ c: -c, s });
  },
  abs(a: string): string {
    const { c, s } = parse(a);
    return format({ c: absolute(c), s });
  },
  cmp(a: string, b: string): -1 | 0 | 1 {
    const [ca, cb] = align(parse(a), parse(b));
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  },
  eq(a: string, b: string): boolean {
    return decimal.cmp(a, b) === 0;
  },
  sum(values: Iterable<string>): string {
    let total = '0';
    for (const value of values) total = decimal.add(total, value);
    return total;
  },
  round(a: string, scale: number, mode: 'half-away-from-zero' | 'half-even' = 'half-away-from-zero'): string {
    precision(scale);
    const { c, s } = parse(a);
    if (s <= scale) return format({ c: c * pow10(scale - s), s: scale });
    const divisor = pow10(s - scale);
    let q = c / divisor;
    const twice = 2n * absolute(c % divisor);
    if (twice > divisor || (twice === divisor && (mode === 'half-away-from-zero' || q % 2n !== 0n)))
      q += sign(c);
    return format({ c: q, s: scale });
  },
  div(a: string, b: string, scale: number): string {
    precision(scale);
    const x = parse(a),
      y = parse(b);
    if (y.c === 0n) throw new RangeError('Division by zero');
    const num = x.c * pow10(y.s + scale),
      den = y.c * pow10(x.s);
    let q = num / den;
    if (2n * absolute(num % den) >= absolute(den)) q += sign(num) * sign(den);
    return format({ c: q, s: scale });
  },
  movePoint(a: string, places: number): string {
    precision(places, true);
    const { c, s } = parse(a);
    return places <= s ? format({ c, s: s - places }) : format({ c: c * pow10(places - s), s: 0 });
  },
  within(a: string, b: string, tolerance: string): boolean {
    return decimal.cmp(decimal.abs(decimal.sub(a, b)), tolerance) <= 0;
  },
  scale(a: string): number {
    return parse(a).s;
  },
};
