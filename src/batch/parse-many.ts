import type { BatchOptions, BatchResult, InputFile } from '../types';
import { iterateMany } from './iterate-many';
/** Collect batch items and the generator's final summary.
 * @example
 * const { items, summary } = await parseMany([{name: 'a.xml', data: xml}]);
 */
export async function parseMany(
  files: Iterable<InputFile | File> | AsyncIterable<InputFile | File>,
  options?: BatchOptions,
): Promise<BatchResult> {
  const iterator = iterateMany(files, options),
    items: BatchResult['items'] = [];
  let next = await iterator.next();
  while (!next.done) {
    items.push(next.value);
    next = await iterator.next();
  }
  return { items, summary: next.value };
}
