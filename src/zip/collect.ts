import type { BatchItem, BatchResult, BatchSummary, InputFile, ZipOptions } from '../types';
import { iterateZip } from './iterate-zip';
import { iterateAny } from './iterate-any';
async function collect(iterator: AsyncGenerator<BatchItem, BatchSummary, undefined>): Promise<BatchResult> {
  const items: BatchItem[] = [];
  let next = await iterator.next();
  while (!next.done) {
    items.push(next.value);
    next = await iterator.next();
  }
  return { items, summary: next.value };
}
/** Collect nested ZIP entries and final counters.
 * @example
 * const result = await parseZip(bytes);
 */
export const parseZip = (
  input: Uint8Array | ArrayBuffer | Blob,
  options?: ZipOptions,
): Promise<BatchResult> => collect(iterateZip(input, options));
/** Collect mixed XML and ZIP inputs in input order.
 * @example
 * const result = await parseAny(files);
 */
export const parseAny = (
  files: Iterable<InputFile | File> | AsyncIterable<InputFile | File>,
  options?: ZipOptions,
): Promise<BatchResult> => collect(iterateAny(files, options));
