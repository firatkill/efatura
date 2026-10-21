import { iterateMany } from '@firatkill/efatura';
import type { BatchItem, BatchSummary, InputFile, ZipOptions } from '../types';
import { createZipContext, dataOf, sizeOf, source, xmlItems } from './context';
import { isZip } from './classify';
import { zipError } from './errors';
import { mergeLimits } from './limits';
import { walkArchive } from './iterate-zip';
/** Process mixed XML and ZIP inputs with one duplicate tracker and summary.
 * @example
 * for await (const item of iterateAny(files)) console.log(item.source.path);
 */
export async function* iterateAny(
  files: Iterable<InputFile | File> | AsyncIterable<InputFile | File>,
  options: ZipOptions = {},
): AsyncGenerator<BatchItem, BatchSummary, undefined> {
  mergeLimits(options.limits);
  const context = createZipContext(
    options,
    null,
    Array.isArray(files)
      ? (files as (InputFile | File)[]).reduce((n, file) => n + sizeOf(dataOf(file)), 0)
      : null,
  );
  await iterateMany([], context.batchOptions).next();
  for await (const file of files) {
    options.signal?.throwIfAborted();
    const data = dataOf(file);
    let header: Uint8Array;
    try {
      header =
        typeof data === 'string'
          ? new Uint8Array()
          : data instanceof Blob
            ? new Uint8Array(await data.slice(0, 4).arrayBuffer())
            : data instanceof Uint8Array
              ? data
              : new Uint8Array(data);
    } catch (error) {
      options.signal?.throwIfAborted();
      const item = zipError('READ_FAILED', source(file.name, sizeOf(data), 0), {
        reason: error instanceof Error ? error.message : String(error),
      });
      context.count(item);
      yield item;
      context.report();
      continue;
    }
    if (isZip(header) && typeof data !== 'string')
      yield* walkArchive(data instanceof ArrayBuffer ? new Uint8Array(data) : data, file.name, context);
    else yield* xmlItems(data, file.name, 0, context, true);
    await context.maybeYield();
  }
  context.report(true);
  return context.summary;
}
