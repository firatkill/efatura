import { createIssue } from '../validate/issue';
import type { Issue } from '../types';

/** Mapping issue shape shared with the public Issue contract.
 * @example
 * const issue: MappingIssue = { code: 'EF035', severity: 'warning', path: '/Invoice', message: '', messageTr: '' };
 */
export type MappingIssue = Issue;

/** Create the prescribed encoding diagnostic from the shared catalogue.
 * @example
 * encodingIssue('unsupported', 'unknown');
 */
export function encodingIssue(variant: 'unsupported' | 'fallback', declared: string): MappingIssue {
  return createIssue(
    'EF035',
    '/Invoice',
    { declared },
    variant === 'unsupported' ? { declared } : { declared: '(none)', used: 'windows-1254' },
    variant,
  );
}
