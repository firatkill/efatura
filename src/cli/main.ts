import { version } from './version';

if (process.argv.includes('--version')) {
  console.log(`efatura ${version}`);
}
