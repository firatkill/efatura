import { describe, expect, it } from 'vitest';
import { EfaturaParseError } from '../../src/errors';

describe('TC-M1-001 / UT-38 / FR-04: parse errors', () => {
  it.each([
    ['EMPTY_INPUT', {}, 'Input is empty.', 'Girdi boş.'],
    [
      'INPUT_TOO_LARGE',
      { size: 51, limit: 50 },
      'Input is 51 bytes; the limit is 50 bytes.',
      'Girdi 51 bayt; sınır 50 bayt.',
    ],
    [
      'NOT_XML',
      { line: 2, column: 3, reason: 'Unclosed tag' },
      'Input is not well-formed XML (line 2, column 3): Unclosed tag',
      'Girdi geçerli bir XML değil (satır 2, sütun 3): Unclosed tag',
    ],
    [
      'DOCTYPE_FORBIDDEN',
      {},
      'DOCTYPE declarations are not allowed.',
      'DOCTYPE bildirimlerine izin verilmez.',
    ],
    [
      'NOT_INVOICE',
      { root: 'CreditNote', namespace: 'urn:example' },
      'Root element is CreditNote, not Invoice.',
      'Kök eleman Invoice değil, CreditNote.',
    ],
  ] as const)('%s has exact messages and details', (code, details, message, messageTr) => {
    const error = new EfaturaParseError(code, details);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EfaturaParseError);
    expect(error.name).toBe('EfaturaParseError');
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.messageTr).toBe(messageTr);
    expect(error.details).toEqual(details);
  });
  it('permits omitted details for fixed messages', () => {
    expect(new EfaturaParseError('EMPTY_INPUT').details).toEqual({});
  });
});
