import type { Issue, ParseOptions, UnitInfo } from '../types';
import type { QueryContext } from '../xml/query';
import type { NamespacePrefix } from '../xml/namespaces';
import { elementPath } from '../xml/path';

/** Shared mapping state and current canonical path.
 * @example
 * const context = createContext();
 */
export type MappingContext = QueryContext & {
  issues: Issue[];
  options: ParseOptions;
  unitLookup: (code: string) => UnitInfo | null;
};
/** Create an isolated issue sink; code-list lookup is supplied by orchestration.
 * @example
 * createContext({ includeRaw: false });
 */
export function createContext(
  options: ParseOptions = {},
  unitLookup: MappingContext['unitLookup'] = () => null,
): MappingContext {
  return { path: '/Invoice', events: [], issues: [], options, unitLookup };
}
/** Descend to a field without mutating a sibling mapper's location.
 * @example
 * at(createContext(), 'cbc', 'ID').path; // '/Invoice/cbc:ID'
 */
export function at(
  context: MappingContext,
  prefix: NamespacePrefix,
  name: string,
  position?: number,
): MappingContext {
  return { ...context, path: elementPath(context.path, prefix, name, position) };
}
/** Temporary numeric mapping diagnostics, replaced by the catalogue in T-17.
 * @example
 * numberIssue(createContext(), 'EF030', 'invalid');
 */
export function numberIssue(context: MappingContext, code: 'EF030' | 'EF031' | 'EF032', value: string): void {
  const normalized = value.replace(',', '.');
  const messages = {
    EF030: [`${value} is not a valid number.`, `${value} geçerli bir sayı değil.`],
    EF031: [
      `${value} uses a decimal comma; it was read as ${normalized}.`,
      `${value} ondalık ayırıcı olarak virgül kullanıyor; ${normalized} olarak okundu.`,
    ],
    EF032: [`Amount ${value} has no currencyID.`, `${value} tutarında currencyID yok.`],
  } as const;
  context.issues.push({
    code,
    severity: code === 'EF030' ? 'error' : 'warning',
    path: context.path,
    message: messages[code][0],
    messageTr: messages[code][1],
    details: code === 'EF031' ? { value, normalized } : { value },
  });
}
