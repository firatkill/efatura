import { expect, test } from 'vitest';
import { VERSION } from '@firatkill/efatura';
import { ZIP_VERSION } from '@firatkill/efatura/zip';
test('TC-M0-009 / NFR-14: browser core smoke', () => {
  expect(VERSION).toBe('0.0.0');
  expect(ZIP_VERSION).toBe(VERSION);
});
