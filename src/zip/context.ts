import { createDuplicateTracker, efaturaConfig, iterateMany } from '@firatkill/efatura';
import type { BatchItem, BatchProgress, BatchSummary, InputFile, SourceRef, ZipOptions } from '../types';
/** Virtual source metadata, never a filesystem path.
 * @example
 * source('archive.zip!/a.xml', 10, 1);
 */
export const source = (path: string, bytes: number, depth: number): SourceRef => ({
  path,
  name: path.slice(path.lastIndexOf('/') + 1),
  bytes,
  depth,
});
/** Extract File or named data.
 * @example
 * dataOf({name:'a.xml',data:'<Invoice/>'});
 */
export const dataOf = (file: InputFile | File) => ('data' in file ? file.data : file);
/** Source size without a Blob read.
 * @example
 * sizeOf(new Uint8Array(3)); // 3
 */
export const sizeOf = (data: InputFile['data']): number =>
  typeof data === 'string' ? data.length : data instanceof Blob ? data.size : data.byteLength;
/** Per-call counters and progress; duplicate state alone may be shared.
 * @example
 * const context = createZipContext(options);
 */
export function createZipContext(
  options: ZipOptions,
  filesTotal: number | null = null,
  bytesTotal: number | null = null,
) {
  const batchOptions = { ...options, duplicateTracker: options.duplicateTracker ?? createDuplicateTracker() };
  delete batchOptions.onProgress;
  const summary: BatchSummary = {
    files: 0,
    archives: 0,
    invoices: 0,
    duplicates: 0,
    failed: 0,
    skipped: 0,
    issues: { error: 0, warning: 0, info: 0 },
    invoicesWithErrors: 0,
    invoicesWithWarnings: 0,
  };
  const progress: BatchProgress = {
    filesDone: 0,
    filesTotal,
    bytesDone: 0,
    bytesTotal,
    invoices: 0,
    failed: 0,
    currentPath: null,
  };
  let lastReport = performance.now(),
    lastYield = lastReport;
  return {
    options,
    batchOptions,
    summary,
    progress,
    count(item: BatchItem) {
      summary.files++;
      progress.filesDone = summary.files;
      progress.currentPath = item.source.path;
      if (item.kind === 'invoice') {
        summary.invoices++;
        const levels = new Set(item.issues.map((issue) => issue.severity));
        for (const issue of item.issues) summary.issues[issue.severity]++;
        if (levels.has('error')) summary.invoicesWithErrors++;
        if (levels.has('warning')) summary.invoicesWithWarnings++;
      } else if (item.kind === 'error') summary.failed++;
      else if (item.kind === 'skipped') summary.skipped++;
      progress.invoices = summary.invoices;
      progress.failed = summary.failed;
    },
    report(final = false) {
      const now = performance.now();
      if (options.onProgress && (final || now - lastReport >= efaturaConfig.progressIntervalMs)) {
        lastReport = now;
        options.onProgress({ ...progress });
      }
    },
    async maybeYield() {
      options.signal?.throwIfAborted();
      if (performance.now() - lastYield >= efaturaConfig.yieldBudgetMs) {
        const scheduler = (globalThis as typeof globalThis & { scheduler?: { yield(): Promise<void> } })
          .scheduler;
        await (scheduler ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0)));
        options.signal?.throwIfAborted();
        lastYield = performance.now();
      }
    },
  };
}
/** ZIP iterator shared state, internal to this entry point.
 * @example
 * const context: ZipContext = createZipContext({});
 */
export type ZipContext = ReturnType<typeof createZipContext>;
/** Process a leaf through the one public core instance and accumulate its duplicate count.
 * @example
 * yield* xmlItems(data, 'a.xml', 0, context, true);
 */
export async function* xmlItems(
  data: InputFile['data'],
  path: string,
  depth: number,
  context: ZipContext,
  top = false,
): AsyncGenerator<BatchItem, void, undefined> {
  const iterator = iterateMany([{ name: path, data }], context.batchOptions);
  let next = await iterator.next();
  while (!next.done) {
    const item = { ...next.value, source: { ...next.value.source, depth } };
    if (top && !(item.kind === 'error' && item.error.code === 'READ_FAILED'))
      context.progress.bytesDone += sizeOf(data);
    context.count(item);
    yield item;
    context.report();
    next = await iterator.next();
  }
  context.summary.duplicates += next.value.duplicates;
}
