import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const allowed = new Set([
  'MIT',
  'Zlib',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  '0BSD',
  'CC0-1.0',
  'BlueOak-1.0.0',
]);
const fonts = new Set(['@fontsource/schibsted-grotesk', '@fontsource/jetbrains-mono']);

/**
 * Evaluate the shipped-dependency SPDX allowlist, rejecting malformed expressions.
 * @example
 * licenseAllowed('(MPL-2.0 OR Apache-2.0)', 'dompurify');
 */
export function licenseAllowed(expression, name) {
  if (typeof expression !== 'string') return false;
  const tokens = expression.match(/[A-Za-z0-9.+-]+|[()]|\S/g) ?? [];
  let position = 0;
  let valid = true;
  function atom() {
    const token = tokens[position++];
    if (token === '(') {
      const result = or();
      if (tokens[position++] !== ')') valid = false;
      return result;
    }
    if (!token || ['AND', 'OR', ')'].includes(token)) valid = false;
    return allowed.has(token) || (token === 'OFL-1.1' && fonts.has(name));
  }
  function and() {
    let result = atom();
    while (tokens[position] === 'AND') {
      position++;
      const right = atom();
      result = result && right;
    }
    return result;
  }
  function or() {
    let result = and();
    while (tokens[position] === 'OR') {
      position++;
      const right = and();
      result = result || right;
    }
    return result;
  }
  const result = or();
  return valid && position === tokens.length && result;
}

/**
 * Inspect pnpm's licence groups and the root's exact runtime-dependency boundary.
 * @example
 * checkLicenseReports({ dependencies: { 'fast-xml-parser': '5', fflate: '0.8' } }, []);
 */
export function checkLicenseReports(manifest, reports) {
  const problems = [];
  const dependencies = Object.keys(manifest.dependencies ?? {}).sort();
  if (JSON.stringify(dependencies) !== JSON.stringify(['fast-xml-parser', 'fflate'])) {
    problems.push('Root runtime dependencies must be exactly fast-xml-parser and fflate.');
  }
  for (const report of reports) {
    if (!report || typeof report !== 'object' || Array.isArray(report)) {
      problems.push('Invalid pnpm licence report.');
      continue;
    }
    for (const entries of Object.values(report)) {
      if (!Array.isArray(entries)) {
        problems.push('Invalid pnpm licence group.');
        continue;
      }
      for (const entry of entries) {
        if (!licenseAllowed(entry.license, entry.name)) {
          problems.push(`${entry.name ?? '(unnamed)'}: disallowed licence ${entry.license ?? '(missing)'}`);
        }
      }
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
    const reports = [[], ['--filter', 'playground']].map((prefix) => {
      const args = [...prefix, 'licenses', 'list', '--prod', '--json'];
      const output = process.env.npm_execpath
        ? execFileSync(process.execPath, [process.env.npm_execpath, ...args], { encoding: 'utf8' })
        : execFileSync('pnpm', args, { encoding: 'utf8', shell: process.platform === 'win32' });
      return JSON.parse(output);
    });
    const problems = checkLicenseReports(manifest, reports);
    if (problems.length) throw new Error(problems.join('\n'));
    console.log('Production licences and runtime dependency boundary passed.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
