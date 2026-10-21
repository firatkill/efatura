import type { InputFile, XmlInput } from '../types';
/** Extract named input data, including browser File objects.
 * @example
 * inputData({ name: 'a.xml', data: '<Invoice/>' });
 */
export const inputData = (file: InputFile | File): XmlInput | Blob => ('data' in file ? file.data : file);
/** Get source size without reading Blob data.
 * @example
 * inputSize('xml'); // 3
 */
export const inputSize = (data: XmlInput | Blob): number =>
  typeof data === 'string' ? data.length : data instanceof Blob ? data.size : data.byteLength;
/** Recognize ZIP local-header magic.
 * @example
 * isZipMagic(new Uint8Array([80, 75, 3, 4])); // true
 */
export const isZipMagic = (data: string | Uint8Array): boolean =>
  typeof data !== 'string' && data[0] === 80 && data[1] === 75 && data[2] === 3 && data[3] === 4;
/** Recognize XML after a BOM and ASCII whitespace within 64 bytes.
 * @example
 * looksLikeXml('  <Invoice/>'); // true
 */
export function looksLikeXml(input: string | Uint8Array): boolean {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input.slice(0, 64)) : input;
  let i = 0,
    width = 1,
    offset = 0;
  if (bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) i = 3;
  else if (bytes[0] === 255 && bytes[1] === 254) {
    i = 2;
    width = 2;
  } else if (bytes[0] === 254 && bytes[1] === 255) {
    i = 2;
    width = 2;
    offset = 1;
  }
  for (; i + offset < Math.min(bytes.length, 64); i += width) {
    const b = bytes[i + offset];
    if (b === 60 || (b === 0 && bytes[i + 1] === 60)) return true;
    if (b !== 32 && b !== 9 && b !== 10 && b !== 13) return false;
  }
  return false;
}
