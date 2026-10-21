import { efaturaConfig } from '@firatkill/efatura';
/** Immutable default per-archive limits shared with the core.
 * @example
 * DEFAULT_ZIP_LIMITS.maxDepth; // 3
 */
export const DEFAULT_ZIP_LIMITS = efaturaConfig.zipLimits;
/** Detect ZIP header magic.
 * @example
 * isZip(bytes);
 */
export { isZip } from './zip/classify';
/** Iterate nested ZIP entries.
 * @example
 * for await (const item of iterateZip(bytes)) console.log(item.kind);
 */
export { iterateZip } from './zip/iterate-zip';
/** Iterate mixed XML and ZIP inputs.
 * @example
 * for await (const item of iterateAny(files)) console.log(item.kind);
 */
export { iterateAny } from './zip/iterate-any';
/** Collect ZIP or mixed-input results.
 * @example
 * const result = await parseZip(bytes);
 */
export { parseZip, parseAny } from './zip/collect';
