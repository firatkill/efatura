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
