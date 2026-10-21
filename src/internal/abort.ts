/** Propagate cancellation using the caller's original reason.
 * @example
 * throwIfAborted(new AbortController().signal);
 */
export function throwIfAborted(signal?: AbortSignal): void {
  signal?.throwIfAborted();
}
