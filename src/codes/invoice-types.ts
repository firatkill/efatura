import type { CodeInfo } from '../types';

const entries = [
  { code: 'SATIS', label: { en: 'Sale', tr: 'Satış' } },
  { code: 'IADE', label: { en: 'Return', tr: 'İade' } },
  { code: 'TEVKIFAT', label: { en: 'Withholding', tr: 'Tevkifat' } },
  { code: 'TEVKIFATIADE', label: { en: 'Withholding return', tr: 'Tevkifat iade' } },
  { code: 'ISTISNA', label: { en: 'Exempt', tr: 'İstisna' } },
  { code: 'OZELMATRAH', label: { en: 'Special tax base', tr: 'Özel matrah' } },
  { code: 'IHRACKAYITLI', label: { en: 'Export-registered sale', tr: 'İhraç kayıtlı' } },
  { code: 'SGK', label: { en: 'Social security (SGK)', tr: 'SGK' } },
  { code: 'KOMISYONCU', label: { en: 'Commission agent', tr: 'Komisyoncu' } },
  { code: 'HKSSATIS', label: { en: 'HKS sale', tr: 'HKS satış' } },
  { code: 'HKSKOMISYONCU', label: { en: 'HKS commission agent', tr: 'HKS komisyoncu' } },
  { code: 'KONAKLAMAVERGISI', label: { en: 'Accommodation tax', tr: 'Konaklama vergisi' } },
  { code: 'SARJ', label: { en: 'EV charging', tr: 'Şarj' } },
  { code: 'SARJANLIK', label: { en: 'Instant EV charging', tr: 'Şarj anlık' } },
  { code: 'TEKNOLOJIDESTEK', label: { en: 'Technology support', tr: 'Teknoloji destek' } },
  { code: 'YTBSATIS', label: { en: 'Investment incentive sale', tr: 'YTB satış' } },
  { code: 'YTBIADE', label: { en: 'Investment incentive return', tr: 'YTB iade' } },
  { code: 'YTBISTISNA', label: { en: 'Investment incentive exempt', tr: 'YTB istisna' } },
  { code: 'YTBTEVKIFAT', label: { en: 'Investment incentive withholding', tr: 'YTB tevkifat' } },
  {
    code: 'YTBTEVKIFATIADE',
    label: { en: 'Investment incentive withholding return', tr: 'YTB tevkifat iade' },
  },
] as const;
/** Verified invoice types; see CODE_LISTS_VERIFIED.
 * @example
 * INVOICE_TYPES.get("SATIS");
 */
export const INVOICE_TYPES: ReadonlyMap<string, CodeInfo> = new Map(
  entries.map((entry) => [entry.code, entry]),
);
