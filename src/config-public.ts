import { DEFAULT_TOLERANCE, DEFAULT_ZIP_LIMITS, MAX_XML_BYTES, PLAYGROUND } from './config';

/** Shared immutable package and playground configuration.
 * @example
 * efaturaConfig.zipLimits.maxDepth; // 3
 */
export const efaturaConfig = /* @__PURE__ */ Object.freeze({
  maxXmlBytes: MAX_XML_BYTES,
  defaultTolerance: DEFAULT_TOLERANCE,
  zipLimits: /* @__PURE__ */ Object.freeze(DEFAULT_ZIP_LIMITS),
  playground: /* @__PURE__ */ Object.freeze(PLAYGROUND),
});
