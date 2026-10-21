import { expect, it } from 'vitest';
import { classifyTaxId, isValidTckn, isValidUuid, isValidVkn } from '../../src/index';

it('TC-M2-008 / FR-21 UT-10: every normative VKN vector', () => {
  for (const value of [
    '1234567890',
    '9876543217',
    '1111111114',
    '9990000013',
    '9990000021',
    '9990000039',
    '9990000046',
    '9990000054',
    '9990000062',
    '1460415308',
  ])
    expect(isValidVkn(value), value).toBe(true);
  for (const value of ['1234567891', '9990000014', '999000001', '99900000130', '999000001A', ''])
    expect(isValidVkn(value), value).toBe(false);
});

it('TC-M2-009 / FR-21 UT-11: every normative TCKN vector', () => {
  for (const value of [
    '10000000146',
    '12345678950',
    '98765432150',
    '50000000128',
    '50000000296',
    '50000000364',
    '11111111110',
  ])
    expect(isValidTckn(value), value).toBe(true);
  for (const value of [
    '11111111111',
    '10000000147',
    '10000000156',
    '50000000129',
    '01234567890',
    '1000000014',
    '',
  ])
    expect(isValidTckn(value), value).toBe(false);
});

it('TC-M2-010 / FR-21 UT-12: UUID shape and tax identifier classification', () => {
  for (const value of [
    '00000000-0000-0000-0000-000000000001',
    'abcdefab-cdef-abcd-efab-cdefabcdefab',
    'ABCDEFAB-CDEF-ABCD-EFAB-CDEFABCDEFAB',
  ])
    expect(isValidUuid(value)).toBe(true);
  for (const value of [
    '',
    'uuid',
    '00000000000000000000000000000001',
    '{00000000-0000-0000-0000-000000000001}',
    'g0000000-0000-0000-0000-000000000001',
  ])
    expect(isValidUuid(value)).toBe(false);
  expect(classifyTaxId('9990000013')).toEqual({ scheme: 'VKN', valid: true, anonymous: false });
  expect(classifyTaxId('9990000014')).toEqual({ scheme: 'VKN', valid: false, anonymous: false });
  expect(classifyTaxId('50000000128')).toEqual({ scheme: 'TCKN', valid: true, anonymous: false });
  expect(classifyTaxId('50000000129')).toEqual({ scheme: 'TCKN', valid: false, anonymous: false });
  expect(classifyTaxId('11111111111')).toEqual({ scheme: 'TCKN', valid: false, anonymous: true });
  expect(classifyTaxId('01234567890')).toEqual({ scheme: 'TCKN', valid: false, anonymous: false });
  for (const value of ['', '999000001A', 'F-0001'])
    expect(classifyTaxId(value)).toEqual({ scheme: null, valid: false, anonymous: false });
});
