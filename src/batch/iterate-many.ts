import { DEFAULT_DUPLICATES } from '../config';
import { EfaturaParseError } from '../errors';
import { throwIfAborted } from '../internal/abort';
import { createYielder } from '../internal/yield';
import { parseInvoice } from '../parse';
import { createIssue, finishIssues } from '../validate/issue';
import { checkOptions } from '../validate/options';
import type { BatchItem, BatchOptions, BatchSummary, InputFile } from '../types';
import { createDuplicateTracker } from './duplicates';
import { inputData, inputSize, isZipMagic, looksLikeXml } from './input';
import { sourceRef } from './source';
import { countItem, emptySummary } from './summary';
import { createProgress } from './progress';

/** Iterate named XML inputs with cancellation, duplicates and progress.
 * @example
 * for await (const item of iterateMany([{name: 'a.xml', data: xml}])) console.log(item.kind);
 */
export async function* iterateMany(
  files: Iterable<InputFile | File> | AsyncIterable<InputFile | File>,
  options: BatchOptions = {},
): AsyncGenerator<BatchItem, BatchSummary, undefined> {
  checkOptions(options);
  throwIfAborted(options.signal);
  const tracker = options.duplicateTracker ?? createDuplicateTracker();
  const summary = emptySummary(),
    maybeYield = createYielder(),
    report = createProgress(options.onProgress);
  const progress = {
    filesDone: 0,
    filesTotal: Array.isArray(files) ? files.length : null,
    bytesDone: 0,
    bytesTotal: Array.isArray(files)
      ? (files as (InputFile | File)[]).reduce((n, f) => n + inputSize(inputData(f)), 0)
      : null,
    invoices: 0,
    failed: 0,
    currentPath: null as string | null,
  };
  const parseOptions = { ...options };
  delete parseOptions.rules;
  for await (const file of files) {
    throwIfAborted(options.signal);
    const data = inputData(file),
      source = sourceRef(file.name, inputSize(data));
    let item: BatchItem | undefined,
      duplicate = false;
    let bytes: string | Uint8Array = '';
    try {
      bytes =
        typeof data === 'string'
          ? data
          : data instanceof Uint8Array
            ? data
            : new Uint8Array(data instanceof Blob ? await data.arrayBuffer() : data);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      item = {
        kind: 'error',
        source,
        error: {
          code: 'READ_FAILED',
          message: `The file could not be read: ${reason}`,
          messageTr: `Dosya okunamadı: ${reason}`,
          details: { reason },
        },
      };
    }
    throwIfAborted(options.signal);
    if (!item) {
      if (isZipMagic(bytes)) {
        progress.filesTotal = null;
        item = {
          kind: 'error',
          source,
          error: {
            code: 'ZIP_INPUT_REQUIRES_ZIP_ENTRY',
            message: 'This is a ZIP archive; use parseZip or parseAny from @firatkill/efatura/zip.',
            messageTr:
              'Bu bir ZIP arşivi; @firatkill/efatura/zip içindeki parseZip veya parseAny kullanılmalı.',
          },
        };
      } else if (!file.name.toLowerCase().endsWith('.xml') && !looksLikeXml(bytes))
        item = { kind: 'skipped', source, reason: 'unsupported-type' };
      else {
        try {
          const result = parseInvoice(bytes, {
            ...parseOptions,
            includeRaw: options.includeRaw ?? false,
            attachments: options.attachments ?? 'metadata',
          });
          const { invoice, issues, encoding } = result;
          const first = invoice.uuid === null ? null : tracker.check(invoice.uuid.toLowerCase(), source.path);
          duplicate = first !== null;
          if (
            first !== null &&
            invoice.uuid !== null &&
            (options.duplicates ?? DEFAULT_DUPLICATES) === 'skip'
          )
            item = { kind: 'duplicate', source, uuid: invoice.uuid, firstSource: first };
          else {
            if (first !== null)
              issues.push(
                createIssue(
                  'EF090',
                  '/Invoice/cbc:UUID',
                  { value: invoice.uuid ?? '', firstSource: first },
                  { firstSource: first },
                ),
              );
            if (invoice.supplier?.taxId != null && invoice.number !== null) {
              const firstUuid = tracker.checkNumber(
                invoice.supplier.taxId.value,
                invoice.number,
                invoice.uuid ?? '',
              );
              if (firstUuid !== null)
                issues.push(createIssue('EF091', '/Invoice/cbc:ID', { number: invoice.number, firstUuid }));
            }
            item = {
              kind: 'invoice',
              source,
              invoice,
              issues: finishIssues(issues, options),
              encoding,
              ...(options.keepBytes
                ? { bytes: typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes }
                : {}),
            };
          }
        } catch (error) {
          if (!(error instanceof EfaturaParseError)) throw error;
          item = {
            kind: 'error',
            source,
            error: {
              code: error.code,
              message: error.message,
              messageTr: error.messageTr,
              details: error.details,
            },
          };
        }
      }
    }
    countItem(summary, item, duplicate);
    progress.filesDone = summary.files;
    progress.bytesDone += item.kind === 'error' && item.error.code === 'READ_FAILED' ? 0 : source.bytes;
    progress.invoices = summary.invoices;
    progress.failed = summary.failed;
    progress.currentPath = source.path;
    yield item;
    report(progress);
    await maybeYield(options.signal);
  }
  report(progress, true);
  return summary;
}
