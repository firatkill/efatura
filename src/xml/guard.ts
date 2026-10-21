import { XMLValidator } from 'fast-xml-parser';
import { EfaturaParseError } from '../errors';

/** Reject empty, unsafe and malformed XML before invoking the parser.
 * @example
 * guardXml('<Invoice/>');
 */
export function guardXml(text: string): void {
  if (text.trim() === '') throw new EfaturaParseError('EMPTY_INPUT');
  let cursor = 0;
  while (cursor < text.length) {
    const start = text.indexOf('<', cursor);
    if (start < 0) break;
    const terminator = text.startsWith('<!--', start)
      ? '-->'
      : text.startsWith('<![CDATA[', start)
        ? ']]>'
        : text.startsWith('<?', start)
          ? '?>'
          : null;
    if (terminator) {
      const end = text.indexOf(terminator, start + 2);
      if (end < 0) break;
      cursor = end + terminator.length;
    } else {
      const token = text.slice(start, start + 9).toUpperCase();
      if (token.startsWith('<!DOCTYPE') || token.startsWith('<!ENTITY'))
        throw new EfaturaParseError('DOCTYPE_FORBIDDEN');
      cursor = start + 1;
    }
  }
  // TRD §6.2 explicitly requires the bundled validator; no extra runtime dependency.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const result = XMLValidator.validate(text, { allowBooleanAttributes: false });
  if (result !== true)
    throw new EfaturaParseError('NOT_XML', {
      line: result.err.line,
      column: result.err.col,
      reason: result.err.msg,
    });
}
