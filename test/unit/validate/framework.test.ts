import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { ISSUE_CATALOGUE, ISSUE_CODES } from '../../../src/validate/catalogue';
import { createIssue, finishIssues } from '../../../src/validate/issue';
import { renderMessage } from '../../../src/validate/messages';
import { runRules, validateInvoice } from '../../../src/validate';
import type { Rule } from '../../../src/validate';
import { parseInvoice } from '../../../src/parse';
import { fullInvoiceXml } from '../../helpers/invoice';
import type { ParseOptions } from '../../../src/types';

it('TC-M2-001 / FR-18 UT-27: every catalogue row and variant matches the TRD byte-for-byte', () => {
  const spec = readFileSync(new URL('../../../docs/TRD.md', import.meta.url), 'utf8');
  const rules = spec.split('#### 9.3.1 Rules')[1]?.split('#### 9.3.2')[0] ?? '';
  const metadata = [...rules.matchAll(/^\| (EF\d{3})\s*\| (error|warning|info)\s*\| ([MVB])/gm)];
  expect(ISSUE_CODES).toEqual(metadata.map((m) => m[1]));
  expect(Object.keys(ISSUE_CATALOGUE)).toEqual(ISSUE_CODES);
  for (const [index, code] of ISSUE_CODES.entries()) {
    expect(ISSUE_CATALOGUE[code].severity).toBe(metadata[index]?.[2]);
    expect(ISSUE_CATALOGUE[code].kind).toBe(metadata[index]?.[3]);
  }
  const rows = (spec.split('#### 9.3.2 Messages')[1]?.split('#### 9.3.3')[0] ?? '')
    .split('\n')
    .filter((line) => line.startsWith('| EF'));
  for (const row of rows) {
    const [name, en, tr] = row
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const match = /^(EF\d{3})(?: \(([^)]+)\))?$/.exec(name ?? '');
    const code = ISSUE_CODES.find((value) => value === match?.[1]);
    expect(code).toBeDefined();
    if (code === undefined) throw new Error('TRD issue missing from catalogue');
    expect(createIssue(code, '/Invoice', {}, undefined, match?.[2])).toMatchObject({
      message: en,
      messageTr: tr,
    });
  }
  expect(ISSUE_CODES.map((code) => ISSUE_CATALOGUE[code].category)).toEqual([
    ...Array<string>(9).fill('identity'),
    ...Array<string>(8).fill('parties'),
    ...Array<string>(7).fill('currency'),
    ...Array<string>(4).fill('amounts'),
    ...Array<string>(10).fill('totals'),
    ...Array<string>(6).fill('lines'),
    ...Array<string>(7).fill('taxes'),
    ...Array<string>(2).fill('batch'),
  ]);
});
it('TC-M2-002 / FR-18 UT-27: Labels render independently and details are optional', () => {
  expect(
    createIssue('EF017', '/Invoice/cac:AccountingSupplierParty/cac:Party', {
      role: { en: 'supplier', tr: 'Satıcı' },
    }),
  ).toEqual({
    code: 'EF017',
    severity: 'warning',
    path: '/Invoice/cac:AccountingSupplierParty/cac:Party',
    message: 'The supplier has no name (neither PartyName nor Person).',
    messageTr: 'Satıcı için ad yok (PartyName veya Person bulunmuyor).',
  });
  expect(createIssue('EF001', '/Invoice/cbc:ID', { field: 'cbc:ID' }, { field: 'cbc:ID' })).toMatchObject({
    message: 'Required field cbc:ID is missing.',
    messageTr: 'Zorunlu alan cbc:ID eksik.',
    details: { field: 'cbc:ID' },
  });
  expect(renderMessage('{value}/{value}', { value: '0.01' }, 'en')).toBe('0.01/0.01');
});
it('TC-M2-003 / FR-18 FR-19 UT-22: deduplication, code-point order and overrides applied last', () => {
  const a = createIssue('EF030', '/Invoice/b', { value: 'bad' });
  const b = createIssue('EF031', '/Invoice/A', { value: '1,2', normalized: '1.2' });
  const c = createIssue('EF032', '/Invoice/A', { value: '1' });
  const d = createIssue('EF032', '/Invoice/b', { value: '1' });
  expect(
    finishIssues([d, c, a, b, a, { ...a, message: 'distinct' }]).map((i) => [i.code, i.path, i.message]),
  ).toEqual([a, { ...a, message: 'distinct' }, b, c, d].map((i) => [i.code, i.path, i.message]));
  expect(
    finishIssues([b, a, c], { rules: { EF030: 'info', EF031: 'error', EF032: 'off' } }).map((i) => [
      i.code,
      i.severity,
    ]),
  ).toEqual([
    ['EF030', 'info'],
    ['EF031', 'error'],
  ]);
});
it('TC-M2-004 TC-M2-006 / FR-19 FR-20 UT-22: standalone options and ordered rule context', () => {
  const invoice = parseInvoice(fullInvoiceXml, { validate: false }).invoice;
  for (const options of [
    { tolerance: '-1' },
    { tolerance: 'bad' },
    { rules: { EF018: 'off' } },
    { rules: { EF001: 'fatal' } },
  ])
    expect(() => validateInvoice(invoice, options as ParseOptions)).toThrow(TypeError);
  for (const tolerance of ['0', '0.05']) expect(() => validateInvoice(invoice, { tolerance })).not.toThrow();
  const calls: string[] = [];
  const rules: Rule[] = [
    (_invoice, ctx) => {
      calls.push(ctx.tolerance);
      ctx.report('EF050', '/Invoice');
    },
    (_invoice, ctx) => {
      calls.push('second');
      ctx.report('EF066', '/Invoice');
    },
  ];
  expect(runRules(invoice, rules).map((issue) => issue.code)).toEqual(['EF050', 'EF066']);
  expect(calls).toEqual(['0.01', 'second']);
  expect(runRules(invoice, rules, { tolerance: '0' })).toHaveLength(2);
  expect(calls[2]).toBe('0');
  expect(validateInvoice(invoice).every((issue) => ISSUE_CATALOGUE[issue.code].kind === 'V')).toBe(true);
});
