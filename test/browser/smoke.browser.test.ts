import { expect, test } from 'vitest';
import { parseInvoice, EfaturaParseError } from '@firatkill/efatura';
import * as zip from '@firatkill/efatura/zip';
test('TC-M0-009 / NFR-14: browser core smoke', () => {
  expect(parseInvoice('<Invoice/>').invoice.lines).toEqual([]);
  expect(() => parseInvoice('<Other/>')).toThrow(EfaturaParseError);
  expect(zip).toBeDefined();
});

test('TC-M1-034 TC-M1-036 / FR-01 FR-16 NFR-14: full invoice parses as cloneable browser data', async () => {
  const { fullInvoiceXml } = await import('../helpers/invoice');
  const result = parseInvoice(new TextEncoder().encode(fullInvoiceXml));
  expect(result.issues).toEqual([]);
  expect(result.invoice.computed.payableTry).toBe('3861.00');
  expect(structuredClone(result)).toEqual(result);
  expect(JSON.parse(JSON.stringify(result))).toEqual(result);
});
