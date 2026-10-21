import { afterEach, expect, it, vi } from 'vitest';
import { createYielder, yieldToEventLoop } from '../../src/internal/yield';
import { now } from '../../src/internal/clock';
import { throwIfAborted } from '../../src/internal/abort';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it('TC-M1-003 / FR-25: clock delegates to performance.now', () => {
  vi.spyOn(performance, 'now').mockReturnValue(123);
  expect(now()).toBe(123);
});
it('TC-M1-003 / FR-25: yields at the budget and restarts timing after the yield', async () => {
  let time = 0;
  const yieldSpy = vi.fn(() => {
    time = 75;
    return Promise.resolve();
  });
  vi.stubGlobal('scheduler', { yield: yieldSpy });
  const maybeYield = createYielder(50, () => time);
  time = 49;
  await maybeYield();
  expect(yieldSpy).not.toHaveBeenCalled();
  time = 50;
  await maybeYield();
  expect(yieldSpy).toHaveBeenCalledTimes(1);
  time = 124;
  await maybeYield();
  expect(yieldSpy).toHaveBeenCalledTimes(1);
  time = 125;
  await maybeYield();
  expect(yieldSpy).toHaveBeenCalledTimes(2);
});
it('TC-M1-003 / FR-25: falls back to a timer and uses default budget/clock', async () => {
  vi.stubGlobal('scheduler', undefined);
  vi.useFakeTimers();
  const spy = vi.spyOn(globalThis, 'setTimeout');
  const pending = yieldToEventLoop();
  expect(spy).toHaveBeenCalledWith(expect.any(Function), 0);
  await vi.runAllTimersAsync();
  await pending;
  vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValue(50);
  const yielding = createYielder()();
  await vi.runAllTimersAsync();
  await yielding;
});
it('TC-M1-004 / FR-26: checks abort before work and preserves the reason', async () => {
  const controller = new AbortController();
  throwIfAborted();
  throwIfAborted(controller.signal);
  const reason = { cancelled: true };
  controller.abort(reason);
  const yieldSpy = vi.fn(() => Promise.resolve());
  vi.stubGlobal('scheduler', { yield: yieldSpy });
  await expect(createYielder(50, () => 0)(controller.signal)).rejects.toBe(reason);
  expect(yieldSpy).not.toHaveBeenCalled();
});
it('TC-M1-004 / FR-26: checks abort again after yielding', async () => {
  const controller = new AbortController();
  const reason = new Error('cancel');
  vi.stubGlobal('scheduler', {
    yield: () => {
      controller.abort(reason);
      return Promise.resolve();
    },
  });
  let time = 0;
  const maybeYield = createYielder(50, () => time);
  time = 50;
  await expect(maybeYield(controller.signal)).rejects.toBe(reason);
});
