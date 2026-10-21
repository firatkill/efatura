import { describe, expect, it, vi } from 'vitest';
import { Unzip, UnzipInflate, strToU8 } from 'fflate';
import { parseZip, iterateZip } from '../../src/zip';
import { encryptedEntries } from '../../src/zip/encryption';
import { archive, descriptor, alteredArchive } from '../helpers/zip';
import { fullInvoiceXml } from '../helpers/invoice';
const codes = (result: Awaited<ReturnType<typeof parseZip>>) =>
  result.items.flatMap((item) => (item.kind === 'error' ? [item.error.code] : []));
describe('UT-33 / FR-24–26 streaming ZIP', () => {
  it('TC-M3-015: pinned fflate callbacks are synchronous; descriptor sizes absent', () => {
    const flags = { seen: false, output: false };
    const unzip = new Unzip((file) => {
      flags.seen = true;
      expect(file.size).toBeUndefined();
      expect(file.originalSize).toBeUndefined();
      file.ondata = () => {
        flags.output = true;
      };
      file.start();
    });
    unzip.register(UnzipInflate);
    unzip.push(descriptor('a.xml', strToU8(fullInvoiceXml)), true);
    expect(flags.seen && flags.output).toBe(true);
  });
  it.each([0, 6] as const)('TC-M3-016: stored/deflated nested paths and totals (%s)', async (level) => {
    const nested = archive({ 'folder/a.xml': fullInvoiceXml }, level);
    const bytes = archive({ 'nested.zip': nested, 'b.xml': fullInvoiceXml }, level);
    const result = await parseZip(bytes, { name: 'outer.zip' });
    expect(result.items.map((i) => [i.kind, i.source.path, i.source.depth])).toEqual([
      ['invoice', 'outer.zip!/nested.zip!/folder/a.xml', 2],
      ['invoice', 'outer.zip!/b.xml', 1],
    ]);
    expect(result.items[0]?.source.bytes).toBe(strToU8(fullInvoiceXml).length);
    expect(result.summary).toMatchObject({ files: 2, archives: 2, invoices: 2, duplicates: 1, failed: 0 });
  });
  it('TC-M3-017: junk is ignored, filters allow extensionless nested archives and XML sniffing', async () => {
    const nested = archive({ 'keep.xml': fullInvoiceXml, 'drop.xml': fullInvoiceXml });
    const result = await parseZip(
      archive({
        '__MACOSX/._a.xml': 'x',
        'folder/': '',
        'readme.pdf': 'x',
        nested,
        keep: '\ufeff  ' + fullInvoiceXml,
        plain: 'text',
      }),
      { entryFilter: (path) => !path.endsWith('drop.xml') },
    );
    expect(result.items.map((i) => [i.kind, i.source.name])).toEqual([
      ['skipped', 'readme.pdf'],
      ['invoice', 'keep.xml'],
      ['invoice', 'keep'],
      ['skipped', 'plain'],
    ]);
  });
  it('TC-M3-018: depth and entry limits are shared across nested walks; one stop error', async () => {
    expect(
      codes(
        await parseZip(archive({ 'n.zip': archive({ 'a.xml': fullInvoiceXml }) }), {
          limits: { maxDepth: 1 },
        }),
      ),
    ).toEqual(['ZIP_DEPTH_EXCEEDED']);
    expect(
      codes(
        await parseZip(archive({ 'n.zip': archive({ 'a.xml': fullInvoiceXml, 'b.xml': fullInvoiceXml }) }), {
          limits: { maxEntries: 2 },
        }),
      ),
    ).toEqual(['ZIP_TOO_MANY_ENTRIES']);
    const result = await parseZip(archive({ '__MACOSX/x': '', 'dir/': '', 'a.xml': fullInvoiceXml }), {
      limits: { maxEntries: 1 },
    });
    expect(result.summary.invoices).toBe(1);
  });
  it('TC-M3-019: entry rejection continues; aggregate rejection stops', async () => {
    const bytes = archive({ 'large.xml': ' '.repeat(5000), 'small.xml': '<Other/>' });
    expect(codes(await parseZip(bytes, { limits: { maxEntryBytes: 2000 } }))).toEqual([
      'ZIP_ENTRY_TOO_LARGE',
      'NOT_INVOICE',
    ]);
    expect(codes(await parseZip(bytes, { limits: { maxTotalBytes: 1000 } }))).toEqual(['ZIP_TOO_LARGE']);
    expect(
      codes(
        await parseZip(descriptor('a.xml', strToU8(' '.repeat(5000))), { limits: { maxEntryBytes: 2000 } }),
      ),
    ).toEqual(['ZIP_ENTRY_TOO_LARGE']);
    expect(
      codes(
        await parseZip(descriptor('a.xml', strToU8(' '.repeat(5000))), { limits: { maxTotalBytes: 2000 } }),
      ),
    ).toEqual(['ZIP_TOO_LARGE']);
  });
  it('TC-M3-020: bomb yields exactly one ratio error and later entries survive', async () => {
    const result = await parseZip(
      archive({ 'bomb.xml': ' '.repeat(20 * 1024 * 1024), 'a.xml': fullInvoiceXml }),
    );
    expect(codes(result)).toEqual(['ZIP_RATIO_EXCEEDED']);
    expect(result.summary.invoices).toBe(1);
  });
  it('TC-M3-020: normal 3 MiB descriptor uses the whole outer push denominator', async () => {
    // Deterministic comment plus legal XML whitespace: 3 MiB inflated, moderate compression.
    let state = 1;
    const bytes = new Uint8Array(256 * 1024);
    for (let i = 0; i < bytes.length; i++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      bytes[i] = 65 + ((state >>> 24) % 26);
    }
    const text = fullInvoiceXml.replace(
      '</Invoice>',
      '<!--' + new TextDecoder().decode(bytes) + '--></Invoice>',
    );
    const content = strToU8(text);
    const padded = new Uint8Array(3 * 1024 * 1024).fill(32);
    padded.set(content);
    const packed = descriptor('a.xml', padded);
    expect(packed.length).toBeLessThan(1024 * 1024);
    expect(padded.length / packed.length).toBeLessThan(100);
    expect(codes(await parseZip(packed))).toEqual([]);
  });
  it('TC-M3-021: invalid archives, encrypted flags and unsupported method', async () => {
    for (const bytes of [new Uint8Array(), new Uint8Array(100), archive({ 'bad.zip': new Uint8Array(100) })])
      expect(codes(await parseZip(bytes))).toEqual(['ZIP_INVALID']);
    expect(codes(await parseZip(alteredArchive('encrypted')))).toEqual(['ZIP_ENCRYPTED']);
    expect(codes(await parseZip(alteredArchive('method')))).toEqual(['ZIP_UNSUPPORTED_METHOD']);
    expect([
      ...(await encryptedEntries(new Blob([alteredArchive('encrypted') as Uint8Array<ArrayBuffer>]), 5)),
    ]).toEqual(['a.xml']);
    expect(await encryptedEntries(new Uint8Array(10), 5)).toEqual(new Set());
  });
  it('TC-M3-022: Blob streaming, final progress and immediate cancellation', async () => {
    const bytes = archive({ 'a.xml': fullInvoiceXml }),
      blob = new Blob([bytes as Uint8Array<ArrayBuffer>]);
    const stream = vi.spyOn(blob, 'stream'),
      wholeRead = vi.spyOn(blob, 'arrayBuffer'),
      progress = vi.fn();
    expect((await parseZip(blob, { onProgress: progress })).summary.invoices).toBe(1);
    expect(stream).toHaveBeenCalledOnce();
    expect(wholeRead).not.toHaveBeenCalled();
    expect(progress.mock.lastCall?.[0]).toMatchObject({
      filesDone: 1,
      bytesDone: bytes.length,
      bytesTotal: bytes.length,
    });
    const controller = new AbortController();
    controller.abort();
    await expect(iterateZip(bytes, { signal: controller.signal }).next()).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
  it('TC-M3-022: stream read errors are items; callback exceptions propagate', async () => {
    class Broken extends Blob {
      override stream(): ReadableStream<Uint8Array<ArrayBuffer>> {
        return new ReadableStream({
          start(c) {
            c.error(new Error('synthetic read'));
          },
        });
      }
    }
    expect(
      codes(await parseZip(new Broken([archive({ 'a.xml': fullInvoiceXml }) as Uint8Array<ArrayBuffer>]))),
    ).toEqual(['READ_FAILED']);
    await expect(
      parseZip(archive({ 'a.xml': fullInvoiceXml }), {
        onProgress() {
          throw new Error('callback');
        },
      }),
    ).rejects.toThrow('callback');
  });
});

it('UT-33 / NFR-12 / TC-M3-020: peak ZIP-bomb buffer growth remains below 30 MiB', async () => {
  const { execFileSync } = await import('node:child_process');
  const output = execFileSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--expose-gc',
      '--input-type=module',
      '-e',
      `
 import {zipSync,UnzipInflate} from 'fflate';
 globalThis.__EFATURA_VERSION__ = '0.0.0-test';
 const {parseZip}=await import('./src/zip.ts');
 const bytes=zipSync({'bomb.xml':new Uint8Array(20*1024*1024).fill(32)});
 global.gc();
 const baseline=process.memoryUsage().arrayBuffers;let peak=baseline;
 const push=UnzipInflate.prototype.push;
 UnzipInflate.prototype.push=function(...args){
  const callback=this.ondata;
  this.ondata=(...data)=>{peak=Math.max(peak,process.memoryUsage().arrayBuffers);callback(...data);};
  try{return push.apply(this,args);}finally{this.ondata=callback;peak=Math.max(peak,process.memoryUsage().arrayBuffers);}
 };
 const result=await parseZip(bytes);
 console.log(JSON.stringify({growth:peak-baseline,codes:result.items.map(i=>i.error?.code)}));
 `,
    ],
    { encoding: 'utf8' },
  );
  const result = JSON.parse(output) as { growth: number; codes: string[] };
  expect(result.codes).toEqual(['ZIP_RATIO_EXCEEDED']);
  expect(result.growth).toBeLessThan(30 * 1024 * 1024);
});

it('UT-33 / TC-M3-022: cancellation after Blob read and after yield releases reader', async () => {
  const bytes = archive({ 'a.xml': fullInvoiceXml, 'b.xml': fullInvoiceXml });
  const controller = new AbortController(),
    cancel = vi.fn();
  class AbortRead extends Blob {
    override stream(): ReadableStream<Uint8Array<ArrayBuffer>> {
      return new ReadableStream({
        pull(c) {
          controller.abort();
          c.enqueue(bytes as Uint8Array<ArrayBuffer>);
        },
        cancel,
      });
    }
  }
  await expect(
    parseZip(new AbortRead([bytes as Uint8Array<ArrayBuffer>]), { signal: controller.signal }),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(cancel).toHaveBeenCalledOnce();
  const other = new AbortController(),
    iterator = iterateZip(bytes, { signal: other.signal });
  expect((await iterator.next()).value).toMatchObject({ kind: 'invoice' });
  other.abort();
  await expect(iterator.next()).rejects.toMatchObject({ name: 'AbortError' });
});
it('UT-33 / TC-M3-021: damaged deflate and truncated stream surface ZIP_INVALID', async () => {
  const bytes = archive({ 'a.xml': fullInvoiceXml });
  const bad = bytes.slice();
  const view = new DataView(bad.buffer);
  const start = 30 + view.getUint16(26, true) + view.getUint16(28, true);
  bad[start] = 255;
  expect(codes(await parseZip(bad))).toEqual(['ZIP_INVALID']);
  expect(codes(await parseZip(bytes.subarray(0, start + 5)))).toEqual(['ZIP_INVALID']);
});
it('UT-33 / TC-M3-021: encryption scan is bounded and tolerates unavailable or Zip64 records', async () => {
  const bytes = alteredArchive('encrypted');
  expect(await encryptedEntries(bytes, 0)).toEqual(new Set());
  const zip64 = bytes.slice();
  new DataView(zip64.buffer).setUint16(zip64.length - 12, 65535, true);
  expect(await encryptedEntries(zip64, 5)).toEqual(new Set());
  class BrokenTail extends Blob {
    override slice(): Blob {
      return new (class extends Blob {
        override async arrayBuffer(): Promise<ArrayBuffer> {
          await Promise.resolve();
          throw new Error('tail');
        }
      })();
    }
  }
  expect(await encryptedEntries(new BrokenTail([bytes as Uint8Array<ArrayBuffer>]), 5)).toEqual(new Set());
});
it('UT-33 / TC-M3-022: entry-filter exceptions propagate without becoming ZIP errors', async () => {
  await expect(
    parseZip(archive({ 'a.xml': fullInvoiceXml }), {
      entryFilter() {
        throw new Error('synthetic callback failure');
      },
    }),
  ).rejects.toThrow('synthetic callback failure');
});

it('UT-33 / TC-M3-018: drain entries completed before the top-level count stop', async () => {
  const result = await parseZip(
    archive({
      'a.xml': fullInvoiceXml,
      'b.xml': fullInvoiceXml,
      'c.xml': fullInvoiceXml,
      'd.xml': fullInvoiceXml,
    }),
    { limits: { maxEntries: 3 } },
  );
  expect(result.items.map((i) => i.kind)).toEqual(['invoice', 'invoice', 'invoice', 'error']);
  expect(codes(result)).toEqual(['ZIP_TOO_MANY_ENTRIES']);
});
