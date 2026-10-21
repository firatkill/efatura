import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { transformSafetySource } from '../../scripts/xml-parser-bundle';

const require = createRequire(import.meta.url);
const parserRequire = createRequire(require.resolve('fast-xml-parser'));
const sourceRoot = dirname(parserRequire.resolve('is-unsafe'));
type Safety = {
  VALID_CONTEXTS: Record<string, unknown>;
  isUnsafe: (value: unknown, context: unknown) => unknown;
  whyUnsafe: (value: unknown, context: unknown) => unknown;
  allUnsafe: (value: unknown, context: unknown) => unknown;
};

describe('TC-M2-063 — D-74 bundled safety dependency', () => {
  it('preserves every context, pattern and predicate after relocating labels', async () => {
    const temporary = mkdtempSync(join(tmpdir(), 'efatura-safety-'));
    try {
      mkdirSync(join(temporary, 'contexts'));
      writeFileSync(join(temporary, 'package.json'), '{"type":"module"}');
      for (const relative of [
        'index.js',
        ...readdirSync(join(sourceRoot, 'contexts')).map((name) => `contexts/${name}`),
      ]) {
        const path = join(sourceRoot, relative);
        writeFileSync(
          join(temporary, relative),
          transformSafetySource(path, readFileSync(path, 'utf8'), '2.0.2'),
        );
      }
      const original = (await import(pathToFileURL(join(sourceRoot, 'index.js')).href)) as Safety;
      const transformed = (await import(pathToFileURL(join(temporary, 'index.js')).href)) as Safety;
      expect(transformed.VALID_CONTEXTS).toEqual(original.VALID_CONTEXTS);
      expect(Object.isFrozen(transformed.VALID_CONTEXTS)).toBe(true);
      const inputs = [
        'plain text',
        '<script>alert(1)</script>',
        '<!ENTITY x SYSTEM "file:///x">',
        '<svg onload="x()">',
        "' OR 1=1 --",
        '$(whoami)',
        '(a+)+$',
        '$where',
        '\r\nforged log',
        '',
      ];
      for (const method of ['isUnsafe', 'whyUnsafe', 'allUnsafe'] as const) {
        for (const value of inputs) {
          for (const name of Object.keys(original.VALID_CONTEXTS)) {
            expect(transformed[method](value, transformed.VALID_CONTEXTS[name])).toEqual(
              original[method](value, original.VALID_CONTEXTS[name]),
            );
          }
          expect(transformed[method](value, Object.values(transformed.VALID_CONTEXTS))).toEqual(
            original[method](value, Object.values(original.VALID_CONTEXTS)),
          );
          expect(transformed[method](value, /script/i)).toEqual(original[method](value, /script/i));
        }
        for (const [value, context] of [
          [null, /x/],
          ['x', []],
          ['x', null],
          ['x', [[]]],
        ]) {
          let originalError: unknown;
          try {
            original[method](value, context);
          } catch (error) {
            originalError = error;
          }
          expect(() => transformed[method](value, context)).toThrow(
            String(originalError instanceof Error ? originalError.message : originalError),
          );
        }
      }
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });

  it('fails closed if the pinned version or metadata source structure changes', () => {
    const source = readFileSync(join(sourceRoot, 'index.js'), 'utf8');
    expect(() => transformSafetySource('/src/index.js', source, 'next')).toThrow('version');
    expect(() => transformSafetySource('/src/index.js', '', '2.0.2')).toThrow('assignment');
    expect(() =>
      transformSafetySource('/src/index.js', source.replace('Object.freeze(', 'freeze('), '2.0.2'),
    ).toThrow('registry');
    expect(() => transformSafetySource('/src/contexts/new.js', '', '2.0.2')).toThrow('module');
    expect(() => transformSafetySource('/src/contexts/html.js', '', '2.0.2')).toThrow('export');
    expect(() =>
      transformSafetySource('/src/contexts/html.js', "HTML.label = 'HTML'; export default HTML;", '2.0.2'),
    ).toThrow('export');
  });
});
