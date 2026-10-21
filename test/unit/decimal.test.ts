import { describe, expect, it } from 'vitest';
import { decimal as d } from '../../src/decimal/decimal';
import { referenceAdd } from '../helpers/reference-decimal';

describe('TC-M1-005 / UT-01 / FR-15: normative exact decimal vectors', () => {
  it('matches every TRD §8.2 vector', () => {
    expect(d.add('100.50', '0.5')).toBe('101.00');
    expect(d.sub('0.1', '0.3')).toBe('-0.2');
    expect(d.mul('3', '33.333')).toBe('99.999');
    expect(d.mul('1180.00', '32.1234')).toBe('37905.612000');
    expect(d.round('37905.612000', 2)).toBe('37905.61');
    expect(d.round('2.345', 2)).toBe('2.35');
    expect(d.round('-2.345', 2)).toBe('-2.35');
    expect(d.round('2.345', 2, 'half-even')).toBe('2.34');
    expect(d.round('2.355', 2, 'half-even')).toBe('2.36');
    expect(d.round('7', 2)).toBe('7.00');
    expect(d.div('100', '3', 4)).toBe('33.3333');
    expect(d.div('-1', '8', 2)).toBe('-0.13');
    expect(d.movePoint('20', -2)).toBe('0.20');
    expect(d.normalize('+007.50')).toBe('7.50');
    expect(d.normalize('-0.00')).toBe('0.00');
    expect(d.normalize('.5')).toBe('0.5');
    expect(d.normalize('5.')).toBe('5');
    expect(d.sum([])).toBe('0');
    expect(d.within('100.00', '100.01', '0.01')).toBe(true);
    expect(d.within('100.00', '100.011', '0.01')).toBe(false);
    expect(d.cmp('1.0', '1.00')).toBe(0);
  });
  it('preserves scale, signs and exact comparisons', () => {
    expect(d.add('999999999999999999999.99', '0.01')).toBe('1000000000000000000000.00');
    expect(d.sub('1.00', '1')).toBe('0.00');
    expect(d.neg('-1.00')).toBe('1.00');
    expect(d.neg('0.00')).toBe('0.00');
    expect(d.abs('-1.00')).toBe('1.00');
    expect(d.abs('1.00')).toBe('1.00');
    expect(d.cmp('-1', '0')).toBe(-1);
    expect(d.cmp('2', '1')).toBe(1);
    expect(d.eq('2.0', '2.00')).toBe(true);
    expect(d.eq('2', '3')).toBe(false);
    expect(d.sum(['1.00', '2', '-0.5'])).toBe('2.50');
    expect(d.scale('.001')).toBe(3);
    expect(d.movePoint('1.23', 1)).toBe('12.3');
    expect(d.movePoint('1.23', 2)).toBe('123');
    expect(d.movePoint('1.23', 4)).toBe('12300');
    expect(d.round('1.49', 0)).toBe('1');
    expect(d.round('-1.5', 0)).toBe('-2');
    expect(d.round('-2.355', 2, 'half-even')).toBe('-2.36');
    expect(d.round('2.356', 2, 'half-even')).toBe('2.36');
    expect(d.round('2.344', 2, 'half-even')).toBe('2.34');
    expect(d.div('1', '-8', 2)).toBe('-0.13');
    expect(d.div('-1', '-8', 2)).toBe('0.13');
    expect(d.div('1.5', '0.5', 2)).toBe('3.00');
    for (const [a, b] of [
      ['1.25', '2.005'],
      ['-8', '4.99'],
      ['0.00', '0'],
    ] as const)
      expect(d.add(a, b)).toBe(referenceAdd(a, b));
  });
});
describe('TC-M1-006 / UT-02: invalid decimal inputs and integer arguments', () => {
  it.each(['', ' ', '.', '+', '-', '1e3', '1,5', 'NaN', 'Infinity', '1.2.3', '1 2'])(
    'rejects %j',
    (value) => {
      expect(d.isDecimal(value)).toBe(false);
      expect(() => d.normalize(value)).toThrow(new TypeError(`Invalid decimal: ${value}`));
    },
  );
  it('accepts the XSD lexical forms and removes signed zero', () => {
    for (const value of ['1', '.5', '+1.', '-.5', ' 001.00 ', '-0', '-0.000'])
      expect(d.isDecimal(value)).toBe(true);
    expect(d.normalize('-0')).toBe('0');
    expect(d.normalize(' 001.00 ')).toBe('1.00');
  });
  it('rejects zero division and invalid precisions', () => {
    expect(() => d.div('1', '-0.00', 2)).toThrow(RangeError);
    for (const n of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => d.round('1', n)).toThrow(TypeError);
      expect(() => d.div('1', '2', n)).toThrow(TypeError);
    }
    for (const n of [0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
      expect(() => d.movePoint('1', n)).toThrow(TypeError);
  });
});
