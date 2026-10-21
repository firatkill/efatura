/** Active ISO 4217 membership without loading display labels.
 * @example
 * CURRENCY_CODES.includes("TRY");
 */
export const CURRENCY_CODES: readonly string[] =
  /* @__PURE__ */ 'AED,AFN,ALL,AMD,AOA,ARS,AUD,AWG,AZN,BAM,BBD,BDT,BHD,BIF,BMD,BND,BOB,BOV,BRL,BSD,BTN,BWP,BYN,BZD,CAD,CDF,CHE,CHF,CHW,CLF,CLP,CNY,COP,COU,CRC,CUP,CVE,CZK,DJF,DKK,DOP,DZD,EGP,ERN,ETB,EUR,FJD,FKP,GBP,GEL,GHS,GIP,GMD,GNF,GTQ,GYD,HKD,HNL,HTG,HUF,IDR,ILS,INR,IQD,IRR,ISK,JMD,JOD,JPY,KES,KGS,KHR,KMF,KPW,KRW,KWD,KYD,KZT,LAK,LBP,LKR,LRD,LSL,LYD,MAD,MDL,MGA,MKD,MMK,MNT,MOP,MRU,MUR,MVR,MWK,MXN,MXV,MYR,MZN,NAD,NGN,NIO,NOK,NPR,NZD,OMR,PAB,PEN,PGK,PHP,PKR,PLN,PYG,QAR,RON,RSD,RUB,RWF,SAR,SBD,SCR,SDG,SEK,SGD,SHP,SLE,SOS,SRD,SSP,STN,SVC,SYP,SZL,THB,TJS,TMT,TND,TOP,TRY,TTD,TWD,TZS,UAH,UGX,USD,USN,UYI,UYU,UYW,UZS,VED,VES,VND,VUV,WST,XAD,XAF,XAG,XAU,XBA,XBB,XBC,XBD,XCD,XCG,XDR,XOF,XPD,XPF,XPT,XSU,XTS,XUA,XXX,YER,ZAR,ZMW,ZWG'.split(
    ',',
  );

// Fixed columns: minorUnits, en, tr; aligned with CURRENCY_CODES. Empty minorUnits means null.
// Delimited literals keep the complete verified labels within the core size budget.
const entries = /* @__PURE__ */ `2|UAE Dirham|Birleşik Arap Emirlikleri dirhemi
2|Afghani|Afghani
2|Lek|Lek
2|Armenian Dram|Armenian Dram
2|Kwanza|Kwanza
2|Argentine Peso|Argentine Peso
2|Australian Dollar|Australian Dollar
2|Aruban Florin|Aruban Florin
2|Azerbaijan Manat|Azerbaycan manatı
2|Convertible Mark|Convertible Mark
2|Barbados Dollar|Barbados Dollar
2|Taka|Taka
3|Bahraini Dinar|Bahraini Dinar
0|Burundi Franc|Burundi Franc
2|Bermudian Dollar|Bermudian Dollar
2|Brunei Dollar|Brunei Dollar
2|Boliviano|Boliviano
2|Mvdol|Mvdol
2|Brazilian Real|Brazilian Real
2|Bahamian Dollar|Bahamian Dollar
2|Ngultrum|Ngultrum
2|Pula|Pula
2|Belarusian Ruble|Belarusian Ruble
2|Belize Dollar|Belize Dollar
2|Canadian Dollar|Canadian Dollar
2|Congolese Franc|Congolese Franc
2|WIR Euro|WIR Euro
2|Swiss Franc|İsviçre frangı
2|WIR Franc|WIR Franc
4|Unidad de Fomento|Unidad de Fomento
0|Chilean Peso|Chilean Peso
2|Yuan Renminbi|Çin yuanı
2|Colombian Peso|Colombian Peso
2|Unidad de Valor Real|Unidad de Valor Real
2|Costa Rican Colon|Costa Rican Colon
2|Cuban Peso|Cuban Peso
2|Cabo Verde Escudo|Cabo Verde Escudo
2|Czech Koruna|Czech Koruna
0|Djibouti Franc|Djibouti Franc
2|Danish Krone|Danish Krone
2|Dominican Peso|Dominican Peso
2|Algerian Dinar|Algerian Dinar
2|Egyptian Pound|Egyptian Pound
2|Nakfa|Nakfa
2|Ethiopian Birr|Ethiopian Birr
2|Euro|Euro
2|Fiji Dollar|Fiji Dollar
2|Falkland Islands Pound|Falkland Islands Pound
2|Pound Sterling|İngiliz sterlini
2|Lari|Lari
2|Ghana Cedi|Ghana Cedi
2|Gibraltar Pound|Gibraltar Pound
2|Dalasi|Dalasi
0|Guinean Franc|Guinean Franc
2|Quetzal|Quetzal
2|Guyana Dollar|Guyana Dollar
2|Hong Kong Dollar|Hong Kong Dollar
2|Lempira|Lempira
2|Gourde|Gourde
2|Forint|Forint
2|Rupiah|Rupiah
2|New Israeli Sheqel|New Israeli Sheqel
2|Indian Rupee|Indian Rupee
3|Iraqi Dinar|Iraqi Dinar
2|Iranian Rial|Iranian Rial
0|Iceland Krona|Iceland Krona
2|Jamaican Dollar|Jamaican Dollar
3|Jordanian Dinar|Jordanian Dinar
0|Yen|Japon yeni
2|Kenyan Shilling|Kenyan Shilling
2|Som|Som
2|Riel|Riel
0|Comorian Franc |Comorian Franc\u0020
2|North Korean Won|North Korean Won
0|Won|Won
3|Kuwaiti Dinar|Kuveyt dinarı
2|Cayman Islands Dollar|Cayman Islands Dollar
2|Tenge|Tenge
2|Lao Kip|Lao Kip
2|Lebanese Pound|Lebanese Pound
2|Sri Lanka Rupee|Sri Lanka Rupee
2|Liberian Dollar|Liberian Dollar
2|Loti|Loti
3|Libyan Dinar|Libyan Dinar
2|Moroccan Dirham|Moroccan Dirham
2|Moldovan Leu|Moldovan Leu
2|Malagasy Ariary|Malagasy Ariary
2|Denar|Denar
2|Kyat|Kyat
2|Tugrik|Tugrik
2|Pataca|Pataca
2|Ouguiya|Ouguiya
2|Mauritius Rupee|Mauritius Rupee
2|Rufiyaa|Rufiyaa
2|Malawi Kwacha|Malawi Kwacha
2|Mexican Peso|Mexican Peso
2|Mexican Unidad de Inversion (UDI)|Mexican Unidad de Inversion (UDI)
2|Malaysian Ringgit|Malaysian Ringgit
2|Mozambique Metical|Mozambique Metical
2|Namibia Dollar|Namibia Dollar
2|Naira|Naira
2|Cordoba Oro|Cordoba Oro
2|Norwegian Krone|Norwegian Krone
2|Nepalese Rupee|Nepalese Rupee
2|New Zealand Dollar|New Zealand Dollar
3|Rial Omani|Rial Omani
2|Balboa|Balboa
2|Sol|Sol
2|Kina|Kina
2|Philippine Peso|Philippine Peso
2|Pakistan Rupee|Pakistan Rupee
2|Zloty|Zloty
0|Guarani|Guarani
2|Qatari Rial|Qatari Rial
2|Romanian Leu|Romanian Leu
2|Serbian Dinar|Serbian Dinar
2|Russian Ruble|Rus rublesi
0|Rwanda Franc|Rwanda Franc
2|Saudi Riyal|Suudi Arabistan riyali
2|Solomon Islands Dollar|Solomon Islands Dollar
2|Seychelles Rupee|Seychelles Rupee
2|Sudanese Pound|Sudanese Pound
2|Swedish Krona|Swedish Krona
2|Singapore Dollar|Singapore Dollar
2|Saint Helena Pound|Saint Helena Pound
2|Leone|Leone
2|Somali Shilling|Somali Shilling
2|Surinam Dollar|Surinam Dollar
2|South Sudanese Pound|South Sudanese Pound
2|Dobra|Dobra
2|El Salvador Colon|El Salvador Colon
2|Syrian Pound|Syrian Pound
2|Lilangeni|Lilangeni
2|Baht|Baht
2|Somoni|Somoni
2|Turkmenistan New Manat|Turkmenistan New Manat
3|Tunisian Dinar|Tunisian Dinar
2|Pa’anga|Pa’anga
2|Turkish Lira|Türk lirası
2|Trinidad and Tobago Dollar|Trinidad and Tobago Dollar
2|New Taiwan Dollar|New Taiwan Dollar
2|Tanzanian Shilling|Tanzanian Shilling
2|Hryvnia|Hryvnia
0|Uganda Shilling|Uganda Shilling
2|US Dollar|ABD doları
2|US Dollar (Next day)|US Dollar (Next day)
0|Uruguay Peso en Unidades Indexadas (UI)|Uruguay Peso en Unidades Indexadas (UI)
2|Peso Uruguayo|Peso Uruguayo
4|Unidad Previsional|Unidad Previsional
2|Uzbekistan Sum|Uzbekistan Sum
2|Bolívar Soberano|Bolívar Soberano
2|Bolívar Soberano|Bolívar Soberano
0|Dong|Dong
0|Vatu|Vatu
2|Tala|Tala
2|Arab Accounting Dinar|Arab Accounting Dinar
0|CFA Franc BEAC|CFA Franc BEAC
|Silver|Silver
|Gold|Gold
|Bond Markets Unit European Composite Unit (EURCO)|Bond Markets Unit European Composite Unit (EURCO)
|Bond Markets Unit European Monetary Unit (E.M.U.-6)|Bond Markets Unit European Monetary Unit (E.M.U.-6)
|Bond Markets Unit European Unit of Account 9 (E.U.A.-9)|Bond Markets Unit European Unit of Account 9 (E.U.A.-9)
|Bond Markets Unit European Unit of Account 17 (E.U.A.-17)|Bond Markets Unit European Unit of Account 17 (E.U.A.-17)
2|East Caribbean Dollar|East Caribbean Dollar
2|Caribbean Guilder|Caribbean Guilder
|SDR (Special Drawing Right)|SDR (Special Drawing Right)
0|CFA Franc BCEAO|CFA Franc BCEAO
|Palladium|Palladium
0|CFP Franc|CFP Franc
|Platinum|Platinum
|Sucre|Sucre
|Codes specifically reserved for testing purposes|Codes specifically reserved for testing purposes
|ADB Unit of Account|ADB Unit of Account
|The codes assigned for transactions where no currency is involved|The codes assigned for transactions where no currency is involved
2|Yemeni Rial|Yemeni Rial
2|Rand|Rand
2|Zambian Kwacha|Zambian Kwacha
2|Zimbabwe Gold|Zimbabwe Gold`.split('\n');
/** Active ISO 4217 currency definitions from SIX List One (2026-09-17).
 * @example
 * CURRENCIES.get("AED");
 */
export const CURRENCIES: ReadonlyMap<
  string,
  {
    readonly code: string;
    readonly minorUnits: number | null;
    readonly label: { readonly en: string; readonly tr: string };
  }
> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ CURRENCY_CODES.map((code, index) => {
    // The checked-in table above has exactly these columns on every row.
    const [digits, en, tr] = (entries[index] ?? '').split('|') as [string, string, string];
    return [
      code,
      { code, minorUnits: digits === '' ? null : Number.parseInt(digits, 10), label: { en, tr } },
    ];
  }),
);
