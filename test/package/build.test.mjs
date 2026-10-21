import assert from 'node:assert/strict';
import { accessSync, constants, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('TC-M0-006 / NFR-11: ESM and CJS consumers share the core through self-reference', () => {
  for (const mode of ['module', 'commonjs']) {
    const program =
      mode === 'module'
        ? "import { VERSION } from '@firatkill/efatura'; import { ZIP_VERSION } from '@firatkill/efatura/zip'; console.log(VERSION === ZIP_VERSION);"
        : "const { VERSION } = require('@firatkill/efatura'); const { ZIP_VERSION } = require('@firatkill/efatura/zip'); console.log(VERSION === ZIP_VERSION);";
    const result = spawnSync(process.execPath, [`--input-type=${mode}`, '-e', program], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'true');
  }
  for (const extension of ['js', 'cjs', 'd.ts', 'd.cts']) {
    assert.match(readFileSync(`dist/zip.${extension}`, 'utf8'), /@firatkill\/efatura/);
  }
});

test('TC-M0-007 / CT-02: executable CLI prints the package version', () => {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const result = spawnSync(process.execPath, ['dist/cli.js', '--version'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `efatura ${version}\n`);
  if (process.platform !== 'win32') accessSync('dist/cli.js', constants.X_OK);
});
