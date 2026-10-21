/** Temporary mapping issue shape; T-09 adopts the public Issue type and T-17 the catalogue.
 * @example
 * const issue: MappingIssue = { code: 'EF035', severity: 'warning', path: '/Invoice', message: '', messageTr: '' };
 */
export type MappingIssue = {
  code: 'EF035';
  severity: 'warning';
  path: string;
  message: string;
  messageTr: string;
  details?: Readonly<Record<string, string | number>>;
};

/** Encoding issue factory prescribed for the pre-catalogue T-07 implementation.
 * @example
 * encodingIssue('unsupported', 'unknown');
 */
export function encodingIssue(variant: 'unsupported' | 'fallback', declared: string): MappingIssue {
  return variant === 'unsupported'
    ? {
        code: 'EF035',
        severity: 'warning',
        path: '/Invoice',
        message: `Declared encoding ${declared} is not supported; the file was read as UTF-8.`,
        messageTr: `Bildirilen ${declared} kodlaması desteklenmiyor; dosya UTF-8 olarak okundu.`,
        details: { declared },
      }
    : {
        code: 'EF035',
        severity: 'warning',
        path: '/Invoice',
        message: 'The file is not valid UTF-8 and declares no encoding; it was read as windows-1254.',
        messageTr: 'Dosya geçerli UTF-8 değil ve kodlama bildirmiyor; windows-1254 olarak okundu.',
        details: { declared: '(none)', used: 'windows-1254' },
      };
}
