import { expect, test } from 'vitest';
import { spawnCli } from '../helpers/spawn';
test('TC-M0-010 / CT-02: built CLI version', () => {
  const result = spawnCli(['--version']);
  expect(result.status).toBe(0);
  expect(result.stdout).toBe('efatura 0.0.0\n');
  expect(result.stderr).toBe('');
});
