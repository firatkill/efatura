import { identityRules } from './rules/identity';
import { partyRules } from './rules/parties';
import { DEFAULT_TOLERANCE } from '../config';
import type { Invoice, Issue, ParseOptions } from '../types';
import { checkOptions } from './options';
import { createIssue, finishIssues } from './issue';

/** Shared context for rules; report creates catalogue-backed issues.
 * @example
 * const rule: Rule = (_invoice, ctx) => ctx.report('EF050', '/Invoice');
 */
export type RuleContext = {
  tolerance: string;
  report: (...args: Parameters<typeof createIssue>) => void;
};
/** A synchronous rule which skips missing prerequisites rather than throwing.
 * @example
 * const rule: Rule = (invoice, ctx) => { if (!invoice.lines.length) ctx.report('EF050', '/Invoice'); };
 */
export type Rule = (invoice: Invoice, context: RuleContext) => void;

/** Run an ordered collection of rules, retaining default severities for the final merge.
 * @example
 * runRules(invoice, rules, { tolerance: '0' });
 */
export function runRules(invoice: Invoice, rules: readonly Rule[], options: ParseOptions = {}): Issue[] {
  const issues: Issue[] = [];
  const context: RuleContext = {
    tolerance: options.tolerance ?? DEFAULT_TOLERANCE,
    report: (...args) => {
      issues.push(createIssue(...args));
    },
  };
  for (const rule of rules) rule(invoice, context);
  return issues;
}

/** Collect validation-only issues for the parser's final mapping/validation merge.
 * @example
 * validationIssues(invoice, { tolerance: '0' });
 */
export function validationIssues(invoice: Invoice, options: ParseOptions = {}): Issue[] {
  // T-19–T-22 register category rules in catalogue order.
  return runRules(invoice, [identityRules, partyRules], options);
}

/** Validate an already-parsed model; mapping diagnostics are not recreated.
 * @example
 * const issues = validateInvoice(invoice, { rules: { EF040: 'warning' } });
 */
export function validateInvoice(
  invoice: Invoice,
  options: Pick<ParseOptions, 'rules' | 'tolerance'> = {},
): Issue[] {
  checkOptions(options);
  return finishIssues(validationIssues(invoice, options), options);
}
