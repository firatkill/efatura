import type { CodeInfo } from '../types';

const entries = [
  { code: 'TEMELFATURA', label: { en: 'Basic invoice', tr: 'Temel fatura' } },
  { code: 'TICARIFATURA', label: { en: 'Commercial invoice', tr: 'Ticari fatura' } },
  { code: 'EARSIVFATURA', label: { en: 'e-Archive invoice', tr: 'e-Arşiv fatura' } },
  { code: 'IHRACAT', label: { en: 'Export invoice', tr: 'İhracat faturası' } },
  { code: 'YOLCUBERABERFATURA', label: { en: 'Tax-free traveller invoice', tr: 'Yolcu beraber fatura' } },
  { code: 'KAMU', label: { en: 'Public administration invoice', tr: 'Kamu faturası' } },
  { code: 'HKS', label: { en: 'Produce market (HKS) invoice', tr: 'HKS faturası' } },
  { code: 'ENERJI', label: { en: 'Energy (EV charging) invoice', tr: 'Enerji faturası' } },
  {
    code: 'ILAC_TIBBICIHAZ',
    label: { en: 'Medicine and medical device invoice', tr: 'İlaç ve tıbbi cihaz faturası' },
  },
  { code: 'YATIRIMTESVIK', label: { en: 'Investment incentive invoice', tr: 'Yatırım teşvik faturası' } },
  { code: 'OZELFATURA', label: { en: 'Special invoice', tr: 'Özel fatura' } },
  {
    code: 'IDIS',
    label: { en: 'Iron monitoring system invoice', tr: 'İnşaat demiri izleme sistemi faturası' },
  },
] as const;
/** Verified invoice profiles; see CODE_LISTS_VERIFIED.
 * @example
 * PROFILES.get("TEMELFATURA");
 */
export const PROFILES: ReadonlyMap<string, CodeInfo> = new Map(entries.map((entry) => [entry.code, entry]));
