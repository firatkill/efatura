import { readFileSync } from 'node:fs';
import type { Invoice, IssueCode, Label } from '../../src/types';
import { parseInvoice } from '../../src/parse';
import { fullInvoiceXml } from './invoice';

const trd = readFileSync(new URL('../../docs/TRD.md', import.meta.url), 'utf8');
/** Fresh synthetic model for validation cases, with mapping isolated.
 * @example
 * const invoice = validationInvoice();
 */
export function validationInvoice(): Invoice {
  return parseInvoice(fullInvoiceXml, { validate: false, includeRaw: false }).invoice;
}
/** Expected diagnostics read from the normative TRD, independent of runtime catalogue code.
 * @example
 * expectedIssue('EF002', '/Invoice/cbc:UUID', { value: 'bad' });
 */
export function expectedIssue(
  code: IssueCode,
  path: string,
  params: Record<string, string | Label> = {},
  variant?: string,
) {
  const name = variant ? `${code} (${variant})` : code;
  const row = (trd.split('#### 9.3.2 Messages')[1] ?? '')
    .split('\n')
    .find((line) => line.split('|')[1]?.trim() === name);
  if (!row) throw new Error(`Missing normative message ${name}`);
  const cells = row.split('|').map((cell) => cell.trim());
  const render = (template: string, language: 'en' | 'tr') =>
    Object.entries(params).reduce(
      (text, [key, value]) =>
        text.replaceAll(`{${key}}`, typeof value === 'string' ? value : value[language]),
      template,
    );
  return {
    code,
    path,
    severity: new RegExp(`^\\| ${code}\\s*\\| (error|warning|info)`, 'm').exec(trd)?.[1],
    message: render(cells[2] ?? '', 'en'),
    messageTr: render(cells[3] ?? '', 'tr'),
  };
}
