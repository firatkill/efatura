import { MAX_XML_BYTES, SUPPORTED_ENCODINGS } from '../config';
import { EfaturaParseError } from '../errors';
import { encodingIssue } from './issues';
import type { MappingIssue } from './issues';

/** Decode XML input according to its BOM, declaration and prescribed fallback.
 * @example
 * decodeInput(new TextEncoder().encode('<Invoice/>')).encoding; // 'utf-8'
 */
export function decodeInput(
  input: string | Uint8Array | ArrayBuffer,
  maxBytes: number = MAX_XML_BYTES,
): { text: string; encoding: string; issues: MappingIssue[] } {
  if (typeof input === 'string') {
    if (input.length > maxBytes)
      throw new EfaturaParseError('INPUT_TOO_LARGE', { size: input.length, limit: maxBytes });
    return { text: input.startsWith('\ufeff') ? input.slice(1) : input, encoding: 'utf-8', issues: [] };
  }
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength === 0) throw new EfaturaParseError('EMPTY_INPUT');
  if (bytes.byteLength > maxBytes)
    throw new EfaturaParseError('INPUT_TOO_LARGE', { size: bytes.byteLength, limit: maxBytes });
  const decode = (encoding: string, issues: MappingIssue[] = []) => ({
    text: new TextDecoder(encoding).decode(bytes),
    encoding,
    issues,
  });
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return decode('utf-8');
  if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0x3c && bytes[1] === 0))
    return decode('utf-16le');
  if ((bytes[0] === 0xfe && bytes[1] === 0xff) || (bytes[0] === 0 && bytes[1] === 0x3c))
    return decode('utf-16be');
  const header = Array.from(bytes.subarray(0, 1024), (byte) => String.fromCharCode(byte)).join('');
  const declared = /^\s*<\?xml[^>]*?\sencoding\s*=\s*["']([A-Za-z0-9._-]+)["']/
    .exec(header)?.[1]
    ?.toLowerCase();
  if (declared) {
    if (SUPPORTED_ENCODINGS.some((label) => label === declared)) {
      try {
        return decode(declared);
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
    }
    return decode('utf-8', [encodingIssue('unsupported', declared)]);
  }
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'utf-8', issues: [] };
  } catch {
    return decode('windows-1254', [encodingIssue('fallback', '(none)')]);
  }
}

/** Decode XML bytes using the documented encoding rules without mapping an invoice.
 * @example
 * decodeXml(new TextEncoder().encode('<Invoice/>')).encoding; // 'utf-8'
 */
export function decodeXml(input: string | Uint8Array | ArrayBuffer) {
  return decodeInput(input);
}
