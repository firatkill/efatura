// T-06 subset of SIX ISO 4217 List One, published 2026-09-17; completed in T-10.
const entries = [
  { code: 'TRY', minorUnits: 2, label: { en: 'Turkish Lira', tr: 'Türk lirası' } },
  { code: 'USD', minorUnits: 2, label: { en: 'US Dollar', tr: 'ABD doları' } },
  { code: 'EUR', minorUnits: 2, label: { en: 'Euro', tr: 'Euro' } },
  { code: 'GBP', minorUnits: 2, label: { en: 'Pound Sterling', tr: 'İngiliz sterlini' } },
  { code: 'CHF', minorUnits: 2, label: { en: 'Swiss Franc', tr: 'İsviçre frangı' } },
  { code: 'JPY', minorUnits: 0, label: { en: 'Yen', tr: 'Japon yeni' } },
  { code: 'KWD', minorUnits: 3, label: { en: 'Kuwaiti Dinar', tr: 'Kuveyt dinarı' } },
  { code: 'XAU', minorUnits: null, label: { en: 'Gold', tr: 'Gold' } },
] as const;
/** ISO 4217 currency definitions, initially the T-06 arithmetic subset.
 * @example
 * CURRENCIES.get('JPY')?.minorUnits; // 0
 */
export const CURRENCIES: ReadonlyMap<
  string,
  {
    readonly code: string;
    readonly minorUnits: number | null;
    readonly label: { readonly en: string; readonly tr: string };
  }
> = new Map(entries.map((entry) => [entry.code, entry]));
