import type { CodeInfo } from '../types';

// Label columns: en, tr; rows correspond to the membership codes below.
// Delimited literals keep the complete verified labels within the core size budget.
/** Internal membership codes, independent of display labels for tree shaking.
 * @example
 * INVOICE_TYPE_IDS[0]; // SATIS
 */
export const INVOICE_TYPE_IDS = [
  'SATIS',
  'IADE',
  'TEVKIFAT',
  'TEVKIFATIADE',
  'ISTISNA',
  'OZELMATRAH',
  'IHRACKAYITLI',
  'SGK',
  'KOMISYONCU',
  'HKSSATIS',
  'HKSKOMISYONCU',
  'KONAKLAMAVERGISI',
  'SARJ',
  'SARJANLIK',
  'TEKNOLOJIDESTEK',
  'YTBSATIS',
  'YTBIADE',
  'YTBISTISNA',
  'YTBTEVKIFAT',
  'YTBTEVKIFATIADE',
] as const;
const entries = `Sale|Satış
Return|İade
Withholding|Tevkifat
Withholding return|Tevkifat iade
Exempt|İstisna
Special tax base|Özel matrah
Export-registered sale|İhraç kayıtlı
Social security (SGK)|SGK
Commission agent|Komisyoncu
HKS sale|HKS satış
HKS commission agent|HKS komisyoncu
Accommodation tax|Konaklama vergisi
EV charging|Şarj
Instant EV charging|Şarj anlık
Technology support|Teknoloji destek
Investment incentive sale|YTB satış
Investment incentive return|YTB iade
Investment incentive exempt|YTB istisna
Investment incentive withholding|YTB tevkifat
Investment incentive withholding return|YTB tevkifat iade`;
/** Verified invoice types; see CODE_LISTS_VERIFIED.
 * @example
 * INVOICE_TYPES.get("SATIS");
 */
export const INVOICE_TYPES: ReadonlyMap<string, CodeInfo> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ INVOICE_TYPE_IDS.map((code, index) => {
    // The checked-in table above has exactly these columns on every row.
    const row = entries.split('\n')[index];
    if (row === undefined) throw new Error('Missing code-list labels');
    const [en, tr] = row.split('|') as [string, string];
    return [code, { code, label: { en, tr } }];
  }),
);
