import type { UnitInfo } from '../types';

// Fixed columns: code, en, tr.
// Delimited literals keep the complete verified labels within the core size budget.
const entries = `C62|one|adet
NIU|number of international units|adet
EA|each|adet
PA|packet|paket
BX|box|kutu
SET|set|set
PR|pair|çift
KGM|kilogram|kilogram
GRM|gram|gram
MGM|milligram|miligram
TNE|tonne (metric ton)|ton
LTR|litre|litre
MLT|millilitre|mililitre
MTQ|cubic metre|metreküp
MTK|square metre|metrekare
MTR|metre|metre
CMT|centimetre|santimetre
MMT|millimetre|milimetre
KMT|kilometre|kilometre
HUR|hour|saat
MIN|minute [unit of time]|dakika
DAY|day|gün
WEE|week|hafta
MON|month|ay
ANN|year|yıl
KWH|kilowatt hour|kilovatsaat
MWH|megawatt hour (1000\u00a0kW.h)|megavatsaat
KWT|kilowatt|kilovat`;
/** Verified GİB unit subset with UN/ECE Rec. 20 English labels.
 * @example
 * UNIT_CODES.get("C62");
 */
export const UNIT_CODES: ReadonlyMap<string, UnitInfo> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ entries.split('\n').map((row) => {
    // The checked-in table above has exactly these columns on every row.
    const [code, en, tr] = row.split('|') as [string, string, string];
    return [code, { code, label: { en, tr } }];
  }),
);
