import type { Label } from '../types';

/** String or bilingual substitution values used by issue templates.
 * @example
 * const params: MessageParams = { role: { en: 'supplier', tr: 'Satıcı' } };
 */
export type MessageParams = Readonly<Record<string, string | Label>>;

/** Substitute each named parameter using the requested language (TRD §9.1).
 * @example
 * renderMessage('Required field {field} is missing.', { field: 'cbc:ID' }, 'en');
 */
export function renderMessage(template: string, params: MessageParams, language: keyof Label): string {
  return template.replace(/\{([^}]+)\}/g, (token: string, name: string) => {
    const value = params[name];
    return value === undefined ? token : typeof value === 'string' ? value : value[language];
  });
}
