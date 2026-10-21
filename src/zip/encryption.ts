import { strFromU8 } from 'fflate';
/** Read only bounded central-directory records to detect encrypted entry labels.
 * @example
 * const encrypted = await encryptedEntries(blob, 5000);
 */
export async function encryptedEntries(input: Uint8Array | Blob, maxEntries: number): Promise<Set<string>> {
  const size = input instanceof Blob ? input.size : input.byteLength;
  const read = async (start: number, end: number): Promise<Uint8Array> =>
    input instanceof Blob
      ? new Uint8Array(await input.slice(start, end).arrayBuffer())
      : input.subarray(start, end);
  const names = new Set<string>();
  try {
    const tail = await read(Math.max(0, size - 22 - 0xffff), size);
    const view = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
    let eocd = tail.length - 22;
    for (; eocd >= 0; eocd--)
      if (
        view.getUint32(eocd, true) === 0x06054b50 &&
        eocd + 22 + view.getUint16(eocd + 20, true) === tail.length
      )
        break;
    if (eocd < 0) return names;
    const count = view.getUint16(eocd + 10, true),
      length = view.getUint32(eocd + 12, true);
    let offset = view.getUint32(eocd + 16, true);
    const end = offset + length;
    if (count === 0xffff || length === 0xffffffff || offset === 0xffffffff || end > size - 22) return names;
    for (let i = 0; i < Math.min(count, maxEntries); i++) {
      if (offset + 46 > end) return new Set();
      const header = await read(offset, offset + 46),
        fields = new DataView(header.buffer, header.byteOffset, header.byteLength);
      if (header.length !== 46 || fields.getUint32(0, true) !== 0x02014b50) return new Set();
      const flags = fields.getUint16(8, true),
        nameSize = fields.getUint16(28, true),
        extraSize = fields.getUint16(30, true),
        commentSize = fields.getUint16(32, true);
      if (offset + 46 + nameSize + extraSize + commentSize > end) return new Set();
      if (flags & 1) names.add(strFromU8(await read(offset + 46, offset + 46 + nameSize), !(flags & 2048)));
      offset += 46 + nameSize + extraSize + commentSize;
    }
    return names;
  } catch {
    return new Set();
  }
}
