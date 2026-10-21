import { Buffer } from 'node:buffer';
import { expect, it } from 'vitest';
import fc from 'fast-check';
import { base64Size, decodeBase64 } from '../../src/attachments/base64';
it.each([
  ['', []],
  ['TQ==', [77]],
  ['TQ', [77]],
  ['TQ=', [77]],
  ['TWE=', [77, 97]],
  ['TWE', [77, 97]],
  ['TWFu', [77, 97, 110]],
])('TC-M1-031 / FR-12 / UT-04: padding variant %s', (value, bytes) => {
  expect([...decodeBase64(value)]).toEqual(bytes);
});
it.each([
  ['TW?u', 2],
  ['T Q=', 1],
  ['T=Q=', 1],
  ['TQ=A', 3],
  ['====', 0],
  ['TQé=', 2],
  ['TQ😀', 2],
  ['A', 0],
])('TC-M1-031 / UT-04: invalid base64 %s reports position %i', (value, index) => {
  expect(() => decodeBase64(value)).toThrow(`Invalid base64 at position ${String(index)}`);
});
it('TC-M1-031 TC-M1-032 / UT-04 UT-20: 100 byte arrays round-trip and size matches independently encoded bytes', () => {
  for (const bytes of fc.sample(fc.uint8Array({ maxLength: 1024 }), { seed: 1234, numRuns: 100 })) {
    const encoded = Buffer.from(bytes).toString('base64');
    expect(base64Size(encoded)).toBe(bytes.length);
    expect(decodeBase64(encoded)).toEqual(bytes);
    expect(decodeBase64(encoded.replace(/=+$/, ''))).toEqual(bytes);
  }
});
