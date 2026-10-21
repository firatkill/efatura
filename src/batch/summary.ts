import type { BatchItem, BatchSummary } from '../types';
/** Create per-call counters.
 * @example
 * const summary = emptySummary();
 */
export const emptySummary = (): BatchSummary => ({
  files: 0,
  archives: 0,
  invoices: 0,
  duplicates: 0,
  failed: 0,
  skipped: 0,
  issues: { error: 0, warning: 0, info: 0 },
  invoicesWithErrors: 0,
  invoicesWithWarnings: 0,
});
/** Count one yielded item; detection is separate from visible diagnostics.
 * @example
 * countItem(summary, item, false);
 */
export function countItem(summary: BatchSummary, item: BatchItem, duplicate = false): void {
  summary.files++;
  if (duplicate || item.kind === 'duplicate') summary.duplicates++;
  if (item.kind === 'invoice') {
    summary.invoices++;
    const severities = new Set<string>();
    for (const issue of item.issues) {
      summary.issues[issue.severity]++;
      severities.add(issue.severity);
    }
    if (severities.has('error')) summary.invoicesWithErrors++;
    if (severities.has('warning')) summary.invoicesWithWarnings++;
  } else if (item.kind === 'error') summary.failed++;
  else if (item.kind === 'skipped') summary.skipped++;
}
