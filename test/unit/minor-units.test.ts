import { expect, it } from 'vitest';
import { minorUnitsOf, toMinorUnits } from '../../src/decimal/minor-units';

it('TC-M1-007 / UT-03: all minor-unit vectors', () => {
  expect(toMinorUnits('1180.5', 'TRY')).toBe(118050n);
  expect(toMinorUnits('0.005', 'TRY')).toBe(1n);
  expect(toMinorUnits('-0.005', 'TRY')).toBe(-1n);
  expect(toMinorUnits('100', 'JPY')).toBe(100n);
  expect(toMinorUnits('1.2345', 'KWD')).toBe(1235n);
  expect(() => toMinorUnits('1.234', 'USD', { rounding: 'throw' })).toThrow(
    new RangeError('1.234 has more than 2 decimals for USD'),
  );
  expect(toMinorUnits('1.230', 'USD', { rounding: 'throw' })).toBe(123n);
  expect(() => toMinorUnits('5', 'XAU')).toThrow(
    new RangeError('Unknown minor units for currency XAU; pass options.minorUnits'),
  );
  expect(toMinorUnits('5', 'XAU', { minorUnits: 3 })).toBe(5000n);
});
it('TC-M1-007 / UT-03: lookup aliases, unknowns and argument limits', () => {
  for (const [code, units] of [
    ['TRY', 2],
    ['USD', 2],
    ['EUR', 2],
    ['GBP', 2],
    ['CHF', 2],
    ['JPY', 0],
    ['KWD', 3],
    ['XAU', null],
    ['TL', 2],
    ['YTL', 2],
    ['ZZZ', null],
  ] as const)
    expect(minorUnitsOf(code)).toBe(units);
  expect(minorUnitsOf(' try ')).toBe(2);
  expect(toMinorUnits('1.2', ' tl ')).toBe(120n);
  expect(toMinorUnits('1', 'ZZZ', { minorUnits: 0 })).toBe(1n);
  expect(toMinorUnits('1.000001', 'ZZZ', { minorUnits: 6 })).toBe(1000001n);
  for (const minorUnits of [-1, 7, 1.5, NaN, Infinity])
    expect(() => toMinorUnits('1', 'TRY', { minorUnits })).toThrow(TypeError);
  expect(() => toMinorUnits('bad', 'TRY')).toThrow(TypeError);
});
