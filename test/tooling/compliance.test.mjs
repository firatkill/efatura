import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { licenseAllowed, checkLicenseReports } from '../../scripts/check-licenses.mjs';

test('TC-M0-013–014 / NFR-15: SPDX allowlist honours AND, OR, parentheses and font restrictions', () => {
  for (const expression of [
    'MIT',
    '(MIT AND Zlib)',
    '(MPL-2.0 OR Apache-2.0)',
    'MIT AND (ISC OR GPL-3.0)',
    'GPL-3.0 OR MIT AND ISC',
  ]) {
    assert.equal(licenseAllowed(expression, 'example'), true, expression);
  }
  for (const expression of [
    'GPL-3.0',
    'MIT AND GPL-3.0',
    '(MIT OR ISC) AND GPL-3.0',
    'UNKNOWN',
    'UNLICENSED',
    '',
    'MIT OR',
    '(MIT',
    'MIT)',
    'MIT WITH exception',
    'MIT !',
    null,
  ]) {
    assert.equal(licenseAllowed(expression, 'example'), false, String(expression));
  }
  assert.equal(licenseAllowed('OFL-1.1', '@fontsource/jetbrains-mono'), true);
  assert.equal(licenseAllowed('OFL-1.1', 'not-a-font'), false);
  assert.equal(licenseAllowed('MIT OR GPL-3.0 AND GPL-3.0', 'example'), true);
});

test('TC-M0-014: GPL and missing licences fail and a third runtime dependency is rejected', () => {
  const manifest = { dependencies: { 'fast-xml-parser': '5', fflate: '0.8' } };
  assert.deepEqual(checkLicenseReports(manifest, [{ MIT: [{ name: 'safe', license: 'MIT' }] }]), []);
  assert.equal(
    checkLicenseReports(manifest, [{ 'GPL-3.0': [{ name: 'unsafe', license: 'GPL-3.0' }] }]).length,
    1,
  );
  assert.equal(checkLicenseReports(manifest, [{ UNKNOWN: [{ name: 'unknown' }] }]).length, 1);
  assert.equal(checkLicenseReports({ dependencies: { ...manifest.dependencies, extra: '1' } }, []).length, 1);
});

function docsFixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'efatura-docs-'));
  const put = (name, text) => {
    const path = join(root, name);
    mkdirSync(resolve(path, '..'), { recursive: true });
    writeFileSync(path, text);
  };
  const check = () =>
    spawnSync(
      process.execPath,
      [resolve('node_modules/tsx/dist/cli.mjs'), resolve('scripts/check-docs.ts')],
      { cwd: root, encoding: 'utf8' },
    );
  try {
    put(
      'src/index.ts',
      '/** Parse an invoice. @example parseInvoice(xml) */\nexport function parseInvoice(xml) { return xml; }',
    );
    put('src/zip.ts', 'export {};');
    put('README.md', '# efatura\n\n## Use\n\n```ts\nconst a = 1;\n```\n');
    put('README.tr.md', '# efatura\n\n## Kullanım\n\n```ts\nconst a = 1;\n```\n');
    run({ put, check });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('TC-M0-015–016 / NFR-18: documented exports pass and missing TSDoc fails', () =>
  docsFixture(({ put, check }) => {
    assert.equal(check().status, 0);
    put('src/index.ts', 'export function parseInvoice(xml) { return xml; }');
    const result = check();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /export lacks TSDoc with @example/);
  }));

test('TC-M0-015: README code and heading drift fail', () =>
  docsFixture(({ put, check }) => {
    put('README.tr.md', '# efatura\n\n## Kullanım\n\n```ts\nconst a = 2;\n```\n');
    assert.equal(check().status, 1);
    put('README.tr.md', '# efatura\n');
    assert.equal(check().status, 1);
  }));

test('TC-M0-015: nonempty catalogue and UI copy are checked against specs', () =>
  docsFixture(({ put, check }) => {
    put(
      'src/validate/catalogue.ts',
      'export const ISSUE_CODES = ["EF001"]; export const ISSUE_CATALOGUE = { EF001: { severity: "error", kind: "V", category: "identity", message: "Missing.", messageTr: "Eksik." } };',
    );
    assert.equal(check().status, 1);
    put('docs/TRD.md', '| EF001 | error | V |\n#### 9.3.2 Messages\n| EF001 | Missing. | Eksik. |');
    put('test/unit/validate/identity.test.ts', '// EF001 positive and negative coverage');
    put('fixtures/scenarios/rule.ts', 'const expect = ["EF001:error"];');
    assert.equal(check().status, 0);
    put('playground/src/i18n/en.ts', 'export const en = { "app.title": "Invoice" };');
    put('playground/src/i18n/tr.ts', 'export const tr = { "app.title": "Fatura" };');
    put('docs/PRD.md', '| `app.title` | Invoice | Fatura |');
    assert.equal(check().status, 0);
    put('playground/src/i18n/tr.ts', 'export const tr = { "app.title": "Wrong" };');
    assert.equal(check().status, 1);
  }));

test('TC-M0-018 / FR-56: contribution templates require synthetic data', () => {
  const pr = readFileSync('.github/pull_request_template.md', 'utf8');
  assert.ok(
    pr.includes(
      'No real invoices, real tax IDs, real names, addresses or other personal or company data. New fixtures come from `pnpm fixtures:generate`.',
    ),
  );
  const bug = readFileSync('.github/ISSUE_TEMPLATE/bug_report.yml', 'utf8');
  assert.ok(
    bug.includes(
      'Do not attach real invoices. They contain personal and company data. Describe the structure, or write a minimal XML with fake names and the test tax IDs from fixtures/README.md.',
    ),
  );
  assert.match(bug, /This issue contains no real invoice data\.\s+required: true/);
  assert.match(readFileSync('.github/ISSUE_TEMPLATE/config.yml', 'utf8'), /blank_issues_enabled: false/);
});
