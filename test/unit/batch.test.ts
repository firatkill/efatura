import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDuplicateTracker, iterateMany, parseMany, efaturaConfig } from '../../src/index';
import { createProgress } from '../../src/batch/progress';
import { looksLikeXml } from '../../src/batch/input';
import type { BatchProgress } from '../../src/types';
import { fullInvoiceXml as xml } from '../helpers/invoice';

const named = (name = 'a.xml', data: string | Uint8Array | ArrayBuffer | Blob = xml) => ({ name, data });
const bytes = new TextEncoder().encode(xml);
afterEach(() => vi.restoreAllMocks());
describe('T-23 / UT-32 / FR-22–28', () => {
  it('TC-M3-001 named types, async order and defaults', async () => {
    async function* files() {
      await Promise.resolve();
      yield named();
      yield named('b.xml', bytes);
      yield named('c.xml', bytes.buffer);
      yield named('d.xml', new Blob([xml]));
      yield new File([xml], 'e.xml');
    }
    const result = await parseMany(files(), { validate: false });
    expect(result.items.map((i) => i.source.name)).toEqual(['a.xml', 'b.xml', 'c.xml', 'd.xml', 'e.xml']);
    for (const item of result.items) {
      expect(item.kind).toBe('invoice');
      if (item.kind === 'invoice') {
        expect(item.invoice.raw).toBeNull();
        expect(item.bytes).toBeUndefined();
        expect(item.invoice.attachments.every((a) => a.base64 === null)).toBe(true);
      }
    }
    const explicit = await parseMany([named()], { includeRaw: true, attachments: 'data', validate: false });
    expect(explicit.items[0]?.kind === 'invoice' && explicit.items[0].invoice.raw).toBeTruthy();
  });
  it('TC-M3-002 source size and byte retention', async () => {
    const result = await parseMany([named('dir/a.xml'), named('b.xml', bytes)], {
      keepBytes: true,
      validate: false,
    });
    expect(result.items[0]?.source).toEqual({
      path: 'dir/a.xml',
      name: 'a.xml',
      bytes: xml.length,
      depth: 0,
    });
    for (const item of result.items) if (item.kind === 'invoice') expect(item.bytes).toEqual(bytes);
    expect(result.items[1]?.source.bytes).toBe(bytes.length);
  });
  it('TC-M3-003 classification handles strings, bytes and BOMs', async () => {
    const result = await parseMany(
      [
        named('a.txt', 'junk'),
        named('b.txt', new Uint8Array([1])),
        named('noext', xml),
        named('bad.XML', 'junk'),
        named('archive', new Uint8Array([80, 75, 3, 4])),
      ],
      { validate: false },
    );
    expect(result.items.map((i) => i.kind)).toEqual(['skipped', 'skipped', 'invoice', 'error', 'error']);
    expect(result.items[4]).toMatchObject({
      error: {
        code: 'ZIP_INPUT_REQUIRES_ZIP_ENTRY',
        message: 'This is a ZIP archive; use parseZip or parseAny from @firatkill/efatura/zip.',
        messageTr: 'Bu bir ZIP arşivi; @firatkill/efatura/zip içindeki parseZip veya parseAny kullanılmalı.',
      },
    });
    for (const input of [
      ' \t\r\n<Invoice/>',
      new Uint8Array([239, 187, 191, 32, 60]),
      new Uint8Array([255, 254, 32, 0, 60, 0]),
      new Uint8Array([254, 255, 0, 32, 0, 60]),
      new Uint8Array([0, 60]),
    ])
      expect(looksLikeXml(input)).toBe(true);
    expect(looksLikeXml(' '.repeat(64) + '<')).toBe(false);
    expect(looksLikeXml('')).toBe(false);
  });
  it('TC-M3-004 recoverable failures and unexpected errors', async () => {
    const blob = new Blob([xml]);
    vi.spyOn(blob, 'arrayBuffer').mockRejectedValue(new Error('unreadable'));
    const result = await parseMany([named('read.xml', blob), named('bad.xml', '<'), named()], {
      validate: false,
    });
    expect(result.items[0]).toMatchObject({
      kind: 'error',
      error: {
        code: 'READ_FAILED',
        message: 'The file could not be read: unreadable',
        messageTr: 'Dosya okunamadı: unreadable',
        details: { reason: 'unreadable' },
      },
    });
    expect(result.items[1]).toMatchObject({ kind: 'error', error: { code: 'NOT_XML' } });
    expect(result.items[2]?.kind).toBe('invoice');
    vi.spyOn(blob, 'arrayBuffer').mockRejectedValue('failure');
    expect((await parseMany([named('a', blob)])).items[0]).toMatchObject({
      error: { details: { reason: 'failure' } },
    });
    const error = new Error('tracker bug');
    const tracker = createDuplicateTracker();
    vi.spyOn(tracker, 'check').mockImplementation(() => {
      throw error;
    });
    await expect(parseMany([named()], { duplicateTracker: tracker })).rejects.toBe(error);
  });
  it('TC-M3-007 tracker state, first values, reset and independent calls', async () => {
    const tracker = createDuplicateTracker();
    expect(tracker.check('ABC', '')).toBeNull();
    expect(tracker.check('abc', 'later')).toBe('');
    expect(tracker.checkNumber('supplier', 'number', 'ABC')).toBeNull();
    expect(tracker.checkNumber('supplier', 'number', 'abc')).toBeNull();
    expect(tracker.checkNumber('supplier', 'number', 'DEF')).toBe('abc');
    tracker.reset();
    expect(tracker.check('abc', 'new')).toBeNull();
    expect(tracker.checkNumber('supplier', 'number', 'def')).toBeNull();
    await parseMany([named()], { duplicateTracker: tracker, validate: false });
    expect(
      (await parseMany([named('b.xml')], { duplicateTracker: tracker, validate: false })).summary.duplicates,
    ).toBe(1);
    expect((await parseMany([named()], { validate: false })).summary.duplicates).toBe(0);
  });
  it('TC-M3-008 summary counts detections even with EF090 off', async () => {
    const result = await parseMany(
      [named(), named('b.xml'), named('skip.txt', 'junk'), named('bad.xml', '<')],
      { validate: false, rules: { EF090: 'off' } },
    );
    expect(result.summary).toEqual({
      files: 4,
      archives: 0,
      invoices: 2,
      duplicates: 1,
      failed: 1,
      skipped: 1,
      issues: { error: 0, warning: 0, info: 0 },
      invoicesWithErrors: 0,
      invoicesWithWarnings: 0,
    });
    const flagged = await parseMany([named(), named('b.xml')], {
      validate: false,
      rules: { EF090: 'error' },
    });
    expect(flagged.summary.issues.error).toBe(1);
    expect(flagged.summary.invoicesWithErrors).toBe(1);
    const warn = await parseMany([named(), named('b.xml')], { validate: false });
    expect(warn.summary.invoicesWithWarnings).toBe(1);
  });
  it('TC-M3-009 progress throttle, final flush and known/unknown totals', async () => {
    let time = 0;
    const calls: BatchProgress[] = [];
    const report = createProgress(
      (p) => calls.push(p),
      () => time,
    );
    const p: BatchProgress = {
      filesDone: 0,
      filesTotal: null,
      bytesDone: 0,
      bytesTotal: null,
      invoices: 0,
      failed: 0,
      currentPath: null,
    };
    for (time = 0; time < 250; time += 10) report(p);
    expect(calls).toHaveLength(2);
    report(p, true);
    expect(calls).toHaveLength(3);
    createProgress(undefined, () => 0)(p, true);
    const updates: BatchProgress[] = [];
    await parseMany([named()], { validate: false, onProgress: (p) => updates.push(p) });
    expect(updates.at(-1)).toEqual({
      filesDone: 1,
      filesTotal: 1,
      bytesDone: xml.length,
      bytesTotal: xml.length,
      invoices: 1,
      failed: 0,
      currentPath: 'a.xml',
    });
    async function* files() {
      await Promise.resolve();
      yield named();
    }
    await parseMany(files(), { validate: false, onProgress: (p) => updates.push(p) });
    expect(updates.at(-1)?.filesTotal).toBeNull();
    expect(updates.at(-1)?.bytesTotal).toBeNull();
    await parseMany([], { onProgress: (p) => updates.push(p) });
    expect(updates.at(-1)).toMatchObject({ filesDone: 0, filesTotal: 0, currentPath: null });
  });
  it('TC-M3-009 failed reads consume no bytes', async () => {
    const blob = new Blob([xml]);
    vi.spyOn(blob, 'arrayBuffer').mockRejectedValue(new Error('read failed'));
    const updates: BatchProgress[] = [];
    await parseMany([named('failed.xml', blob), named()], {
      validate: false,
      onProgress: (p) => updates.push(p),
    });
    expect(updates.at(-1)).toMatchObject({
      filesDone: 2,
      failed: 1,
      bytesDone: xml.length,
      bytesTotal: blob.size + xml.length,
    });
  });
  it('TC-M3-010 abort before first and during third read', async () => {
    const controller = new AbortController(),
      reason = new Error('cancel');
    controller.abort(reason);
    await expect(parseMany([named()], { signal: controller.signal })).rejects.toBe(reason);
    const active = new AbortController(),
      blob = new Blob([xml]);
    vi.spyOn(blob, 'arrayBuffer').mockImplementation(() => {
      active.abort(reason);
      return Promise.resolve(bytes.buffer);
    });
    const iterator = iterateMany([named(), named('b.xml'), named('c.xml', blob), named('d.xml')], {
      signal: active.signal,
      validate: false,
    });
    expect((await iterator.next()).done).toBe(false);
    expect((await iterator.next()).done).toBe(false);
    await expect(iterator.next()).rejects.toBe(reason);
  });
  it('TC-M3-011 yields within each 50ms of simulated work', async () => {
    let time = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => time);
    const yields: number[] = [];
    vi.stubGlobal('scheduler', {
      yield: () => {
        yields.push(time);
        return Promise.resolve();
      },
    });
    try {
      async function* files() {
        await Promise.resolve();
        for (let i = 0; i < 200; i++) {
          time += 10;
          yield named(`${String(i)}.xml`);
        }
      }
      await parseMany(files(), { validate: false });
      expect(yields).toHaveLength(40);
      expect(yields.every((t, i) => t === (i + 1) * 50)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(efaturaConfig).toMatchObject({
      yieldBudgetMs: 50,
      progressIntervalMs: 100,
      zipPushChunkBytes: 1024 * 1024,
    });
  });
});
