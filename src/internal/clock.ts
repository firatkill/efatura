/** Monotonic clock for cooperative work budgets.
 * @example
 * const started = now();
 */
export function now(): number {
  return performance.now();
}
