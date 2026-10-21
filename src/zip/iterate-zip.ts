import { iterateMany } from '@firatkill/efatura';
import { Unzip, UnzipPassThrough } from 'fflate';
import type { BatchItem, BatchSummary, ZipLimits, ZipOptions } from '../types';
import { archiveChunks } from './chunks';
import { classifyByName, isJunk, isZip } from './classify';
import { createZipContext, sizeOf, source, xmlItems } from './context';
import type { ZipContext } from './context';
import { BoundedInflate, discardEntry } from './decoder';
import { encryptedEntries } from './encryption';
import { zipError } from './errors';
import { mergeLimits } from './limits';

type ArchiveState = {
  entries: number;
  totalBytes: number;
  stopEmitted: boolean;
  stopped: Extract<BatchItem, { kind: 'error' }> | null;
};
type Complete = { kind: 'complete'; path: string; bytes: Uint8Array; type: 'xml' | 'zip' | 'sniff' };
const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));
const looksXml = (bytes: Uint8Array) => {
  let i = 0,
    width = 1,
    offset = 0;
  if (bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) i = 3;
  else if (bytes[0] === 255 && bytes[1] === 254) {
    i = 2;
    width = 2;
  } else if (bytes[0] === 254 && bytes[1] === 255) {
    i = 2;
    width = 2;
    offset = 1;
  }
  for (; i + offset < Math.min(bytes.length, 64); i += width) {
    const b = bytes[i + offset];
    if (b === 60 || (b === 0 && bytes[i + 1] === 60)) return true;
    if (b !== 32 && b !== 9 && b !== 10 && b !== 13) return false;
  }
  return false;
};
/** Walk one top-level archive with fresh resource limits and shared batch context.
 * @example
 * yield* walkArchive(bytes, 'archive.zip', context);
 */
export async function* walkArchive(
  input: Uint8Array | Blob,
  path: string,
  context: ZipContext,
): AsyncGenerator<BatchItem, void, undefined> {
  const limits = mergeLimits(context.options.limits),
    state: ArchiveState = { entries: 0, totalBytes: 0, stopEmitted: false, stopped: null };
  yield* walk(input, path, 1, context, limits, state);
}
async function* walk(
  input: Uint8Array | Blob,
  path: string,
  depth: number,
  context: ZipContext,
  limits: ZipLimits,
  state: ArchiveState,
): AsyncGenerator<BatchItem, void, undefined> {
  const archiveSource = source(path, sizeOf(input), depth - 1),
    emit = function* (item: BatchItem) {
      context.count(item);
      yield item;
      context.report();
    };
  context.options.signal?.throwIfAborted();
  if (depth > limits.maxDepth) {
    yield* emit(zipError('ZIP_DEPTH_EXCEEDED', archiveSource, { max: limits.maxDepth }));
    return;
  }
  let header: Uint8Array;
  try {
    header =
      input instanceof Uint8Array
        ? input.subarray(0, 4)
        : new Uint8Array(await input.slice(0, 4).arrayBuffer());
  } catch (error) {
    context.options.signal?.throwIfAborted();
    yield* emit(zipError('READ_FAILED', archiveSource, { reason: reason(error) }));
    return;
  }
  context.options.signal?.throwIfAborted();
  if (!isZip(header) && !(header[0] === 80 && header[1] === 75 && header[2] === 5 && header[3] === 6)) {
    yield* emit(zipError('ZIP_INVALID', archiveSource, { reason: 'Invalid ZIP signature' }));
    return;
  }
  const encrypted = await encryptedEntries(input, limits.maxEntries);
  const queue: (Complete | BatchItem)[] = [];
  let pushStart = 0,
    pushEnd = 0;
  const stop = (code: 'ZIP_TOO_MANY_ENTRIES' | 'ZIP_TOO_LARGE', max: number) => {
    state.stopped ??= zipError(code, archiveSource, { max });
  };
  const callback = { failed: false, error: undefined as unknown };
  const unzip = new Unzip((file) => {
    try {
      const discard = () => {
        discardEntry(unzip, file);
      };
      if (state.stopped || file.name.endsWith('/') || isJunk(file.name)) {
        discard();
        return;
      }
      const entryPath = `${path}!/${file.name}`,
        entrySource = source(entryPath, file.originalSize ?? 0, depth);
      state.entries++;
      if (state.entries > limits.maxEntries) {
        stop('ZIP_TOO_MANY_ENTRIES', limits.maxEntries);
        discard();
        return;
      }
      const type = classifyByName(file.name);
      if (type === 'other') {
        queue.push({ kind: 'skipped', source: entrySource, reason: 'unsupported-type' });
        discard();
        return;
      }
      if (type === 'xml' && context.options.entryFilter && !context.options.entryFilter(entryPath)) {
        discard();
        return;
      }
      const rejectBefore = (
        code: 'ZIP_ENCRYPTED' | 'ZIP_UNSUPPORTED_METHOD' | 'ZIP_ENTRY_TOO_LARGE',
        details?: Record<string, string | number>,
      ) => {
        queue.push(zipError(code, entrySource, details));
        discard();
      };
      if (encrypted.has(file.name)) {
        rejectBefore('ZIP_ENCRYPTED');
        return;
      }
      if (file.compression !== 0 && file.compression !== 8) {
        rejectBefore('ZIP_UNSUPPORTED_METHOD', { method: file.compression });
        return;
      }
      if (file.originalSize !== undefined && file.originalSize > limits.maxEntryBytes) {
        rejectBefore('ZIP_ENTRY_TOO_LARGE', { max: limits.maxEntryBytes });
        return;
      }
      if (file.originalSize !== undefined && state.totalBytes + file.originalSize > limits.maxTotalBytes) {
        stop('ZIP_TOO_LARGE', limits.maxTotalBytes);
        discard();
        return;
      }
      let chunks: Uint8Array[] = [],
        out = 0,
        rejected = false;
      const entryStart = pushStart;
      const reject = (error: Extract<BatchItem, { kind: 'error' }>) => {
        rejected = true;
        chunks = [];
        file.terminate();
        queue.push(error);
      };
      file.ondata = (error, chunk, final) => {
        if (state.stopped) return;
        if (error) {
          if (!rejected) reject(zipError('ZIP_INVALID', entrySource, { reason: error.message }));
          return;
        }
        out += chunk.length;
        state.totalBytes += chunk.length;
        if (state.totalBytes > limits.maxTotalBytes) {
          rejected = true;
          chunks = [];
          file.terminate();
          stop('ZIP_TOO_LARGE', limits.maxTotalBytes);
          return;
        }
        if (rejected) return;
        if (out > limits.maxEntryBytes) {
          reject(zipError('ZIP_ENTRY_TOO_LARGE', entrySource, { max: limits.maxEntryBytes }));
          return;
        }
        const compressed =
          file.size !== undefined && file.size > 0 ? file.size : Math.max(1, pushEnd - entryStart);
        if (out > limits.ratioMinBytes && out / compressed > limits.maxRatio) {
          reject(zipError('ZIP_RATIO_EXCEEDED', entrySource, { max: limits.maxRatio }));
          return;
        }
        chunks.push(chunk);
        if (final) {
          const bytes = new Uint8Array(out);
          let offset = 0;
          for (const part of chunks) {
            bytes.set(part, offset);
            offset += part.length;
          }
          chunks = [];
          queue.push({ kind: 'complete', path: entryPath, bytes, type });
        }
      };
      unzip.register(file.compression === 8 ? BoundedInflate : UnzipPassThrough);
      file.start();
    } catch (error) {
      callback.failed = true;
      callback.error = error;
      throw error;
    }
  });

  async function* drain(): AsyncGenerator<BatchItem, void, undefined> {
    for (const item of queue.splice(0)) {
      if (item.kind !== 'complete') {
        yield* emit(item);
        continue;
      }
      if (item.type === 'xml') {
        yield* xmlItems(item.bytes, item.path, depth, context);
      } else if (isZip(item.bytes)) {
        yield* walk(item.bytes, item.path, depth + 1, context, limits, state);
      } else if (item.type === 'zip') {
        yield* emit(
          zipError('ZIP_INVALID', source(item.path, item.bytes.length, depth), {
            reason: 'Invalid ZIP signature',
          }),
        );
      } else if (!context.options.entryFilter || context.options.entryFilter(item.path)) {
        if (looksXml(item.bytes)) yield* xmlItems(item.bytes, item.path, depth, context);
        else
          yield* emit({
            kind: 'skipped',
            source: source(item.path, item.bytes.length, depth),
            reason: 'unsupported-type',
          });
      }
    }
    if (state.stopped && !state.stopEmitted) {
      state.stopEmitted = true;
      yield* emit(state.stopped);
    }
  }
  const chunks = archiveChunks(input, context.options.signal);
  // Catch only input reads: callbacks and unexpected core failures must propagate.
  try {
    for (;;) {
      let next: IteratorResult<Uint8Array, void>;
      try {
        next = await chunks.next();
      } catch (error) {
        context.options.signal?.throwIfAborted();
        yield* emit(zipError('READ_FAILED', archiveSource, { reason: reason(error) }));
        return;
      }
      context.options.signal?.throwIfAborted();
      const final = next.done === true,
        chunk = next.done ? new Uint8Array() : next.value;
      pushEnd = pushStart + chunk.length;
      if (depth === 1) context.progress.bytesDone += chunk.length;
      try {
        unzip.push(chunk, final);
      } catch (error) {
        if (callback.failed) throw callback.error;
        yield* emit(zipError('ZIP_INVALID', archiveSource, { reason: reason(error) }));
        return;
      }
      pushStart = pushEnd;
      yield* drain();
      if (state.stopped) return;
      if (final) break;
      await context.maybeYield();
    }
    if (pushEnd < 22) {
      yield* emit(zipError('ZIP_INVALID', archiveSource, { reason: 'Invalid ZIP archive' }));
      return;
    }
    context.summary.archives++;
  } finally {
    await chunks.return();
  }
}
/** Iterate nested ZIP XML entries with resource limits, progress and cancellation.
 * @example
 * for await (const item of iterateZip(bytes)) console.log(item.kind);
 */
export async function* iterateZip(
  input: Uint8Array | ArrayBuffer | Blob,
  options: ZipOptions = {},
): AsyncGenerator<BatchItem, BatchSummary, undefined> {
  const data = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  const context = createZipContext(options, null, sizeOf(data));
  await iterateMany([], context.batchOptions).next();
  yield* walkArchive(data, options.name ?? 'archive.zip', context);
  context.report(true);
  return context.summary;
}
