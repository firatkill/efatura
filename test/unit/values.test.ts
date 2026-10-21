import { describe, expect, it } from 'vitest';
import { amount, bool, code, decimalValue, integer, quantity, text } from '../../src/model/values';
import { at, createContext } from '../../src/model/context';
import { parseXmlTree } from '../../src/xml/tree';

describe('TC-M1-017 / UT-09 / TRD §7.1: scalar conventions', () => {
  it('trims text and normalizes codes without collapsing internal spaces', () => {
    const el = parseXmlTree('<ID>  foo  bar  </ID>');
    expect(text(el)).toBe('foo  bar');
    expect(code(el)).toBe('FOO  BAR');
    expect(code(null)).toBeNull();
  });
  it.each([
    ['true', true],
    ['TRUE', true],
    ['1', true],
    ['false', false],
    ['FALSE', false],
    ['0', false],
    ['yes', null],
    ['', null],
  ] as const)('boolean %j', (raw, expected) => {
    expect(bool(parseXmlTree(`<Value> ${raw} </Value>`))).toBe(expected);
  });
  it('handles missing booleans and safe/invalid integers', () => {
    expect(bool(null)).toBeNull();
    const context = at(createContext(), 'cbc', 'LineCountNumeric');
    expect(integer(null, context)).toBeNull();
    expect(integer(parseXmlTree('<Value> 001 </Value>'), context)).toBe(1);
    expect(integer(parseXmlTree('<Value>9007199254740991</Value>'), context)).toBe(Number.MAX_SAFE_INTEGER);
    expect(context.issues).toEqual([]);
    for (const raw of ['9007199254740992', '-1', '1.5', '1e2', '']) {
      expect(integer(parseXmlTree(`<Value>${raw}</Value>`), context)).toBeNull();
      expect(context.issues.at(-1)).toEqual({
        code: 'EF030',
        severity: 'error',
        path: '/Invoice/cbc:LineCountNumeric',
        message: `${raw} is not a valid number.`,
        messageTr: `${raw} geçerli bir sayı değil.`,
        details: { value: raw },
      });
    }
  });
  it('implements all four decimal branches with exact issues', () => {
    const context = at(createContext(), 'cbc', 'Amount');
    for (const raw of ['001.00', '-0.00', '0', '-1.5']) expect(decimalValue(raw, context)).toBe(raw);
    for (const [raw, value] of [
      ['+007.50', '7.50'],
      ['.5', '0.5'],
      ['5.', '5'],
    ] as const)
      expect(decimalValue(raw, context)).toBe(value);
    expect(context.issues).toEqual([]);
    expect(decimalValue('-1,50', context)).toBe('-1.50');
    expect(context.issues[0]).toEqual({
      code: 'EF031',
      severity: 'warning',
      path: '/Invoice/cbc:Amount',
      message: '-1,50 uses a decimal comma; it was read as -1.50.',
      messageTr: '-1,50 ondalık ayırıcı olarak virgül kullanıyor; -1.50 olarak okundu.',
      details: { value: '-1,50', normalized: '-1.50' },
    });
    expect(decimalValue('1,234.56', context)).toBeNull();
    expect(context.issues[1]).toEqual({
      code: 'EF030',
      severity: 'error',
      path: '/Invoice/cbc:Amount',
      message: '1,234.56 is not a valid number.',
      messageTr: '1,234.56 geçerli bir sayı değil.',
      details: { value: '1,234.56' },
    });
  });
});
describe('TC-M1-018 / UT-09: amount and quantity builders', () => {
  it('retains amount text and handles missing/invalid currency', () => {
    const context = at(createContext(), 'cbc', 'PayableAmount');
    expect(amount(null, context)).toBeNull();
    expect(context.issues).toEqual([]);
    expect(amount(parseXmlTree('<Amount currencyID=" try "> 001.00 </Amount>'), context)).toEqual({
      value: '001.00',
      raw: '001.00',
      currency: 'TRY',
    });
    expect(context.issues).toEqual([]);
    expect(amount(parseXmlTree('<Amount>1.00</Amount>'), context)).toEqual({
      value: '1.00',
      raw: '1.00',
      currency: null,
    });
    expect(context.issues[0]).toEqual({
      code: 'EF032',
      severity: 'warning',
      path: '/Invoice/cbc:PayableAmount',
      message: 'Amount 1.00 has no currencyID.',
      messageTr: '1.00 tutarında currencyID yok.',
      details: { value: '1.00' },
    });
    expect(amount(parseXmlTree('<Amount currencyID=" ">bad</Amount>'), context)).toEqual({
      value: null,
      raw: 'bad',
      currency: null,
    });
    expect(context.issues.slice(1).map((issue) => issue.code)).toEqual(['EF030', 'EF032']);
  });
  it('uses injected unit lookup, and keeps missing/unknown units null', () => {
    const unit = { code: 'NIU', label: { en: 'number of items', tr: 'adet' } };
    const context = createContext({}, (code) => (code === 'NIU' ? unit : null));
    expect(quantity(null, context)).toBeNull();
    expect(quantity(parseXmlTree('<Quantity unitCode=" niu ">2.00</Quantity>'), context)).toEqual({
      value: '2.00',
      raw: '2.00',
      unitCode: 'NIU',
      unit,
    });
    expect(quantity(parseXmlTree('<Quantity unitCode="UNKNOWN">2</Quantity>'), context)?.unit).toBeNull();
    expect(quantity(parseXmlTree('<Quantity>2</Quantity>'), context)).toEqual({
      value: '2',
      raw: '2',
      unitCode: null,
      unit: null,
    });
    expect(quantity(parseXmlTree('<Quantity unitCode="NIU">2</Quantity>'), createContext())?.unit).toBeNull();
    expect(context.issues).toEqual([]);
  });
  it('shares sinks but isolates paths between sibling contexts', () => {
    const root = createContext({ includeRaw: false });
    const nested = at(root, 'cac', 'InvoiceLine', 2);
    expect(root.path).toBe('/Invoice');
    expect(nested.path).toBe('/Invoice/cac:InvoiceLine[2]');
    expect(nested.issues).toBe(root.issues);
    expect(nested.events).toBe(root.events);
    expect(nested.options.includeRaw).toBe(false);
  });
});
