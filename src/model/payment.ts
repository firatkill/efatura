import type { DueDate, PaymentMeans, PaymentTerms } from '../types';
import type { XmlElement } from '../xml/tree';
import { child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';

function calendar(year: string, month: string, day: string): string | null {
  const y = Number(year),
    m = Number(month),
    d = Number(day);
  const days = [
    31,
    y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  const maximum = days[m - 1];
  return maximum !== undefined && d >= 1 && d <= maximum
    ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    : null;
}

/** Resolve due dates from payment means, payment terms, then valid date notes.
 * @example
 * mapDueDate(root, context)?.date; // '2025-12-01'
 */
export function mapDueDate(root: XmlElement, context: MappingContext): DueDate | null {
  for (const source of ['PaymentMeans', 'PaymentTerms'] as const) {
    for (const [i, el] of children(root, 'cac', source, context).entries()) {
      const date = textOf(el, 'cbc', 'PaymentDueDate', at(context, 'cac', source, i + 1));
      if (date !== null) return { date, source };
    }
  }
  const notes = children(root, 'cbc', 'Note', context).map(text);
  for (const pattern of [
    /vade\s*tar[iıİ]h[iıİ]\s*[:=]?\s*(\d{1,2})[./-](\d{1,2})[./-](\d{4})/iu,
    /vade\s*tar[iıİ]h[iıİ]\s*[:=]?\s*(\d{4})-(\d{2})-(\d{2})/iu,
  ]) {
    for (const note of notes) {
      const match = pattern.exec(note ?? '');
      if (!match?.[1] || !match[2] || !match[3]) continue;
      const iso = match[1].length === 4;
      const date = calendar(iso ? match[1] : match[3], match[2], iso ? match[3] : match[1]);
      if (date !== null) return { date, source: 'Note' };
    }
  }
  return null;
}

import { amount, decimalValue } from './values';

/** Map payment instructions and payee financial-account details (TRD §7.8.3).
 * @example
 * mapPaymentMeans(element, context).accountId;
 */
export function mapPaymentMeans(el: XmlElement, context: MappingContext): PaymentMeans {
  const read = (name: string) => textOf(el, 'cbc', name, context);
  const account = child(el, 'cac', 'PayeeFinancialAccount', context);
  const accountContext = at(context, 'cac', 'PayeeFinancialAccount');
  const branch = child(account, 'cac', 'FinancialInstitutionBranch', accountContext);
  const branchContext = at(accountContext, 'cac', 'FinancialInstitutionBranch');
  return {
    code: read('PaymentMeansCode'),
    dueDate: read('PaymentDueDate'),
    channelCode: read('PaymentChannelCode'),
    instructionNote: read('InstructionNote'),
    accountId: textOf(account, 'cbc', 'ID', accountContext),
    accountCurrency: textOf(account, 'cbc', 'CurrencyCode', accountContext),
    paymentNote: textOf(account, 'cbc', 'PaymentNote', accountContext),
    bankBranchName: textOf(branch, 'cbc', 'Name', branchContext),
    bankName: textOf(
      child(branch, 'cac', 'FinancialInstitution', branchContext),
      'cbc',
      'Name',
      at(branchContext, 'cac', 'FinancialInstitution'),
    ),
  };
}
/** Map payment terms, preserving exact surcharge and amount values.
 * @example
 * mapPaymentTerms(element, context).penaltySurchargePercent;
 */
export function mapPaymentTerms(el: XmlElement, context: MappingContext): PaymentTerms {
  const percent = child(el, 'cbc', 'PenaltySurchargePercent', context);
  return {
    note: textOf(el, 'cbc', 'Note', context),
    penaltySurchargePercent: percent
      ? decimalValue(text(percent) ?? '', at(context, 'cbc', 'PenaltySurchargePercent'))
      : null,
    amount: amount(child(el, 'cbc', 'Amount', context), at(context, 'cbc', 'Amount')),
    dueDate: textOf(el, 'cbc', 'PaymentDueDate', context),
  };
}
