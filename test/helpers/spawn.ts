import { spawnSync } from 'node:child_process';
/**
 * Run the built CLI in a fresh Node process.
 * @example
 * const result = spawnCli(['--version']);
 */
export function spawnCli(args: string[]) {
  return spawnSync(process.execPath, ['dist/cli.js', ...args], { encoding: 'utf8' });
}
