import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, test } from 'vitest';

test('TC-M0-002 / NFR-14: lint rejects Node imports in browser core', () => {
  const directory = mkdtempSync(join(process.cwd(), 'src', 'qa-boundary-'));
  try {
    const file = join(directory, 'probe.ts');
    writeFileSync(file, "import 'node:fs';\nimport 'path';\nimport './path';\n");
    const result = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', file], {
      encoding: 'utf8',
    });
    expect(result.status).toBe(1);
    expect(result.stdout.match(/no-restricted-imports/g)).toHaveLength(2);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 30_000);
