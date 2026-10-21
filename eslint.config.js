import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

const coreImports = [
  'node:*',
  'fs',
  'path',
  'os',
  'crypto',
  'buffer',
  'stream',
  'util',
  'zlib',
  'child_process',
  'url',
  'events',
  'worker_threads',
];
const relativeCore = [
  '../xml/*',
  '../model/*',
  '../validate/*',
  '../batch/*',
  '../export/*',
  '../decimal/*',
  '../ids/*',
  '../attachments/*',
  '../parse',
  '../errors',
];
const money = [
  "CallExpression[callee.name='parseFloat']",
  "MemberExpression[object.name='Number'][property.name='parseFloat']",
  "CallExpression[callee.property.name='toFixed']",
  "MemberExpression[object.name='Math'][property.name=/^(round|floor|ceil|trunc)$/]",
].map((selector) => ({ selector, message: 'Money must stay decimal; use the decimal module.' }));

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'coverage/**',
      'private/**',
      'fixtures/generated/**',
      'test/snapshot/__snapshots__/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  { files: ['test/package/*.mjs'], languageOptions: { globals: { process: 'readonly' } } },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './playground/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'error',
    },
  },
  { files: ['src/cli/**', 'scripts/**', 'fixtures/**'], rules: { 'no-console': 'off' } },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/cli/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: coreImports }],
      'no-restricted-globals': ['error', 'Buffer', 'process', 'require', '__dirname', '__filename', 'global'],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/internal/**', 'src/batch/progress.ts'],
    rules: { 'no-restricted-syntax': ['error', ...money] },
  },
  {
    files: ['src/zip/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [...coreImports, ...relativeCore] }] },
  },
  { files: ['src/cli/**/*.ts'], rules: { 'no-restricted-imports': ['error', { patterns: relativeCore }] } },
  {
    files: ['playground/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...[
          'AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]',
          "CallExpression[callee.property.name='insertAdjacentHTML']",
          "CallExpression[callee.object.name='document'][callee.property.name='write']",
          'CallExpression[callee.name=/^(eval|Function)$/]',
          "NewExpression[callee.name='Function']",
        ].map((selector) => ({
          selector,
          message: 'Build DOM with h(); executable HTML strings are forbidden.',
        })),
      ],
    },
  },
  {
    files: ['playground/src/**/*.ts'],
    ignores: ['playground/src/components/samples.ts'],
    rules: { 'no-restricted-globals': ['error', 'fetch'] },
  },
  {
    files: ['*.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { parserOptions: { project: false } },
  },
  prettier,
);
