import { YIELD_BUDGET_MS } from '../config';
import { throwIfAborted } from './abort';
import { now as defaultNow } from './clock';

/** Yield so pending messages and cancellation can be processed.
 * @example
 * await yieldToEventLoop();
 */
export function yieldToEventLoop(): Promise<void> {
  const scheduler = (globalThis as typeof globalThis & { scheduler?: { yield(): Promise<void> } }).scheduler;
  return scheduler ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0));
}

/** Create an independent elapsed-work budget with an injectable clock.
 * @example
 * const maybeYield = createYielder();
 * await maybeYield();
 */
export function createYielder(
  budgetMs = YIELD_BUDGET_MS,
  now = defaultNow,
): (signal?: AbortSignal) => Promise<void> {
  let lastYield = now();
  return async (signal) => {
    throwIfAborted(signal);
    if (now() - lastYield >= budgetMs) {
      await yieldToEventLoop();
      throwIfAborted(signal);
      lastYield = now();
    }
  };
}
