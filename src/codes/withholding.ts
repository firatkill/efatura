import type { TaxTypeInfo } from '../types';

const entries = [
  {
    code: '601',
    short: '601',
    label: {
      en: 'Construction and related engineering, architecture and survey-project services',
      tr: 'Yapim İşleri İle Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlik Ve Etüt-Proje Hizmetleri',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '602',
    short: '602',
    label: {
      en: 'Survey, planning, consultancy, audit and similar services',
      tr: 'Etüt, Plan-Proje, Danişmanlik, Denetim Ve Benzeri Hizmetler',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '603',
    short: '603',
    label: {
      en: 'Machinery, equipment, fixture and vehicle repair and maintenance',
      tr: 'Makine, Teçhizat, Demirbaş Ve Taşitlara Ait Tadil, Bakim Ve Onarim Hizmetleri',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '604',
    short: '604',
    label: { en: 'Catering services', tr: 'Yemek Servis Hizmeti' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '605',
    short: '605',
    label: { en: 'Event organisation services', tr: 'Organizasyon Hizmeti' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '606',
    short: '606',
    label: { en: 'Labour supply services', tr: 'İşgücü Temin Hizmetleri' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '607',
    short: '607',
    label: { en: 'Private security services', tr: 'Özel Güvenlik Hizmeti' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '608',
    short: '608',
    label: { en: 'Building inspection services', tr: 'Yapi Denetim Hizmetleri' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '609',
    short: '609',
    label: {
      en: 'Contract textile, clothing, bag and shoe manufacturing and intermediary services',
      tr: 'Fason Olarak Yaptirilan Tekstil Ve Konfeksiyon İşleri, Çanta Ve Ayakkabi Dikim İşleri Ve Bu İşlere Aracilik Hizmetleri',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '610',
    short: '610',
    label: {
      en: 'Customer referral services for tourist shops',
      tr: 'Turistik Mağazalara Verilen Müşteri Bulma / Götürme Hizmetleri',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '611',
    short: '611',
    label: {
      en: 'Sports club broadcasting, advertising and naming-rights transactions',
      tr: 'Spor Kulüplerinin Yayin, Reklâm Ve İsim Hakki Gelirlerine Konu İşlemleri',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '612',
    short: '612',
    label: { en: 'Cleaning services', tr: 'Temizlik Hizmeti' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '613',
    short: '613',
    label: { en: 'Environment and garden maintenance', tr: 'Çevre Ve Bahçe Bakim Hizmetleri' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '614',
    short: '614',
    label: { en: 'Shuttle transport services', tr: 'Servis Taşimaciliği Hizmeti' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '615',
    short: '615',
    label: { en: 'Printing services', tr: 'Her Türlü Baski Ve Basim Hizmetleri' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '616',
    short: '616',
    label: { en: 'Other services', tr: 'Diğer Hizmetler [Kdvgut-(I/C-2.1.3.2.13)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '617',
    short: '617',
    label: { en: 'Ingots produced from scrap metal', tr: 'Hurda Metalden Elde Edilen Külçe Teslimleri' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '618',
    short: '618',
    label: {
      en: 'Copper, zinc, iron, steel, aluminium and lead ingots not produced from scrap metal',
      tr: 'Hurda Metalden Elde Edilenler Dişindaki Bakir, Çinko Demir ; Çelik Alüminyum Ve Kurşun Külçe Teslimleri [Kdvgut-(I/C- 2.1.3.3.1)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '619',
    short: '619',
    label: {
      en: 'Copper, zinc and aluminium product deliveries',
      tr: 'Bakir, Çinko Ve Alüminyum Ürünlerinin Teslimi',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '620',
    short: '620',
    label: {
      en: 'Scrap and waste deliveries by those waiving exemption',
      tr: 'İstisnadan Vazgeçenlerin Hurda Ve Atik Teslimi',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '621',
    short: '621',
    label: {
      en: 'Raw materials from metal, plastic, tyre, rubber, paper and glass waste',
      tr: 'Metal, Plastik, Lastik, Kauçuk, Kâğit Ve Cam Hurda Ve Atiklardan Elde Edilen Hammadde Teslimi',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '622',
    short: '622',
    label: {
      en: 'Cotton, mohair, wool, fleece, raw hide and leather deliveries',
      tr: 'Pamuk, Tiftik, Yün Ve Yapaği İle Ham Post Ve Deri Teslimleri',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '623',
    short: '623',
    label: { en: 'Wood and forest product deliveries', tr: 'Ağaç Ve Orman Ürünleri Teslimi' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '624',
    short: '624',
    label: { en: 'Freight transport services', tr: 'Yük Taşimaciliği Hizmeti [Kdvgut-(I/C-2.1.3.2.11)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '625',
    short: '625',
    label: {
      en: 'Commercial advertising services',
      tr: 'Ticari Reklam Hizmetleri [Kdvgut-(I/C-2.1.3.2.15)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '626',
    short: '626',
    label: { en: 'Other deliveries', tr: 'Diğer Teslimler [Kdvgut-(I/C-2.1.3.3.7.)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '627',
    short: '627',
    label: {
      en: 'Iron and steel product deliveries',
      tr: 'Demir-Çelik Ürünlerinin Teslimi [Kdvgut-(I/C-2.1.3.3.8)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '801',
    short: '801',
    label: {
      en: 'Construction and related engineering, architecture and survey-project services',
      tr: 'Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlık ve Etüt-Proje Hizmetleri[KDVGUT-(I/C-2.1.3.2.1)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '802',
    short: '802',
    label: {
      en: 'Survey, planning, consultancy, audit and similar services',
      tr: 'Etüt, Plan-Proje, Danışmanlık, Denetim ve Benzeri Hizmetler[KDVGUT-(I/C-2.1.3.2.2)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '803',
    short: '803',
    label: {
      en: 'Machinery, equipment, fixture and vehicle repair and maintenance',
      tr: 'Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım Hizmetleri[KDVGUT- (I/C-2.1.3.2.3)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '804',
    short: '804',
    label: { en: 'Catering services', tr: 'Yemek Servis Hizmeti[KDVGUT-(I/C-2.1.3.2.4)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '805',
    short: '805',
    label: { en: 'Event organisation services', tr: 'Organizasyon Hizmeti[KDVGUT-(I/C-2.1.3.2.4)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '806',
    short: '806',
    label: { en: 'Labour supply services', tr: 'İşgücü Temin Hizmetleri[KDVGUT-(I/C-2.1.3.2.5)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '807',
    short: '807',
    label: { en: 'Private security services', tr: 'Özel Güvenlik Hizmeti[KDVGUT-(I/C-2.1.3.2.5)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '808',
    short: '808',
    label: { en: 'Building inspection services', tr: 'Yapı Denetim Hizmetleri[KDVGUT-(I/C-2.1.3.2.6)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '809',
    short: '809',
    label: {
      en: 'Contract textile, clothing, bag and shoe manufacturing and intermediary services',
      tr: 'Fason Olarak Yaptırılan Tekstil ve Konfeksiyon İşleri, Çanta ve Ayakkabı Dikim İşleri ve Bu İşlere Aracılık Hizmetleri[KDVGUT- (I/C-2.1.3.2.7)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '810',
    short: '810',
    label: {
      en: 'Customer referral services for tourist shops',
      tr: 'Turistik Mağazalara Verilen Müşteri Bulma/ Götürme Hizmetleri[KDVGUT-(I/C-2.1.3.2.8)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '811',
    short: '811',
    label: {
      en: 'Sports club broadcasting, advertising and naming-rights transactions',
      tr: 'Spor Kulüplerinin Yayın, Reklâm ve İsim Hakkı Gelirlerine Konu İşlemleri[KDVGUT-(I/C-2.1.3.2.9)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '812',
    short: '812',
    label: { en: 'Cleaning services', tr: 'Temizlik Hizmeti[KDVGUT-(I/C-2.1.3.2.10)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '813',
    short: '813',
    label: {
      en: 'Environment and garden maintenance',
      tr: 'Çevre ve Bahçe Bakım Hizmetleri[KDVGUT-(I/C-2.1.3.2.10)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '814',
    short: '814',
    label: { en: 'Shuttle transport services', tr: 'Servis Taşımacılığı Hizmeti[KDVGUT-(I/C-2.1.3.2.11)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '815',
    short: '815',
    label: { en: 'Printing services', tr: 'Her Türlü Baskı ve Basım Hizmetleri[KDVGUT-(I/C-2.1.3.2.12)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '816',
    short: '816',
    label: {
      en: 'Ingots produced from scrap metal',
      tr: 'Hurda Metalden Elde Edilen Külçe Teslimleri[KDVGUT-(I/C- 2.1.3.3.1)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '817',
    short: '817',
    label: {
      en: 'Copper, zinc, iron, steel, aluminium and lead ingots not produced from scrap metal',
      tr: 'Hurda Metalden Elde Edilenler Dışındaki Bakır, Çinko, Demir Çelik, Alüminyum ve Kurşun Külçe Teslimi [KDVGUT-(I/C- 2.1.3.3.1)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '818',
    short: '818',
    label: {
      en: 'Copper, zinc, aluminium and lead product deliveries',
      tr: 'Bakır, Çinko, Alüminyum ve Kurşun Ürünlerinin Teslimi[KDVGUT- (I/C-2.1.3.3.2)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '819',
    short: '819',
    label: {
      en: 'Scrap and waste deliveries by those waiving exemption',
      tr: 'İstisnadan Vazgeçenlerin Hurda ve Atık Teslimi[KDVGUT-(I/C- 2.1.3.3.3)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '820',
    short: '820',
    label: {
      en: 'Raw materials from metal, plastic, tyre, rubber, paper and glass waste',
      tr: 'Metal, Plastik, Lastik, Kauçuk, Kâğıt ve Cam Hurda ve Atıklardan Elde Edilen Hammadde Teslimi[KDVGUT-(I/C-2.1.3.3.4)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '821',
    short: '821',
    label: {
      en: 'Cotton, mohair, wool, fleece, raw hide and leather deliveries',
      tr: 'Pamuk, Tiftik, Yün ve Yapağı İle Ham Post ve Deri Teslimleri[KDVGUT-(I/C-2.1.3.3.5)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '822',
    short: '822',
    label: {
      en: 'Wood and forest product deliveries',
      tr: 'Ağaç ve Orman Ürünleri Teslimi[KDVGUT-(I/C-2.1.3.3.6)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '823',
    short: '823',
    label: { en: 'Freight transport services', tr: 'Yük Taşımacılığı Hizmeti [KDVGUT-(I/C-2.1.3.2.11)]' },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '824',
    short: '824',
    label: {
      en: 'Commercial advertising services',
      tr: 'Ticari Reklam Hizmetleri [KDVGUT-(I/C-2.1.3.2.15)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
  {
    code: '825',
    short: '825',
    label: {
      en: 'Iron and steel product deliveries',
      tr: 'Demir-Çelik Ürünlerinin Teslimi [KDVGUT-(I/C-2.1.3.3.8)]',
    },
    kind: 'KDV_WITHHOLDING',
  },
] as const;
/** Verified withholding categories; rates are read from the invoice.
 * @example
 * WITHHOLDING_CODES.get("601");
 */
export const WITHHOLDING_CODES: ReadonlyMap<string, TaxTypeInfo> = new Map(
  entries.map((entry) => [entry.code, entry]),
);
