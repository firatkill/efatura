import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, it } from 'vitest';
import { checkDocs } from '../../../scripts/check-docs';

it('TC-M2-007 / FR-18 NFR-18 UT-27: exact catalogue parity and staged coverage gates reject negative probes', () => {
  const root = mkdtempSync(join(tmpdir(), 'efatura-docs-'));
  try {
    for (const path of [
      'src/index.ts',
      'src/zip.ts',
      'src/validate/catalogue.ts',
      'docs/TRD.md',
      'docs/PRD.md',
      'README.md',
      'README.tr.md',
    ]) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), readFileSync(new URL('../../../' + path, import.meta.url), 'utf8'));
    }
    mkdirSync(join(root, 'test/unit/validate'), { recursive: true });
    writeFileSync(
      join(root, 'test/unit/validate/mapping.test.ts'),
      '// EF009 EF015 EF023 EF030 EF031 EF032 EF035',
    );
    writeFileSync(join(root, 'docs/PROGRESS.md'), '| T-17 | framework | doing | — |');
    expect(checkDocs(root)).toEqual([]);
    const path = join(root, 'src/validate/catalogue.ts');
    const original = readFileSync(path, 'utf8');
    writeFileSync(path, original.replace('Zorunlu alan {field} eksik.', 'Zorunlu alan {field} eksik!'));
    expect(checkDocs(root)).toContain('EF001: catalogue message differs from TRD');
    writeFileSync(path, original);
    expect(checkDocs(root)).toEqual([]);
    const progress = join(root, 'docs/PROGRESS.md');
    const initial = readFileSync(progress, 'utf8');
    writeFileSync(progress, initial + '\n| T-32 | scenarios | doing | — |\n');
    expect(checkDocs(root)).toContain('EF001: missing fixture expectation');
    writeFileSync(progress, initial + '\n| T-19 | identity rules | doing | — |\n');
    expect(checkDocs(root)).toContain('EF002: missing validation test');
    writeFileSync(progress, initial);
    expect(checkDocs(root)).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
