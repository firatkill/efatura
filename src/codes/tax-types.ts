import type { TaxTypeInfo } from '../types';

const entries = [
  {
    code: '0003',
    short: 'GV STOPAJI',
    kind: 'STOPAJ',
    label: { en: 'Income tax withholding', tr: 'Gelir Vergisi Stopajı' },
  },
  {
    code: '0011',
    short: 'KV STOPAJI',
    kind: 'STOPAJ',
    label: { en: 'Corporate tax withholding', tr: 'Kurumlar Vergisi Stopajı' },
  },
  {
    code: '0015',
    short: 'KDV GERCEK',
    kind: 'KDV',
    label: { en: 'Value-added tax under the actual method', tr: 'Gerçek Usulde Katma Değer Vergisi' },
  },
  {
    code: '0021',
    short: 'BMV',
    kind: 'OTHER',
    label: { en: 'Banking transactions tax', tr: 'Banka Muameleleri Vergisi' },
  },
  {
    code: '0022',
    short: 'SMV',
    kind: 'OTHER',
    label: { en: 'Insurance transactions tax', tr: 'Sigorta Muameleleri Vergisi' },
  },
  {
    code: '0059',
    short: 'KONAKLAMA V.',
    kind: 'KONAKLAMA',
    label: { en: 'Accommodation tax', tr: 'KONAKLAMA VERGİSİ' },
  },
  {
    code: '0061',
    short: 'KKDF KESİNTİ',
    kind: 'OTHER',
    label: {
      en: 'Resource utilisation support fund deduction',
      tr: 'Kaynak Kullanımı Destekleme Fonu Kesintisi',
    },
  },
  {
    code: '0071',
    short: 'ÖTV 1.LİSTE',
    kind: 'OTV',
    label: {
      en: 'Special consumption tax on petroleum and natural gas products',
      tr: 'Petrol Ve Doğalgaz Ürünlerine İlişkin Özel Tüketim Vergisi',
    },
  },
  {
    code: '0073',
    short: 'ÖTV 3.LİSTE',
    kind: 'OTV',
    label: {
      en: 'Special consumption tax on cola, alcoholic beverages and tobacco products',
      tr: 'Kolalı Gazoz, Alkollü İçeçekler Ve Tütün Mamüllerine İlişkin Özel Tüketim Vergisi',
    },
  },
  {
    code: '0074',
    short: 'ÖTV 4.LİSTE',
    kind: 'OTV',
    label: {
      en: 'Special consumption tax on durable consumer and other goods',
      tr: 'Dayanıklı Tüketim Ve Diğer Mallara İlişkin Özel Tüketim Vergisi',
    },
  },
  {
    code: '0075',
    short: 'ÖTV 3A LİSTE',
    kind: 'OTV',
    label: {
      en: 'Special consumption tax on alcoholic beverages',
      tr: 'Alkollü İçeçeklere İlişkin Özel Tüketim Vergisi',
    },
  },
  {
    code: '0076',
    short: 'ÖTV 3B LİSTE',
    kind: 'OTV',
    label: {
      en: 'Special consumption tax on tobacco products',
      tr: 'Tütün Mamüllerine İlişkin Özel Tüketim Vergisi',
    },
  },
  {
    code: '0077',
    short: 'ÖTV 3C LİSTE',
    kind: 'OTV',
    label: { en: 'Special consumption tax on cola', tr: 'Kolalı Gazozlara İlişkin Özel Tüketim Vergisi' },
  },
  { code: '1047', short: 'DAMGA V', kind: 'DAMGA', label: { en: 'Stamp duty', tr: 'Damga Vergisi' } },
  {
    code: '1048',
    short: '5035SKDAMGAV',
    kind: 'DAMGA',
    label: { en: 'Stamp duty under Law 5035', tr: '5035 Sayılı Kanuna Göre Damga Vergisi' },
  },
  {
    code: '4071',
    short: 'ELK.HAVAGAZ.TÜK.VER.',
    kind: 'OTHER',
    label: { en: 'Electricity and town gas consumption tax', tr: 'Elektrik Ve Havagazi Tüketim Vergisi' },
  },
  {
    code: '4080',
    short: 'Ö.İLETİŞİM V',
    kind: 'OIV',
    label: { en: 'Special communication tax', tr: 'Özel İletişim Vergisi' },
  },
  {
    code: '4081',
    short: '5035ÖZİLETV.',
    kind: 'OIV',
    label: {
      en: 'Special communication tax under Law 5035',
      tr: '5035 Sayılı Kanuna Göre Özel İletişim Vergisi',
    },
  },
  {
    code: '4171',
    short: 'PTR-DGZ ÖTV TEVKİFAT',
    kind: 'OTV',
    label: {
      en: 'SCT withholding on petroleum and natural gas products',
      tr: 'Petrol Ve Doğalgaz Ürünlerine İlişkin Ötv Tevkifatı',
    },
  },
  {
    code: '8001',
    short: 'BORSA TES.ÜC.',
    kind: 'OTHER',
    label: { en: 'Commodity exchange registration fee', tr: 'Borsa Tescil Ücreti' },
  },
  { code: '8002', short: 'ENERJİ FONU', kind: 'OTHER', label: { en: 'Energy fund', tr: 'Enerji Fonu' } },
  { code: '8004', short: 'TRT PAYI', kind: 'OTHER', label: { en: 'TRT share', tr: 'Trt Payı' } },
  {
    code: '8005',
    short: 'ELK.TÜK.VER.',
    kind: 'OTHER',
    label: { en: 'Electricity consumption tax', tr: 'Elektrik Tüketim Vergisi' },
  },
  {
    code: '8006',
    short: 'TK KULLANIM',
    kind: 'OTHER',
    label: { en: 'Radio usage fee', tr: 'Telsiz Kullanım Ücreti' },
  },
  {
    code: '8007',
    short: 'TK RUHSAT',
    kind: 'OTHER',
    label: { en: 'Radio licence fee', tr: 'Telsiz Ruhsat Ücreti' },
  },
  {
    code: '8008',
    short: 'ÇEV. TEM .VER.',
    kind: 'OTHER',
    label: { en: 'Environmental cleaning tax', tr: 'Çevre Temizlik Vergisi' },
  },
  {
    code: '9015',
    short: 'KDV TEVKİFAT',
    kind: 'KDV_WITHHOLDING',
    label: {
      en: 'VAT withholding (without taxpayer registration)',
      tr: 'KATMA DEĞER VERGİSİ TEVKİFATI (MÜKELLEFİYETSİZ)',
    },
  },
  {
    code: '9021',
    short: '4961BANKASMV',
    kind: 'OTHER',
    label: {
      en: 'Banking and insurance transactions tax under Law 4961',
      tr: '4961 Banka Sigorta Muameleleri Vergisi',
    },
  },
  { code: '9040', short: 'MERA FONU', kind: 'OTHER', label: { en: 'Pasture fund', tr: 'Mera Fonu' } },
  {
    code: '9077',
    short: 'ÖTV 2.LİSTE',
    kind: 'OTV',
    label: {
      en: 'Special consumption tax on motor vehicles subject to registration',
      tr: 'Motorlu Taşıt Araçlarına İlişkin Özel Tüketim Vergisi (Tescile Tabi Olanlar)',
    },
  },
  {
    code: '9944',
    short: 'BEL.ÖD.HAL RÜSUM',
    kind: 'OTHER',
    label: { en: 'Municipal wholesale market fee', tr: 'Belediyelere Ödenen Hal Rüsumu' },
  },
] as const;
/** Verified tax types; 0059/9015 short labels are owner-approved project abbreviations (D-60).
 * @example
 * TAX_TYPES.get("0003");
 */
export const TAX_TYPES: ReadonlyMap<string, TaxTypeInfo> = new Map(
  entries.map((entry) => [entry.code, entry]),
);
