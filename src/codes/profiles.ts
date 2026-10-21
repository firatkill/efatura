import type { CodeInfo } from '../types';

// Label columns: en, tr; rows correspond to the membership codes below.
// Delimited literals keep the complete verified labels within the core size budget.
/** Internal membership codes, independent of display labels for tree shaking.
 * @example
 * PROFILE_IDS[0]; // TEMELFATURA
 */
export const PROFILE_IDS = [
  'TEMELFATURA',
  'TICARIFATURA',
  'EARSIVFATURA',
  'IHRACAT',
  'YOLCUBERABERFATURA',
  'KAMU',
  'HKS',
  'ENERJI',
  'ILAC_TIBBICIHAZ',
  'YATIRIMTESVIK',
  'OZELFATURA',
  'IDIS',
] as const;
const entries = `Basic invoice|Temel fatura
Commercial invoice|Ticari fatura
e-Archive invoice|e-Arşiv fatura
Export invoice|İhracat faturası
Tax-free traveller invoice|Yolcu beraber fatura
Public administration invoice|Kamu faturası
Produce market (HKS) invoice|HKS faturası
Energy (EV charging) invoice|Enerji faturası
Medicine and medical device invoice|İlaç ve tıbbi cihaz faturası
Investment incentive invoice|Yatırım teşvik faturası
Special invoice|Özel fatura
Iron monitoring system invoice|İnşaat demiri izleme sistemi faturası`;
/** Verified invoice profiles; see CODE_LISTS_VERIFIED.
 * @example
 * PROFILES.get("TEMELFATURA");
 */
export const PROFILES: ReadonlyMap<string, CodeInfo> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ PROFILE_IDS.map((code, index) => {
    // The checked-in table above has exactly these columns on every row.
    const row = entries.split('\n')[index];
    if (row === undefined) throw new Error('Missing code-list labels');
    const [en, tr] = row.split('|') as [string, string];
    return [code, { code, label: { en, tr } }];
  }),
);
