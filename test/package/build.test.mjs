import assert from 'node:assert/strict';
import { accessSync, constants, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('TC-M0-006 TC-M1-037 / NFR-11: real core API loads in ESM and CJS through package self-reference', () => {
  for (const mode of ['module', 'commonjs']) {
    const imports =
      mode === 'module'
        ? "import { parseInvoice, EfaturaParseError } from '@firatkill/efatura'; import * as zip from '@firatkill/efatura/zip';"
        : "const { parseInvoice, EfaturaParseError } = require('@firatkill/efatura'); const zip = require('@firatkill/efatura/zip');";
    const program =
      imports +
      "const result = parseInvoice('<Invoice/>'); let sameClass = false; try { parseInvoice('<Other/>'); } catch (error) { sameClass = error instanceof EfaturaParseError; } console.log(result.invoice.lines.length === 0 && sameClass && typeof zip === 'object');";
    const result = spawnSync(process.execPath, [`--input-type=${mode}`, '-e', program], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'true');
  }
  // The ZIP entry has no runtime API between T-16 and T-25; its build formats must remain present.
  for (const extension of ['js', 'cjs', 'd.ts', 'd.cts']) accessSync(`dist/zip.${extension}`);
});

test('TC-M0-007 / CT-02: executable CLI prints the package version', () => {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const result = spawnSync(process.execPath, ['dist/cli.js', '--version'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `efatura ${version}\n`);
  if (process.platform !== 'win32') accessSync('dist/cli.js', constants.X_OK);
});

test('TC-M2-063 / D-74, UT-05–UT-07: bundled parser preserves XML guards, depth and encoding in ESM/CJS', () => {
  for (const mode of ['module', 'commonjs']) {
    const imports =
      mode === 'module'
        ? "import { parseInvoice, EfaturaParseError } from '@firatkill/efatura';"
        : "const { parseInvoice, EfaturaParseError } = require('@firatkill/efatura');";
    const program =
      imports +
      `
      const assert = (await import('node:assert/strict')).default;
      for (const xml of ['<!DOCTYPE Invoice><Invoice/>', '<!ENTITY x "x"><Invoice/>', '<Invoice>']) {
        assert.throws(() => parseInvoice(xml), EfaturaParseError);
      }
      const result = parseInvoice('<Invoice>' + '<x>'.repeat(200) + '</x>'.repeat(200) + '</Invoice>');
      assert.equal(result.invoice.lines.length, 0);
      const bytes = new TextEncoder().encode('<Invoice/>');
      assert.equal(parseInvoice(bytes).invoice.lines.length, 0);
    `;
    const wrapped =
      mode === 'commonjs'
        ? `(async () => { ${program} })().catch(error => { console.error(error); process.exitCode = 1; });`
        : program;
    const result = spawnSync(process.execPath, [`--input-type=${mode}`, '-e', wrapped], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('TC-M2-063 / D-74: published dist retains bundled dependency licence notices', () => {
  const notices = readFileSync('dist/THIRD_PARTY_LICENSES.txt', 'utf8');
  for (const name of [
    '@nodable/entities',
    'fast-xml-parser',
    'xml-naming',
    'path-expression-matcher',
    'is-unsafe',
  ]) {
    assert.ok(notices.includes(`${name}@`), `Missing licence for ${name}`);
  }
  assert.ok(notices.includes('Permission is hereby granted'));
});

test('TC-M2-010 / UT-12: identifier helpers are available in ESM and CJS', () => {
  for (const mode of ['module', 'commonjs']) {
    const imports =
      mode === 'module'
        ? "import { isValidVkn, isValidTckn, isValidUuid, classifyTaxId } from '@firatkill/efatura';"
        : "const { isValidVkn, isValidTckn, isValidUuid, classifyTaxId } = require('@firatkill/efatura');";
    const program =
      imports +
      "console.log(isValidVkn('9990000013') && isValidTckn('50000000128') && isValidUuid('00000000-0000-0000-0000-000000000001') && classifyTaxId('9990000013').scheme === 'VKN');";
    const result = spawnSync(process.execPath, [`--input-type=${mode}`, '-e', program], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'true');
  }
});
