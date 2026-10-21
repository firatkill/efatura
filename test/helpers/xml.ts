/** Encode a synthetic test string as UTF-16 bytes, optionally with a BOM.
 * @example
 * utf16('<Invoice/>', 'le', true);
 */
export function utf16(text: string, order: 'le' | 'be', bom = false): Uint8Array {
  const data = new Uint8Array((text.length + (bom ? 1 : 0)) * 2);
  const view = new DataView(data.buffer);
  if (bom) view.setUint16(0, 0xfeff, order === 'le');
  for (let i = 0; i < text.length; i++)
    view.setUint16((i + (bom ? 1 : 0)) * 2, text.charCodeAt(i), order === 'le');
  return data;
}
/** Encode the Turkish characters used in synthetic windows-1254 tests.
 * @example
 * turkishBytes('<Invoice>ğş</Invoice>');
 */
export function turkishBytes(text: string): Uint8Array {
  const overrides: Record<string, number> = { Ğ: 0xd0, İ: 0xdd, Ş: 0xde, ğ: 0xf0, ı: 0xfd, ş: 0xfe };
  return Uint8Array.from(text, (char) => overrides[char] ?? char.charCodeAt(0));
}
