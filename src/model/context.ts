import { createIssue } from '../validate/issue';
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
/** Numeric mapping diagnostics rendered from the shared catalogue.
 * @example
 * numberIssue(createContext(), 'EF030', 'invalid');
 */
export function numberIssue(context: MappingContext, code: 'EF030' | 'EF031' | 'EF032', value: string): void {
  const normalized = value.replace(',', '.');
  context.issues.push(
    createIssue(
      code,
      context.path,
      { value, normalized },
      code === 'EF031' ? { value, normalized } : { value },
    ),
  );
}
