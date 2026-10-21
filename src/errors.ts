/** Fatal XML input failure codes.
 * @example
 * const code: EfaturaParseErrorCode = 'EMPTY_INPUT';
 */
export type EfaturaParseErrorCode =
  'EMPTY_INPUT' | 'INPUT_TOO_LARGE' | 'NOT_XML' | 'DOCTYPE_FORBIDDEN' | 'NOT_INVOICE';

const messages = {
  EMPTY_INPUT: ['Input is empty.', 'Girdi boş.'],
  INPUT_TOO_LARGE: [
    'Input is {size} bytes; the limit is {limit} bytes.',
    'Girdi {size} bayt; sınır {limit} bayt.',
  ],
  NOT_XML: [
    'Input is not well-formed XML (line {line}, column {column}): {reason}',
    'Girdi geçerli bir XML değil (satır {line}, sütun {column}): {reason}',
  ],
  DOCTYPE_FORBIDDEN: ['DOCTYPE declarations are not allowed.', 'DOCTYPE bildirimlerine izin verilmez.'],
  NOT_INVOICE: ['Root element is {root}, not Invoice.', 'Kök eleman Invoice değil, {root}.'],
} as const;

/** An input that cannot be parsed as an invoice XML document.
 * @example
 * throw new EfaturaParseError('INPUT_TOO_LARGE', { size: 51, limit: 50 });
 */
export class EfaturaParseError extends Error {
  override readonly name = 'EfaturaParseError';
  readonly code: EfaturaParseErrorCode;
  readonly messageTr: string;
  readonly details: Readonly<Record<string, string | number>>;
  constructor(code: EfaturaParseErrorCode, details: Record<string, string | number> = {}) {
    const interpolate = (template: string) =>
      template.replace(/\{(\w+)\}/g, (_, key: string) => String(details[key]));
    super(interpolate(messages[code][0]));
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.messageTr = interpolate(messages[code][1]);
    this.details = details;
  }
}
