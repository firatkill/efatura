import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import { assertParserOptions, transformParserSource } from '../../scripts/xml-parser-bundle';
const root = realpathSync('node_modules/fast-xml-parser');
const options = {
  preserveOrder: true,
  maxNestedTags: Number.POSITIVE_INFINITY,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  attributesGroupName: false,
  allowBooleanAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  removeNSPrefix: false,
  processEntities: false,
  htmlEntities: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  cdataPropName: '#cdata',
  commentPropName: false,
} as const;
const temporary = mkdtempSync(join(tmpdir(), 'efatura-parser-'));
let parserModule: { default: new (options: Record<string, unknown>) => { parse(input: string): unknown } };
beforeAll(async () => {
  cpSync(join(root, 'src'), join(temporary, 'src'), { recursive: true });
  writeFileSync(join(temporary, 'package.json'), '{"type":"module"}');
  const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    dependencies: Record<string, string>;
  };
  for (const dependency of Object.keys(metadata.dependencies)) {
    const target = join(temporary, 'node_modules', dependency);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(realpathSync(join(root, '..', dependency)), target, 'junction');
  }
  for (const file of ['OrderedObjParser.js', 'XMLParser.js', 'OptionsBuilder.js']) {
    const path = join(temporary, 'src/xmlparser', file);
    writeFileSync(path, transformParserSource(path, readFileSync(path, 'utf8'), '5.11.2'));
  }
  parserModule = (await import(pathToFileURL(join(temporary, 'src/xmlparser/XMLParser.js')).href)) as {
    default: new (options: Record<string, unknown>) => { parse(input: string): unknown };
  };
});
afterAll(() => {
  rmSync(temporary, { recursive: true, force: true });
});
it('TC-M2-063 / D-84 UT-05–UT-07: specialized parser preserves outputs under normative options', () => {
  const original = new XMLParser(options);
  const transformed = new parserModule.default(options);
  const samples = [
    '<Invoice/>',
    '<Invoice><v>true</v><v>false</v><v>00123</v><v>1e9</v><v>0xff</v><v>12345678901234567890.12</v><v>1,25</v><v>  </v></Invoice>',
    '<Invoice a="true" b="0001" c="1e9"><![CDATA[1 < 2 & value]]><!--synthetic--><v>&amp;lt; &lt; &#65; &#x130; &nbsp; &unknown;</v></Invoice>',
    '<Invoice xmlns:a="urn:synthetic"><a:v a:x="01">Örnek</a:v><a:v/></Invoice>',
    '<?xml version="1.0"?><Invoice><?synthetic value?><v/></Invoice>',
    '<Invoice xmlns:a="urn:synthetic"><a:v x="1"/><a:v x="2"><a:n/></a:v><v xmlns:a="urn:other"><a:v/></v></Invoice>',
    '<Invoice><__proto__ constructor="x"/><constructor/><prototype/><toString/></Invoice>',
    '<Invoice>' + '<v>'.repeat(200) + '</v>'.repeat(200) + '</Invoice>',
  ];
  const outcome = (parser: { parse(input: string): unknown }, input: string) => {
    try {
      return { value: parser.parse(input) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  };
  for (const input of [
    ...samples,
    '<Invoice><v></Invoice>',
    '<Invoice a="unterminated>',
    '<Invoice><!bad></Invoice>',
  ])
    expect(outcome(transformed, input)).toEqual(outcome(original, input));
  for (const [key, value] of [
    ['preserveOrder', false],
    ['parseTagValue', true],
    ['parseAttributeValue', true],
    ['htmlEntities', true],
    ['ignoreAttributes', true],
    ['processEntities', true],
    ['stopNodes', []],
    ['tagValueProcessor', () => 'changed'],
    ['attributeValueProcessor', () => 'changed'],
    ['updateTag', () => 'changed'],
    ['entityDecoder', {}],
  ] as const)
    expect(() => new parserModule.default({ ...options, [key]: value })).toThrow('Unsupported parser modes');
});
it.each(['original', 'specialized'] as const)(
  'TC-M3-024 / D-84 UT-07: %s parser retains 10000 nested levels',
  (kind) => {
    // Iterative traversal avoids assertion recursion at the specified 10000-level depth.
    const deep = '<v>'.repeat(10000) + '</v>'.repeat(10000);
    const count = (result: unknown): number => {
      let n = 0,
        node = result;
      while (Array.isArray(node) && node.length > 0) {
        n++;
        node = (node[0] as Record<string, unknown>)['v'];
      }
      return n;
    };
    const parser = kind === 'original' ? new XMLParser(options) : new parserModule.default(options);
    expect(count(parser.parse(deep))).toBe(10000);
  },
);
it('TC-M2-063 / D-79: source, version and option drift fail closed', () => {
  const source = readFileSync(join(root, 'src/xmlparser/XMLParser.js'), 'utf8');
  expect(() => transformParserSource('XMLParser.js', source, 'next')).toThrow('pinned parser');
  expect(() => transformParserSource('XMLParser.js', source + '\n', '5.11.2')).toThrow('pinned parser');
  expect(() => transformParserSource('Other.js', source, '5.11.2')).toThrow('pinned parser');
  for (const file of ['OrderedObjParser.js', 'OptionsBuilder.js']) {
    const input = readFileSync(join(root, 'src/xmlparser', file), 'utf8');
    expect(() => transformParserSource(file, input + '\n', '5.11.2')).toThrow('pinned parser');
  }
  const configured = readFileSync('src/xml/fxp.ts', 'utf8');
  for (const key of [
    'stopNodes',
    'tagValueProcessor',
    'attributeValueProcessor',
    'updateTag',
    'entityDecoder',
  ]) {
    expect(() => {
      assertParserOptions(
        configured.replace('preserveOrder: true', `'${key}': undefined, preserveOrder: true`),
      );
    }).toThrow('parser option');
  }
  expect(() => {
    assertParserOptions(configured);
  }).not.toThrow();
  for (const key of [
    'parseTagValue',
    'parseAttributeValue',
    'htmlEntities',
    'ignoreAttributes',
    'processEntities',
  ])
    expect(() => {
      assertParserOptions(configured.replace(`${key}: false`, `${key}: true`));
    }).toThrow('parser option');
  expect(() => {
    assertParserOptions(configured.replace('preserveOrder: true', 'preserveOrder: false'));
  }).toThrow('parser option');
  for (const source of [
    '',
    'const xmlParser = new XMLParser(options)',
    'const xmlParser = new XMLParser({...options})',
    'const xmlParser = new XMLParser({["stopNodes"]: []})',
    'const xmlParser = new XMLParser({ preserveOrder:true,preserveOrder:true })',
  ])
    expect(() => {
      assertParserOptions(source);
    }).toThrow('parser options');
});
