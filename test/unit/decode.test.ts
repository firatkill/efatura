import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeInput } from '../../src/xml/decode';
import { utf16, turkishBytes } from '../helpers/xml';

afterEach(() => vi.unstubAllGlobals());
const xml = '<Invoice>ğş</Invoice>';
describe('TC-M1-008 / UT-05 / FR-02: supported encodings', () => {
  it('accepts strings, one leading BOM and ArrayBuffer without changing text', () => {
    expect(decodeInput('\ufeff' + xml)).toEqual({ text: xml, encoding: 'utf-8', issues: [] });
    expect(decodeInput(new TextEncoder().encode(xml).buffer)).toEqual({
      text: xml,
      encoding: 'utf-8',
      issues: [],
    });
    expect(decodeInput('\ufeff\ufeff' + xml).text).toBe('\ufeff' + xml);
  });
  it('detects UTF-8 BOM', () => {
    expect(decodeInput(new TextEncoder().encode('\ufeff' + xml))).toEqual({
      text: xml,
      encoding: 'utf-8',
      issues: [],
    });
  });
  it.each(['le', 'be'] as const)('detects UTF-16 %s with and without BOM', (order) => {
    for (const bom of [true, false])
      expect(decodeInput(utf16(xml, order, bom))).toEqual({
        text: xml,
        encoding: 'utf-16' + order,
        issues: [],
      });
  });
  it.each(['windows-1254', 'iso-8859-9'])('decodes Turkish letters declared as %s', (encoding) => {
    const input = `<?xml version="1.0" encoding="${encoding}"?>${xml}`;
    expect(decodeInput(turkishBytes(input))).toEqual({ text: input, encoding, issues: [] });
  });
  it.each(['utf-8', 'utf8', 'iso-8859-1', 'latin1', 'us-ascii', 'ascii'])(
    'uses declared label %s',
    (encoding) => {
      const text = `<?xml version="1.0" encoding='${encoding.toUpperCase()}'?><Invoice/>`;
      expect(decodeInput(new TextEncoder().encode(text))).toEqual({ text, encoding, issues: [] });
    },
  );
});
describe('TC-M1-009 / UT-05: encoding diagnostics', () => {
  it('reports unsupported encoding exactly', () => {
    const text = '<?xml version="1.0" encoding="unknown"?><Invoice/>';
    expect(decodeInput(new TextEncoder().encode(text))).toEqual({
      text,
      encoding: 'utf-8',
      issues: [
        {
          code: 'EF035',
          severity: 'warning',
          path: '/Invoice',
          message: 'Declared encoding unknown is not supported; the file was read as UTF-8.',
          messageTr: 'Bildirilen unknown kodlaması desteklenmiyor; dosya UTF-8 olarak okundu.',
          details: { declared: 'unknown' },
        },
      ],
    });
  });
  it('falls back only on invalid UTF-8, not a valid replacement character', () => {
    expect(decodeInput(turkishBytes(xml))).toEqual({
      text: xml,
      encoding: 'windows-1254',
      issues: [
        {
          code: 'EF035',
          severity: 'warning',
          path: '/Invoice',
          message: 'The file is not valid UTF-8 and declares no encoding; it was read as windows-1254.',
          messageTr: 'Dosya geçerli UTF-8 değil ve kodlama bildirmiyor; windows-1254 olarak okundu.',
          details: { declared: '(none)', used: 'windows-1254' },
        },
      ],
    });
    expect(decodeInput(new TextEncoder().encode('<Invoice>\ufffd</Invoice>')).issues).toEqual([]);
  });
  it('handles a supported label unavailable in the host decoder', () => {
    const Original = TextDecoder;
    vi.stubGlobal(
      'TextDecoder',
      class extends Original {
        constructor(label?: string, options?: TextDecoderOptions) {
          if (label === 'ascii') throw new RangeError('unsupported');
          super(label, options);
        }
      },
    );
    expect(
      decodeInput(new TextEncoder().encode('<?xml encoding="ascii"?><Invoice/>')).issues[0]?.details,
    ).toEqual({ declared: 'ascii' });
  });
});
it('TC-M1-010 / UT-05: empty input and exact size boundaries', () => {
  expect(() => decodeInput(new Uint8Array())).toThrow(expect.objectContaining({ code: 'EMPTY_INPUT' }));
  expect(decodeInput('abc', 3).text).toBe('abc');
  expect(decodeInput(new Uint8Array([65, 66, 67]), 3).text).toBe('ABC');
  for (const input of ['abcd', new Uint8Array(4)])
    expect(() => decodeInput(input, 3)).toThrow(
      expect.objectContaining({ code: 'INPUT_TOO_LARGE', details: { size: 4, limit: 3 } }),
    );
});
