import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  CODE_LISTS_VERIFIED,
  CURRENCIES,
  EXEMPTION_CODES,
  INVOICE_TYPES,
  PROFILES,
  TAX_TYPES,
  UNIT_CODES,
  WITHHOLDING_CODES,
} from '../../src/codes';
import { lookupInvoiceType, lookupProfile } from '../../src/codes/lookup';
import { EXPECTED_CUSTOMIZATION_IDS } from '../../src/config';
import { minorUnitsOf } from '../../src/decimal/minor-units';

// TC-M1-019; PRD FR-14, R-02; TRD UT-13 and A-01–07/A-11.
describe('UT-13 verified code lists', () => {
  it('ships bilingual entries and concrete source versions for every list', () => {
    const lists = [
      PROFILES,
      INVOICE_TYPES,
      TAX_TYPES,
      WITHHOLDING_CODES,
      EXEMPTION_CODES,
      UNIT_CODES,
      CURRENCIES,
    ];
    expect(lists.map((list) => list.size)).toEqual([12, 20, 31, 52, 113, 28, 178]);
    for (const list of lists)
      for (const [code, value] of list) {
        expect(value.code).toBe(code);
        expect(value.label.en.trim()).not.toBe('');
        expect(value.label.tr.trim()).not.toBe('');
      }
    expect(Object.keys(CODE_LISTS_VERIFIED)).toHaveLength(7);
    for (const value of Object.values(CODE_LISTS_VERIFIED)) {
      expect(value.source.length).toBeGreaterThan(0);
      expect(value.version).not.toMatch(/…|<|>/);
      expect(value.checkedOn).toBe('2026-10-21');
    }
  });
  it('normalises lookup case and preserves the OTHER fallback', () => {
    expect(lookupProfile(' temelFatura ')).toBe('TEMELFATURA');
    expect(lookupInvoiceType(' satis ')).toBe('SATIS');
    for (const value of ['unknown', '', null]) {
      expect(lookupProfile(value)).toBe('OTHER');
      expect(lookupInvoiceType(value)).toBe('OTHER');
    }
    for (const code of PROFILES.keys()) expect(lookupProfile(code)).toBe(code);
    for (const code of INVOICE_TYPES.keys()) expect(lookupInvoiceType(code)).toBe(code);
  });
  it('uses the approved executable membership when the PDF disagrees', () => {
    expect(EXPECTED_CUSTOMIZATION_IDS).toEqual(['TR1.2', 'TR1.2.1']);
    expect(lookupProfile('ozelfatura')).toBe('OZELFATURA');
    expect(lookupProfile('idis')).toBe('IDIS');
    expect(lookupProfile('STDKODFATURA')).toBe('OTHER');
    expect(lookupProfile('TEMELIRSALIYE')).toBe('OTHER');
    expect(lookupInvoiceType('HKSSATIS')).toBe('HKSSATIS');
    expect(lookupInvoiceType('HKSKOMISYONCU')).toBe('HKSKOMISYONCU');
    expect(TAX_TYPES.has('0072')).toBe(false);
    expect(TAX_TYPES.get('9077')?.kind).toBe('OTV');
    expect(TAX_TYPES.get('0015')?.short).toBe('KDV GERCEK');
    expect(TAX_TYPES.get('0059')?.short).toBe('KONAKLAMA V.');
    expect(TAX_TYPES.get('9015')?.short).toBe('KDV TEVKİFAT');
    expect([...TAX_TYPES.keys()].sort()).toEqual(
      '0003 0011 0015 0021 0022 0059 0061 0071 0073 0074 0075 0076 0077 1047 1048 4071 4080 4081 4171 8001 8002 8004 8005 8006 8007 8008 9015 9021 9040 9077 9944'.split(
        ' ',
      ),
    );
    expect([...WITHHOLDING_CODES.keys()]).toEqual([
      ...Array.from({ length: 27 }, (_, i) => String(601 + i)),
      ...Array.from({ length: 25 }, (_, i) => String(801 + i)),
    ]);
    expect(WITHHOLDING_CODES.has('650')).toBe(false);
    for (const value of WITHHOLDING_CODES.values()) {
      expect(value.kind).toBe('KDV_WITHHOLDING');
      expect(value).not.toHaveProperty('rate');
    }
  });
  it('includes the full exemption union and preserves wrapped PDF rows', () => {
    expect([...EXEMPTION_CODES.keys()]).toEqual(
      '001 101 102 103 104 105 106 107 108 151 201 202 204 205 206 207 208 209 211 212 213 214 215 216 217 218 219 220 221 223 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 250 301 302 303 304 305 306 307 308 309 310 311 312 313 314 315 316 317 318 319 320 321 322 323 324 325 326 327 328 329 330 331 332 333 334 335 336 337 338 339 340 341 342 343 344 350 351 501 555 701 702 703 704 801 802 803 804 805 806 807 808 809 810 811 812'.split(
        ' ',
      ),
    );
    expect(EXEMPTION_CODES.get('809')?.label.tr).toContain(
      'Biletlerin ve Kartların Bayiler Tarafından Satışı',
    );
    expect(EXEMPTION_CODES.get('810')?.label.tr).toBe('Ön Ödemeli Elektronik Haberleşme Hizmetleri');
    expect(EXEMPTION_CODES.get('325')?.label.tr).toBe('13/ı Yem Teslimleri');
    expect(EXEMPTION_CODES.get('351')?.label.tr).toBe('KDV - İstisna Olmayan Diğer');
    expect(EXEMPTION_CODES.has('999')).toBe(false);
  });
  it('uses Rec. 20 names and SIX precision with required Turkish translations', () => {
    expect(UNIT_CODES.get('C62')?.label.en).toBe('one');
    expect(UNIT_CODES.get('NIU')?.label.en).toBe('number of international units');
    expect(UNIT_CODES.has('UNKNOWN')).toBe(false);
    expect(CURRENCIES.get('XAU')?.minorUnits).toBeNull();
    expect(minorUnitsOf(' jpy ')).toBe(0);
    expect(minorUnitsOf('kwd')).toBe(3);
    expect(CURRENCIES.get('CLF')?.minorUnits).toBe(4);
    expect(CURRENCIES.get('RUB')?.label.tr).toBe('Rus rublesi');
    expect(CURRENCIES.get('CNY')?.label.tr).toBe('Çin yuanı');
    expect(CURRENCIES.get('SAR')?.label.tr).toBe('Suudi Arabistan riyali');
    expect(CURRENCIES.get('AED')?.label.tr).toBe('Birleşik Arap Emirlikleri dirhemi');
    expect(CURRENCIES.get('AZN')?.label.tr).toBe('Azerbaycan manatı');
    expect(CURRENCIES.get('AUD')?.label.tr).toBe(CURRENCIES.get('AUD')?.label.en);
  });
});

it('TC-M1-019 / UT-13: currency storage preserves every verified record byte-for-byte', () => {
  expect(
    createHash('sha256')
      .update(JSON.stringify([...CURRENCIES]))
      .digest('hex'),
  ).toBe('d41c542595c30774e0cc68b7818d5c067fbaaa1c95adc54497b3cb462e5fff8f');
});
