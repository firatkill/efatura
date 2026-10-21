import { createHash } from 'node:crypto';
import ts from 'typescript';
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
      assertParserOptions(readFileSync('src/xml/fxp.ts', 'utf8'));
      build.onLoad(
        {
          filter:
            /[\\/]fast-xml-parser[\\/]src[\\/]xmlparser[\\/](?:OrderedObjParser|XMLParser|OptionsBuilder)\.js$/,
        },
        ({ path }) => {
          const normalized = path.replaceAll('\\', '/');
          const root = normalized.slice(0, normalized.lastIndexOf('/src/'));
          const metadata = JSON.parse(readFileSync(`${root}/package.json`, 'utf8')) as { version: unknown };
          return {
            contents: transformParserSource(path, readFileSync(path, 'utf8'), metadata.version),
            loader: 'js',
          };
        },
      );
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

/** Require the normative fixed modes before specializing the bundled parser.
 * @example
 * assertParserOptions(readFileSync('src/xml/fxp.ts', 'utf8'));
 */
export function assertParserOptions(source: string): void {
  const required = new Map<string, ts.SyntaxKind>([
    ['parseTagValue', ts.SyntaxKind.FalseKeyword],
    ['parseAttributeValue', ts.SyntaxKind.FalseKeyword],
    ['htmlEntities', ts.SyntaxKind.FalseKeyword],
    ['preserveOrder', ts.SyntaxKind.TrueKeyword],
    ['ignoreAttributes', ts.SyntaxKind.FalseKeyword],
    ['processEntities', ts.SyntaxKind.FalseKeyword],
  ]);
  const file = ts.createSourceFile('fxp.ts', source, ts.ScriptTarget.Latest, true);
  const found: ts.Node[] = [];
  function visit(node: ts.Node): void {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(file) === 'xmlParser' &&
      node.initializer &&
      ts.isNewExpression(node.initializer)
    ) {
      const options = node.initializer.arguments?.[0];
      if (!options || !ts.isObjectLiteralExpression(options)) throw new Error('Review fixed parser options');
      const entries = new Map<string, ts.SyntaxKind>();
      for (const property of options.properties) {
        if (!ts.isPropertyAssignment(property)) throw new Error('Review fixed parser options');
        if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name))
          throw new Error('Review fixed parser options');
        const key = property.name.text;
        if (
          [
            'stopNodes',
            'tagValueProcessor',
            'attributeValueProcessor',
            'updateTag',
            'entityDecoder',
          ].includes(key)
        )
          throw new Error(`Review fixed parser option ${key}`);
        if (entries.has(key)) throw new Error('Review duplicate parser options');
        entries.set(key, property.initializer.kind);
      }
      for (const [key, kind] of required)
        if (entries.get(key) !== kind) throw new Error(`Review fixed parser option ${key}`);
      found.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (found.length === 0) throw new Error('Review fixed parser options');
}

/** Omit only modes disabled by the fixed parser options, with exact source guards.
 * @example
 * transformParserSource(path, original, '5.11.2');
 */
export function transformParserSource(path: string, source: string, version: unknown): string {
  const file = path.replaceAll('\\', '/').split('/').at(-1);
  const hashes: Record<string, string> = {
    'OptionsBuilder.js': '4f177e43f1ac36dc25b2b6a44970c97918091416bd15722b65ac938256bda687',
    'OrderedObjParser.js': 'd1d5d64ecfb3df9b07ba3bd5ee020d166eaecbf569ebce67be692aa5892a21b5',
    'XMLParser.js': 'e3280436ad479a240fa6b9034327efe12c97eb9dbd5d541800ebd74a6420c023',
  };
  if (
    version !== '5.11.2' ||
    file === undefined ||
    createHash('sha256').update(source).digest('hex') !== hashes[file]
  )
    throw new Error('Review pinned parser source before specialization');
  if (file === 'OptionsBuilder.js') return source;
  if (file === 'XMLParser.js')
    return source
      .replace("import prettify from './node2json.js';", '')
      .replace(
        'this.options = buildOptions(options);',
        "this.options = buildOptions(options); if (this.options.preserveOrder !== true || this.options.parseTagValue !== false || this.options.parseAttributeValue !== false || this.options.htmlEntities !== false || this.options.ignoreAttributes !== false || options.processEntities !== false || ['stopNodes', 'tagValueProcessor', 'attributeValueProcessor', 'updateTag', 'entityDecoder'].some(key => Object.prototype.hasOwnProperty.call(options, key))) throw new Error('Unsupported parser modes');",
      )
      .replace(
        'if (this.options.preserveOrder || orderedResult === undefined) return orderedResult;\n        else return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);',
        'return orderedResult;',
      );
  source = source
    .replace(
      "import { Expression, Matcher } from 'path-expression-matcher';",
      `class Matcher {
      constructor() { this.tags = []; }
      readOnly() { return this; }
      reset() { this.tags.length = 0; }
      push(tag) { this.tags.push(tag); }
      pop() { this.tags.pop(); }
      getCurrentTag() { return this.tags[this.tags.length - 1]; }
      toString() { return this.tags.join('.'); }
    }`,
    )
    .replace("import { ExpressionSet } from 'path-expression-matcher';", '')
    .replace(
      / {4}this.stopNodeExpressionsSet = new ExpressionSet\(\);[\s\S]*?this.stopNodeExpressionsSet.seal\(\);\n {4}}/,
      "    if (this.options.stopNodes?.length) throw new Error('Stop nodes are disabled');",
    )
    .replace(/function isItStopNode\(\) \{[\s\S]*?\n}/, 'function isItStopNode() { return false; }');
  return source
    .replace('import toNumber from "strnum";', '')
    .replace('XML, CURRENCY, COMMON_HTML, ENTITY_ACTION', 'XML, ENTITY_ACTION')
    .replace(
      'else if (this.options.htmlEntities === true) namedEntities = { ...COMMON_HTML, ...CURRENCY };',
      "else if (this.options.htmlEntities === true) throw new Error('HTML entities are disabled');",
    )
    .replace(
      /function parseValue\(val, shouldParse, options\) \{[\s\S]*?\n\}\n\nfunction fromCodePoint/,
      "function parseValue(val, shouldParse, options) { if (shouldParse) throw new Error('Numeric coercion is disabled'); return isExist(val) ? val : ''; }\n\nfunction fromCodePoint",
    );
}
