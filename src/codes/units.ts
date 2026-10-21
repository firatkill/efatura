import type { UnitInfo } from '../types';

const entries = [
  { code: 'C62', label: { en: 'one', tr: 'adet' } },
  { code: 'NIU', label: { en: 'number of international units', tr: 'adet' } },
  { code: 'EA', label: { en: 'each', tr: 'adet' } },
  { code: 'PA', label: { en: 'packet', tr: 'paket' } },
  { code: 'BX', label: { en: 'box', tr: 'kutu' } },
  { code: 'SET', label: { en: 'set', tr: 'set' } },
  { code: 'PR', label: { en: 'pair', tr: 'çift' } },
  { code: 'KGM', label: { en: 'kilogram', tr: 'kilogram' } },
  { code: 'GRM', label: { en: 'gram', tr: 'gram' } },
  { code: 'MGM', label: { en: 'milligram', tr: 'miligram' } },
  { code: 'TNE', label: { en: 'tonne (metric ton)', tr: 'ton' } },
  { code: 'LTR', label: { en: 'litre', tr: 'litre' } },
  { code: 'MLT', label: { en: 'millilitre', tr: 'mililitre' } },
  { code: 'MTQ', label: { en: 'cubic metre', tr: 'metreküp' } },
  { code: 'MTK', label: { en: 'square metre', tr: 'metrekare' } },
  { code: 'MTR', label: { en: 'metre', tr: 'metre' } },
  { code: 'CMT', label: { en: 'centimetre', tr: 'santimetre' } },
  { code: 'MMT', label: { en: 'millimetre', tr: 'milimetre' } },
  { code: 'KMT', label: { en: 'kilometre', tr: 'kilometre' } },
  { code: 'HUR', label: { en: 'hour', tr: 'saat' } },
  { code: 'MIN', label: { en: 'minute [unit of time]', tr: 'dakika' } },
  { code: 'DAY', label: { en: 'day', tr: 'gün' } },
  { code: 'WEE', label: { en: 'week', tr: 'hafta' } },
  { code: 'MON', label: { en: 'month', tr: 'ay' } },
  { code: 'ANN', label: { en: 'year', tr: 'yıl' } },
  { code: 'KWH', label: { en: 'kilowatt hour', tr: 'kilovatsaat' } },
  { code: 'MWH', label: { en: 'megawatt hour (1000 kW.h)', tr: 'megavatsaat' } },
  { code: 'KWT', label: { en: 'kilowatt', tr: 'kilovat' } },
] as const;
/** Verified GİB unit subset with UN/ECE Rec. 20 English labels.
 * @example
 * UNIT_CODES.get("C62");
 */
export const UNIT_CODES: ReadonlyMap<string, UnitInfo> = new Map(entries.map((entry) => [entry.code, entry]));
