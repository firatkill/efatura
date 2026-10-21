import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { Options } from 'tsup';

type Plugin = NonNullable<Options['esbuildPlugins']>[number];
const contexts = {
  html: ['HTML', 'HTML'],
  xml: ['XML', 'XML'],
  svg: ['SVG', 'SVG'],
  sql: ['SQL', 'SQL'],
  'sql-strict': ['SQL_STRICT', 'SQL-STRICT'],
  shell: ['SHELL', 'SHELL'],
  redos: ['REDOS', 'REDOS'],
  nosql: ['NOSQL', 'NOSQL'],
  log: ['LOG', 'LOG'],
} as const;

/** Relocate unchanged context metadata so unused safety contexts can be removed.
 * @example
 * transformSafetySource('src/index.js', originalSource, '2.0.2');
 */
export function transformSafetySource(path: string, source: string, version: unknown): string {
  if (version !== '2.0.2') throw new Error('Review XML safety transform for the new is-unsafe version');
  const normalized = path.replaceAll('\\', '/');
  if (normalized.endsWith('/index.js')) {
    let result = source;
    for (const [symbol, label] of Object.values(contexts)) {
      const assignment = new RegExp(`^${symbol}\\.label\\s*=\\s*'${label}';\\r?$`, 'gm');
      if ([...result.matchAll(assignment)].length !== 1)
        throw new Error(`Unexpected ${symbol} context label assignment`);
      result = result.replace(assignment, '');
    }
    const frozen = 'export const VALID_CONTEXTS = Object.freeze(';
    if (result.split(frozen).length !== 2) throw new Error('Unexpected safety context registry');
    return result.replace(frozen, 'export const VALID_CONTEXTS = /* @__PURE__ */ Object.freeze(');
  }
  const name = normalized.split('/').at(-1)?.replace(/\.js$/, '');
  const context = Object.entries(contexts).find(([key]) => key === name)?.[1];
  if (!context) throw new Error(`Unexpected safety context module: ${normalized}`);
  const exported = /export default (\w+);/g;
  if ([...source.matchAll(exported)].length !== 1 || /\.label\s*=/.test(source))
    throw new Error('Unexpected safety context export');
  return source.replace(
    exported,
    (_match: string, symbol: string) => `${symbol}.label = '${context[1]}';\nexport default ${symbol};`,
  );
}

/** Bundle the pinned parser with a guarded, behavior-preserving metadata transform.
 * @example
 * const plugins = [xmlParserBundlePlugin()];
 */
export function xmlParserBundlePlugin(): Plugin {
  return {
    name: 'xml-safety-context-tree-shaking',
    setup(build) {
      build.onLoad({ filter: /[\\/]is-unsafe[\\/]src[\\/].*\.js$/ }, ({ path }) => {
        const normalized = path.replaceAll('\\', '/');
        const packageRoot = normalized.slice(0, normalized.lastIndexOf('/src/'));
        const metadata = JSON.parse(readFileSync(`${packageRoot}/package.json`, 'utf8')) as {
          version: unknown;
        };
        return {
          contents: transformSafetySource(path, readFileSync(path, 'utf8'), metadata.version),
          loader: 'js',
        };
      });
    },
  };
}

/** Preserve the licence notices for dependencies included in the published bundle.
 * @example
 * writeBundledLicenses('dist/index.js.map');
 */
export function writeBundledLicenses(mapPath: string): void {
  const map = JSON.parse(readFileSync(mapPath, 'utf8')) as { sources: string[] };
  const notices = new Map<string, string>();
  for (const source of map.sources) {
    if (!source.includes('node_modules/')) continue;
    let directory = dirname(resolve(dirname(mapPath), source));
    while (!existsSync(join(directory, 'package.json'))) {
      const parent = dirname(directory);
      if (parent === directory) throw new Error(`Missing bundled dependency metadata: ${source}`);
      directory = parent;
    }
    const metadata = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')) as {
      name: string;
      version: string;
    };
    const license = readdirSync(directory).find((name) => /^licen[sc]e(?:\.(?:md|txt))?$/i.test(name));
    const licensePath = license
      ? join(directory, license)
      : metadata.name === '@nodable/entities' && metadata.version === '3.1.0'
        ? resolve('scripts/licenses/nodable-entities.txt')
        : null;
    if (!licensePath) throw new Error(`Missing bundled licence: ${metadata.name}`);
    notices.set(`${metadata.name}@${metadata.version}`, readFileSync(licensePath, 'utf8'));
  }
  writeFileSync(
    join(dirname(mapPath), 'THIRD_PARTY_LICENSES.txt'),
    [...notices]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, license]) => `${name}\n\n${license}`)
      .join('\n\n'),
  );
}
