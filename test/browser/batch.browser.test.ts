import { expect, test } from 'vitest';
import { parseMany, createDuplicateTracker } from '@firatkill/efatura';
import { fullInvoiceXml } from '../helpers/invoice';

test('TC-M3-001 TC-M3-007 TC-M3-010 / UT-32 FR-22 FR-23 FR-26: browser batch Files, tracker and abort', async () => {
  const duplicateTracker = createDuplicateTracker();
  const first = await parseMany([new File([fullInvoiceXml], 'first.xml')], {
    duplicateTracker,
    keepBytes: true,
  });
  expect(first.summary.invoices).toBe(1);
  expect(structuredClone(first)).toEqual(first);
  const second = await parseMany([{ name: 'copy.xml', data: new Blob([fullInvoiceXml]) }], {
    duplicateTracker,
    duplicates: 'skip',
  });
  expect(second.items[0]).toMatchObject({ kind: 'duplicate', firstSource: 'first.xml' });
  const abort = new AbortController();
  abort.abort('cancelled');
  await expect(parseMany([], { signal: abort.signal })).rejects.toBe('cancelled');
});
