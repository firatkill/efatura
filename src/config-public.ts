import {
  DEFAULT_TOLERANCE,
  DEFAULT_ZIP_LIMITS,
  MAX_XML_BYTES,
  PLAYGROUND,
  YIELD_BUDGET_MS,
  PROGRESS_INTERVAL_MS,
  ZIP_PUSH_CHUNK_BYTES,
  ZIP_INFLATE_CHUNK_BYTES,
} from './config';

/** Shared immutable package and playground configuration.
 * @example
 * efaturaConfig.zipLimits.maxDepth; // 3
 */
export const efaturaConfig = /* @__PURE__ */ Object.freeze({
  yieldBudgetMs: YIELD_BUDGET_MS,
  progressIntervalMs: PROGRESS_INTERVAL_MS,
  zipPushChunkBytes: ZIP_PUSH_CHUNK_BYTES,
  zipInflateChunkBytes: ZIP_INFLATE_CHUNK_BYTES,
  maxXmlBytes: MAX_XML_BYTES,
  defaultTolerance: DEFAULT_TOLERANCE,
  zipLimits: /* @__PURE__ */ Object.freeze(DEFAULT_ZIP_LIMITS),
  playground: /* @__PURE__ */ Object.freeze(PLAYGROUND),
});
