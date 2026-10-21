import { expect, test } from 'vitest';
import { VERSION } from '@firatkill/efatura';
import { ZIP_VERSION } from '@firatkill/efatura/zip';
test('TC-M0-008 / NFR-13: shared core smoke', () => {
  expect(VERSION).toBe('0.0.0');
  expect(ZIP_VERSION).toBe(VERSION);
});
test('TC-M0-011: network access is rejected by the test environment', () => {
  expect(() => fetch('https://example.invalid')).toThrow('Network access is not allowed in tests');
});
