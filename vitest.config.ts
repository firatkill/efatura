import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

// fileURLToPath, not URL.pathname: pathname gives "/C:/…" on Windows, where the cli job runs.
const alias = {
  '@firatkill/efatura/zip': fileURLToPath(new URL('./src/zip.ts', import.meta.url)),
  '@firatkill/efatura': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
};

export default defineConfig({
  resolve: { alias },
  optimizeDeps: { include: ['fflate'] },
  define: { __EFATURA_VERSION__: JSON.stringify('0.0.0-test') },
  test: {
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/cli/**', 'src/types.ts'],
      thresholds: {
        autoUpdate: false,
        lines: 95,
        branches: 90,
        functions: 95,
        statements: 95,
        'src/decimal/**': { lines: 100 },
        'src/ids/**': { lines: 100 },
        'src/validate/**': { lines: 100 },
        'src/export/csv.ts': { lines: 100 },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'test/unit/**/*.test.ts',
            'test/snapshot/**/*.test.ts',
            'test/property/**/*.test.ts',
            'playground/src/**/*.test.ts',
          ],
          exclude: ['**/*.browser.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['test/browser/**/*.browser.test.ts', 'playground/src/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
          },
        },
      },
      {
        extends: true,
        test: { name: 'cli', include: ['test/cli/**/*.test.ts'], environment: 'node', testTimeout: 30_000 },
      },
    ],
  },
});
