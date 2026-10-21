import { Zip, ZipDeflate, strToU8, zipSync } from 'fflate';
/** Build synthetic stored or deflated test entries.
 * @example
 * archive({'a.xml':'<Invoice/>'});
 */
export function archive(entries: Record<string, string | Uint8Array>, level: 0 | 6 = 6): Uint8Array {
  return zipSync(
    Object.fromEntries(
      Object.entries(entries).map(([name, data]) => [
        name,
        [typeof data === 'string' ? strToU8(data) : data, { level, mtime: new Date(2025, 0, 1) }],
      ]),
    ),
  );
}
/** Build an unknown-size descriptor entry through fflate's streaming writer.
 * @example
 * descriptor('a.xml',new Uint8Array(100));
 */
export function descriptor(name: string, data: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [];
  const zip = new Zip((error, chunk) => {
    if (error) throw error;
    parts.push(chunk);
  });
  const entry = new ZipDeflate(name, { level: 6 });
  entry.mtime = new Date(2025, 0, 1);
  zip.add(entry);
  entry.push(data, true);
  zip.end();
  const result = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
/** Alter local and central flags/method to exercise unsupported ZIP inputs.
 * @example
 * alteredArchive('encrypted');
 */
export function alteredArchive(mode: 'encrypted' | 'method'): Uint8Array {
  const bytes = archive({ 'a.xml': '<Invoice/>' }, 0),
    v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i + 46 <= bytes.length; i++) {
    const signature = v.getUint32(i, true);
    if (signature === 0x04034b50)
      v.setUint16(i + (mode === 'encrypted' ? 6 : 8), mode === 'encrypted' ? 1 : 12, true);
    if (signature === 0x02014b50)
      v.setUint16(i + (mode === 'encrypted' ? 8 : 10), mode === 'encrypted' ? 1 : 12, true);
  }
  return bytes;
}
