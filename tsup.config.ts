import { chmodSync, readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig([
  {
    entry: { index: 'src/index.ts', zip: 'src/zip.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'neutral',
    treeshake: true,
    splitting: false,
    external: ['fast-xml-parser', 'fflate', '@firatkill/efatura'],
  },
  {
    entry: { cli: 'src/cli/main.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: false,
    target: 'node20',
    platform: 'node',
    banner: { js: '#!/usr/bin/env node' },
    define: { __EFATURA_VERSION__: JSON.stringify(version) },
    external: ['fast-xml-parser', 'fflate', '@firatkill/efatura', '@firatkill/efatura/zip'],
    onSuccess: async () => {
      chmodSync('dist/cli.js', 0o755);
    },
  },
]);
