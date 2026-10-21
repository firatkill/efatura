import type { Issue, IssueCode, ParseOptions } from '../types';
import { ISSUE_CATALOGUE } from './catalogue';
import { renderMessage } from './messages';
import type { MessageParams } from './messages';

/** Create an issue from the normative catalogue without applying user overrides.
 * @example
 * createIssue('EF001', '/Invoice/cbc:ID', { field: 'cbc:ID' });
 */
export function createIssue(
  code: IssueCode,
  path: string,
  params: MessageParams = {},
  details?: NonNullable<Issue['details']>,
  variant?: string,
): Issue {
  const definition = ISSUE_CATALOGUE[code];
  const template = variant === undefined ? undefined : definition.variants?.[variant];
  return {
    code,
    severity: definition.severity,
    path,
    message: renderMessage(template?.en ?? definition.message, params, 'en'),
    messageTr: renderMessage(template?.tr ?? definition.messageTr, params, 'tr'),
    ...(details === undefined ? {} : { details }),
  };
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** Deduplicate and sort diagnostics, then apply overrides last (TRD §1.3).
 * @example
 * finishIssues(issues, { rules: { EF009: 'off' } });
 */
export function finishIssues(issues: readonly Issue[], options: Pick<ParseOptions, 'rules'> = {}): Issue[] {
  const seen = new Set<string>();
  const severity = { error: 0, warning: 1, info: 2 };
  return issues
    .filter((issue) => {
      const key = JSON.stringify([issue.code, issue.path, issue.message]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        severity[a.severity] - severity[b.severity] || compare(a.path, b.path) || compare(a.code, b.code),
    )
    .flatMap((issue) => {
      const override = options.rules?.[issue.code];
      return override === 'off' ? [] : [{ ...issue, severity: override ?? issue.severity }];
    });
}
