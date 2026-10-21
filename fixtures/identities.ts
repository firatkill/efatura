/** Initial synthetic identities needed by T-12; the complete generator set is added in T-31.
 * Values and names are prescribed by TRD §15.2, never sampled from real invoices.
 * @example
 * IDENTITIES.SUP_A.taxId;
 */
export const IDENTITIES = {
  FOREIGN: { name: 'Example Trading GmbH (fictitious)', taxId: null, scheme: null, identifier: 'F-0001' },
  SUP_A: { name: 'Örnek Yazılım Anonim Şirketi', taxId: '9990000013', scheme: 'VKN' },
  PER_A: { name: 'Ayşe Örnek', taxId: '50000000128', scheme: 'TCKN' },
  BAD_VKN: { name: 'Örnek Hatalı Anonim Şirketi', taxId: '9990000014', scheme: 'VKN' },
  BAD_TCKN: { name: 'Ali Hatalı', taxId: '50000000129', scheme: 'TCKN' },
} as const;
