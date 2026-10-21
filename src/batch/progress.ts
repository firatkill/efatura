import { PROGRESS_INTERVAL_MS } from '../config';
import { now as defaultNow } from '../internal/clock';
import type { BatchOptions, BatchProgress } from '../types';
/** Throttle progress with an unconditional final flush and injectable clock.
 * @example
 * const report = createProgress(onProgress); report(progress, true);
 */
export function createProgress(
  callback: BatchOptions['onProgress'],
  now = defaultNow,
): (progress: BatchProgress, final?: boolean) => void {
  let last = now();
  return (progress, final = false) => {
    const time = now();
    if (callback && (final || time - last >= PROGRESS_INTERVAL_MS)) {
      last = time;
      callback({ ...progress });
    }
  };
}
