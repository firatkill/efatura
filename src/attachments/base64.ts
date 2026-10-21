const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = new Int16Array(256).fill(-1);
for (let i = 0; i < alphabet.length; i++) lookup[alphabet.charCodeAt(i)] = i;

/** Compute decoded size from stripped base64 without decoding (TRD §7.8.5).
 * @example
 * base64Size('TQ=='); // 1
 */
export function base64Size(value: string): number {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return (value.length * 3 - ((value.length * 3) % 4)) / 4 - padding;
}
/** Decode standard base64, accepting omitted final padding and reporting invalid positions.
 * @example
 * decodeBase64('TQ=='); // Uint8Array [77]
 */
export function decodeBase64(value: string): Uint8Array {
  const invalid = (i: number): never => {
    throw new TypeError(`Invalid base64 at position ${String(i)}`);
  };
  if (value.length % 4 === 1) invalid(value.length - 1);
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  let padding = false;
  for (let i = 0; i < padded.length; i++) {
    if (padded[i] === '=') {
      if (i < padded.length - 2) invalid(i);
      padding = true;
    } else if (padding || (lookup[padded.charCodeAt(i)] ?? -1) < 0) invalid(i);
  }
  const output = new Uint8Array(base64Size(padded));
  let buffer = 0,
    bits = 0,
    index = 0;
  for (let i = 0; i < padded.length && padded[i] !== '='; i++) {
    buffer = (buffer << 6) | (lookup[padded.charCodeAt(i)] ?? 0);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[index++] = (buffer >> bits) & 255;
    }
  }
  return output;
}
