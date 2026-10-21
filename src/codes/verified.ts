/** Official source versions checked for the bundled lists; see docs/CODE-LIST-VERIFICATION.md.
 * @example
 * CODE_LISTS_VERIFIED.currencies.version; // '2026-09-17'
 */
export const CODE_LISTS_VERIFIED = {
  profiles: {
    source: 'UBL-TR Kod Listeleri / e-Fatura executable membership',
    version: '1.43 (2026-07-27); package checked 2026-10-21',
    checkedOn: '2026-10-21',
  },
  invoiceTypes: {
    source: 'UBL-TR Kod Listeleri / e-Fatura executable membership',
    version: '1.43 (2026-07-27); package checked 2026-10-21',
    checkedOn: '2026-10-21',
  },
  taxTypes: {
    source: 'UBL-TR Kod Listeleri (Vergi Kodları) / GİB Vergi Türü Kodları',
    version: '1.43 (2026-07-27); tax register checked 2026-10-21',
    checkedOn: '2026-10-21',
  },
  withholding: {
    source: 'UBL-TR Kod Listeleri (Tevkifat Kodları) / KDV Genel Uygulama Tebliği',
    version: '1.43 (2026-07-27); consolidated communiqué checked 2026-10-21',
    checkedOn: '2026-10-21',
  },
  exemptions: {
    source: 'UBL-TR Kod Listeleri (İstisna Kodları) / KDV Genel Uygulama Tebliği II/A-5.11',
    version: '1.43 (2026-07-27); consolidated communiqué checked 2026-10-21',
    checkedOn: '2026-10-21',
  },
  units: {
    source: 'UBL-TR Kod Listeleri (Birim Kodları) / UN/ECE Rec. 20 in OASIS UBL 2.1',
    version: '1.43 (2026-07-27) / Rec. 20 revision 8e (2012)',
    checkedOn: '2026-10-21',
  },
  currencies: { source: 'ISO 4217 List One (SIX)', version: '2026-09-17', checkedOn: '2026-10-21' },
} as const;
