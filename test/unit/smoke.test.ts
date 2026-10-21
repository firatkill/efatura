import { expect, test } from 'vitest';
import { parseInvoice, EfaturaParseError } from '@firatkill/efatura';
import * as zip from '@firatkill/efatura/zip';
test('TC-M0-008 / NFR-13: shared core smoke', () => {
  expect(parseInvoice('<Invoice/>').invoice.lines).toEqual([]);
  expect(() => parseInvoice('<Other/>')).toThrow(EfaturaParseError);
  expect(zip).toBeDefined();
});
test('TC-M0-011: network access is rejected by the test environment', () => {
  expect(() => fetch('https://example.invalid')).toThrow('Network access is not allowed in tests');
});
