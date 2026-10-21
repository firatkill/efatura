import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { efaturaConfig } from '@firatkill/efatura';
import { classifyByName, isJunk, isZip } from '../../src/zip/classify';
import { mergeLimits } from '../../src/zip/limits';
import { zipError } from '../../src/zip/errors';
import type { BatchErrorCode, ZipErrorCode, ZipLimits } from '../../src/types';

it('TC-M3-012 / T-24 FR-24 FR-27: classifications and all junk names', () => {
  for (const [name, expected] of [
    ['a.XML', 'xml'],
    ['a.Zip', 'zip'],
    ['dir.with.dot/entry', 'sniff'],
    ['x.pdf', 'other'],
    ['x.html', 'other'],
    ['x.xslt', 'other'],
    ['x.txt', 'other'],
    ['dir/', 'sniff'],
  ] as const)
    expect(classifyByName(name)).toBe(expected);
  for (const path of [
    '__MACOSX/a.xml',
    'a/__MACOSX/b.xml',
    '.DS_Store',
    'a/.DS_Store',
    'Thumbs.db',
    'a/Thumbs.db',
    'desktop.ini',
    'a/desktop.ini',
    '._invoice.xml',
    'a/._invoice.xml',
  ])
    expect(isJunk(path)).toBe(true);
  for (const path of ['a.xml', '__macosx/a.xml', 'a.DS_Store', 'Desktop.ini', '../a.xml'])
    expect(isJunk(path)).toBe(false);
  expect(isZip(new Uint8Array([80, 75, 3, 4, 0]))).toBe(true);
  for (const input of [
    [],
    [80],
    [80, 75],
    [80, 75, 3],
    [0, 75, 3, 4],
    [80, 0, 3, 4],
    [80, 75, 0, 4],
    [80, 75, 3, 0],
  ])
    expect(isZip(new Uint8Array(input))).toBe(false);
});
it('TC-M3-013 / T-24 FR-24: positive finite limit merging', () => {
  const defaults = mergeLimits();
  expect(defaults).toEqual(efaturaConfig.zipLimits);
  expect(defaults).not.toBe(efaturaConfig.zipLimits);
  for (const key of Object.keys(defaults) as (keyof ZipLimits)[]) {
    expect(mergeLimits({ [key]: 3 })).toEqual({ ...defaults, [key]: 3 });
    for (const invalid of [0, -1, NaN, Infinity, -Infinity, undefined, '3'])
      expect(() => mergeLimits({ [key]: invalid })).toThrow(TypeError);
  }
  expect(efaturaConfig.zipLimits).toEqual(defaults);
});
it('TC-M3-014 / T-24 FR-24: every bilingual batch/ZIP error matches TRD §10.4', () => {
  const trd =
    readFileSync(new URL('../../docs/TRD.md', import.meta.url), 'utf8')
      .split('### 10.4 Batch and ZIP error codes')[1]
      ?.split('## 11.')[0] ?? '';
  const rows = trd.split('\n').filter((line) => /^\| `(READ_FAILED|ZIP_)/.test(line));
  expect(rows).toHaveLength(10);
  const source = { path: 'archive.zip!/a.xml', name: 'a.xml', bytes: 0, depth: 1 };
  for (const row of rows) {
    const cells = row.split('|').map((cell) => cell.trim().replaceAll('`', ''));
    const code = cells[1] as ZipErrorCode | BatchErrorCode,
      param = cells[5];
    const details =
      param === '—' ? undefined : { [param ?? 'reason']: param === 'reason' ? 'synthetic failure' : 12 };
    const expected = (text: string) =>
      text.replace(/\{(\w+)\}/g, (_match: string, key: string) => String(details?.[key]));
    expect(zipError(code, source, details)).toEqual({
      kind: 'error',
      source,
      error: {
        code,
        message: expected(cells[3] ?? ''),
        messageTr: expected(cells[4] ?? ''),
        ...(details === undefined ? {} : { details }),
      },
    });
  }
});
