import { expect, it } from 'vitest';
import { parseAny } from '../../src/zip';
import { archive } from '../helpers/zip';
import { fullInvoiceXml } from '../helpers/invoice';
it('UT-34 / FR-29 / TC-M3-023: mixed XML/ZIP share duplicates, per-archive limits are fresh', async () => {
  const bytes = archive({ 'a.xml': fullInvoiceXml });
  const result = await parseAny(
    [
      { name: 'a.xml', data: fullInvoiceXml },
      { name: 'a.zip', data: bytes },
      { name: 'b', data: bytes },
    ],
    { limits: { maxEntries: 1 } },
  );
  expect(result.summary).toMatchObject({ files: 3, archives: 2, invoices: 3, duplicates: 2, failed: 0 });
  expect(result.items.map((i) => i.source.path)).toEqual(['a.xml', 'a.zip!/a.xml', 'b!/a.xml']);
});
it('UT-34 / TC-M3-023: async files, Blob sniffing, ArrayBuffer, skips and invalid limits', async () => {
  async function* files() {
    await Promise.resolve();
    yield { name: 'a', data: new Blob([archive({ 'a.xml': fullInvoiceXml }) as Uint8Array<ArrayBuffer>]) };
    yield { name: 'b', data: archive({ 'b.xml': fullInvoiceXml }).buffer as ArrayBuffer };
    yield { name: 'x.pdf', data: 'text' };
  }
  expect((await parseAny(files())).summary).toMatchObject({ invoices: 2, archives: 2, skipped: 1 });
  await expect(parseAny([], { limits: { maxEntries: 0 } })).rejects.toThrow(TypeError);
});
it('UT-34 / TC-M3-023: unreadable sniff is one error and duplicate off still counts', async () => {
  class Broken extends Blob {
    override slice(): Blob {
      return new (class extends Blob {
        override async arrayBuffer(): Promise<ArrayBuffer> {
          await Promise.resolve();
          throw new Error('read');
        }
      })();
    }
  }
  const result = await parseAny(
    [
      { name: 'bad', data: new Broken(['x']) },
      { name: 'a.xml', data: fullInvoiceXml },
      { name: 'b.zip', data: archive({ 'b.xml': fullInvoiceXml }) },
    ],
    { rules: { EF090: 'off' } },
  );
  expect(result.summary).toMatchObject({ failed: 1, invoices: 2, duplicates: 1 });
  expect(result.items[0]).toMatchObject({ kind: 'error', error: { code: 'READ_FAILED' } });
  expect(
    result.items
      .filter((i) => i.kind === 'invoice')
      .flatMap((i) => i.issues)
      .some((i) => i.code === 'EF090'),
  ).toBe(false);
});
