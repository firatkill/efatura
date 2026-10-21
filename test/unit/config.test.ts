import { expect, it } from 'vitest';
import * as config from '../../src/config';
import { efaturaConfig } from '../../src/config-public';

it('TC-M1-002 / UT-39: public configuration equals the normative constants and is deeply frozen', () => {
  expect(efaturaConfig).toEqual({
    yieldBudgetMs: 50,
    progressIntervalMs: 100,
    zipPushChunkBytes: 1024 * 1024,
    maxXmlBytes: 50 * 1024 * 1024,
    defaultTolerance: '0.01',
    zipLimits: {
      maxDepth: 3,
      maxEntries: 5000,
      maxTotalBytes: 500 * 1024 * 1024,
      maxEntryBytes: 50 * 1024 * 1024,
      maxRatio: 100,
      ratioMinBytes: 1024 * 1024,
    },
    playground: {
      pageSize: 100,
      workerBatchMs: 100,
      workerBatchItems: 250,
      retainLimitBytes: 256 * 1024 * 1024,
      largeSelectionBytes: 200 * 1024 * 1024,
      maxXsltBytes: 5 * 1024 * 1024,
      filterDebounceMs: 200,
      mobileBreakpointPx: 640,
    },
  });
  expect(efaturaConfig).toEqual({
    yieldBudgetMs: config.YIELD_BUDGET_MS,
    progressIntervalMs: config.PROGRESS_INTERVAL_MS,
    zipPushChunkBytes: config.ZIP_PUSH_CHUNK_BYTES,
    maxXmlBytes: config.MAX_XML_BYTES,
    defaultTolerance: config.DEFAULT_TOLERANCE,
    zipLimits: config.DEFAULT_ZIP_LIMITS,
    playground: config.PLAYGROUND,
  });
  for (const value of [efaturaConfig, efaturaConfig.zipLimits, efaturaConfig.playground])
    expect(Object.isFrozen(value)).toBe(true);
  expect(() => Object.assign(efaturaConfig.zipLimits, { maxDepth: 10 })).toThrow(TypeError);
  expect(() => Object.assign(efaturaConfig.playground, { pageSize: 1 })).toThrow(TypeError);
});
