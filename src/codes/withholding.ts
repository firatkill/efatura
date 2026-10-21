import type { TaxTypeInfo } from '../types';

// Fixed columns: code, short, en, tr, kind.
// Delimited literals keep the complete verified labels within the core size budget.
const entries = `601|601|Construction and related engineering, architecture and survey-project services|Yapim İşleri İle Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlik Ve Etüt-Proje Hizmetleri|KDV_WITHHOLDING
602|602|Survey, planning, consultancy, audit and similar services|Etüt, Plan-Proje, Danişmanlik, Denetim Ve Benzeri Hizmetler|KDV_WITHHOLDING
603|603|Machinery, equipment, fixture and vehicle repair and maintenance|Makine, Teçhizat, Demirbaş Ve Taşitlara Ait Tadil, Bakim Ve Onarim Hizmetleri|KDV_WITHHOLDING
604|604|Catering services|Yemek Servis Hizmeti|KDV_WITHHOLDING
605|605|Event organisation services|Organizasyon Hizmeti|KDV_WITHHOLDING
606|606|Labour supply services|İşgücü Temin Hizmetleri|KDV_WITHHOLDING
607|607|Private security services|Özel Güvenlik Hizmeti|KDV_WITHHOLDING
608|608|Building inspection services|Yapi Denetim Hizmetleri|KDV_WITHHOLDING
609|609|Contract textile, clothing, bag and shoe manufacturing and intermediary services|Fason Olarak Yaptirilan Tekstil Ve Konfeksiyon İşleri, Çanta Ve Ayakkabi Dikim İşleri Ve Bu İşlere Aracilik Hizmetleri|KDV_WITHHOLDING
610|610|Customer referral services for tourist shops|Turistik Mağazalara Verilen Müşteri Bulma / Götürme Hizmetleri|KDV_WITHHOLDING
611|611|Sports club broadcasting, advertising and naming-rights transactions|Spor Kulüplerinin Yayin, Reklâm Ve İsim Hakki Gelirlerine Konu İşlemleri|KDV_WITHHOLDING
612|612|Cleaning services|Temizlik Hizmeti|KDV_WITHHOLDING
613|613|Environment and garden maintenance|Çevre Ve Bahçe Bakim Hizmetleri|KDV_WITHHOLDING
614|614|Shuttle transport services|Servis Taşimaciliği Hizmeti|KDV_WITHHOLDING
615|615|Printing services|Her Türlü Baski Ve Basim Hizmetleri|KDV_WITHHOLDING
616|616|Other services|Diğer Hizmetler [Kdvgut-(I/C-2.1.3.2.13)]|KDV_WITHHOLDING
617|617|Ingots produced from scrap metal|Hurda Metalden Elde Edilen Külçe Teslimleri|KDV_WITHHOLDING
618|618|Copper, zinc, iron, steel, aluminium and lead ingots not produced from scrap metal|Hurda Metalden Elde Edilenler Dişindaki Bakir, Çinko Demir ; Çelik Alüminyum Ve Kurşun Külçe Teslimleri [Kdvgut-(I/C- 2.1.3.3.1)]|KDV_WITHHOLDING
619|619|Copper, zinc and aluminium product deliveries|Bakir, Çinko Ve Alüminyum Ürünlerinin Teslimi|KDV_WITHHOLDING
620|620|Scrap and waste deliveries by those waiving exemption|İstisnadan Vazgeçenlerin Hurda Ve Atik Teslimi|KDV_WITHHOLDING
621|621|Raw materials from metal, plastic, tyre, rubber, paper and glass waste|Metal, Plastik, Lastik, Kauçuk, Kâğit Ve Cam Hurda Ve Atiklardan Elde Edilen Hammadde Teslimi|KDV_WITHHOLDING
622|622|Cotton, mohair, wool, fleece, raw hide and leather deliveries|Pamuk, Tiftik, Yün Ve Yapaği İle Ham Post Ve Deri Teslimleri|KDV_WITHHOLDING
623|623|Wood and forest product deliveries|Ağaç Ve Orman Ürünleri Teslimi|KDV_WITHHOLDING
624|624|Freight transport services|Yük Taşimaciliği Hizmeti [Kdvgut-(I/C-2.1.3.2.11)]|KDV_WITHHOLDING
625|625|Commercial advertising services|Ticari Reklam Hizmetleri [Kdvgut-(I/C-2.1.3.2.15)]|KDV_WITHHOLDING
626|626|Other deliveries|Diğer Teslimler [Kdvgut-(I/C-2.1.3.3.7.)]|KDV_WITHHOLDING
627|627|Iron and steel product deliveries|Demir-Çelik Ürünlerinin Teslimi [Kdvgut-(I/C-2.1.3.3.8)]|KDV_WITHHOLDING
801|801|Construction and related engineering, architecture and survey-project services|Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlık ve Etüt-Proje Hizmetleri[KDVGUT-(I/C-2.1.3.2.1)]|KDV_WITHHOLDING
802|802|Survey, planning, consultancy, audit and similar services|Etüt, Plan-Proje, Danışmanlık, Denetim ve Benzeri Hizmetler[KDVGUT-(I/C-2.1.3.2.2)]|KDV_WITHHOLDING
803|803|Machinery, equipment, fixture and vehicle repair and maintenance|Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım Hizmetleri[KDVGUT- (I/C-2.1.3.2.3)]|KDV_WITHHOLDING
804|804|Catering services|Yemek Servis Hizmeti[KDVGUT-(I/C-2.1.3.2.4)]|KDV_WITHHOLDING
805|805|Event organisation services|Organizasyon Hizmeti[KDVGUT-(I/C-2.1.3.2.4)]|KDV_WITHHOLDING
806|806|Labour supply services|İşgücü Temin Hizmetleri[KDVGUT-(I/C-2.1.3.2.5)]|KDV_WITHHOLDING
807|807|Private security services|Özel Güvenlik Hizmeti[KDVGUT-(I/C-2.1.3.2.5)]|KDV_WITHHOLDING
808|808|Building inspection services|Yapı Denetim Hizmetleri[KDVGUT-(I/C-2.1.3.2.6)]|KDV_WITHHOLDING
809|809|Contract textile, clothing, bag and shoe manufacturing and intermediary services|Fason Olarak Yaptırılan Tekstil ve Konfeksiyon İşleri, Çanta ve Ayakkabı Dikim İşleri ve Bu İşlere Aracılık Hizmetleri[KDVGUT- (I/C-2.1.3.2.7)]|KDV_WITHHOLDING
810|810|Customer referral services for tourist shops|Turistik Mağazalara Verilen Müşteri Bulma/ Götürme Hizmetleri[KDVGUT-(I/C-2.1.3.2.8)]|KDV_WITHHOLDING
811|811|Sports club broadcasting, advertising and naming-rights transactions|Spor Kulüplerinin Yayın, Reklâm ve İsim Hakkı Gelirlerine Konu İşlemleri[KDVGUT-(I/C-2.1.3.2.9)]|KDV_WITHHOLDING
812|812|Cleaning services|Temizlik Hizmeti[KDVGUT-(I/C-2.1.3.2.10)]|KDV_WITHHOLDING
813|813|Environment and garden maintenance|Çevre ve Bahçe Bakım Hizmetleri[KDVGUT-(I/C-2.1.3.2.10)]|KDV_WITHHOLDING
814|814|Shuttle transport services|Servis Taşımacılığı Hizmeti[KDVGUT-(I/C-2.1.3.2.11)]|KDV_WITHHOLDING
815|815|Printing services|Her Türlü Baskı ve Basım Hizmetleri[KDVGUT-(I/C-2.1.3.2.12)]|KDV_WITHHOLDING
816|816|Ingots produced from scrap metal|Hurda Metalden Elde Edilen Külçe Teslimleri[KDVGUT-(I/C- 2.1.3.3.1)]|KDV_WITHHOLDING
817|817|Copper, zinc, iron, steel, aluminium and lead ingots not produced from scrap metal|Hurda Metalden Elde Edilenler Dışındaki Bakır, Çinko, Demir Çelik, Alüminyum ve Kurşun Külçe Teslimi [KDVGUT-(I/C- 2.1.3.3.1)]|KDV_WITHHOLDING
818|818|Copper, zinc, aluminium and lead product deliveries|Bakır, Çinko, Alüminyum ve Kurşun Ürünlerinin Teslimi[KDVGUT- (I/C-2.1.3.3.2)]|KDV_WITHHOLDING
819|819|Scrap and waste deliveries by those waiving exemption|İstisnadan Vazgeçenlerin Hurda ve Atık Teslimi[KDVGUT-(I/C- 2.1.3.3.3)]|KDV_WITHHOLDING
820|820|Raw materials from metal, plastic, tyre, rubber, paper and glass waste|Metal, Plastik, Lastik, Kauçuk, Kâğıt ve Cam Hurda ve Atıklardan Elde Edilen Hammadde Teslimi[KDVGUT-(I/C-2.1.3.3.4)]|KDV_WITHHOLDING
821|821|Cotton, mohair, wool, fleece, raw hide and leather deliveries|Pamuk, Tiftik, Yün ve Yapağı İle Ham Post ve Deri Teslimleri[KDVGUT-(I/C-2.1.3.3.5)]|KDV_WITHHOLDING
822|822|Wood and forest product deliveries|Ağaç ve Orman Ürünleri Teslimi[KDVGUT-(I/C-2.1.3.3.6)]|KDV_WITHHOLDING
823|823|Freight transport services|Yük Taşımacılığı Hizmeti [KDVGUT-(I/C-2.1.3.2.11)]|KDV_WITHHOLDING
824|824|Commercial advertising services|Ticari Reklam Hizmetleri [KDVGUT-(I/C-2.1.3.2.15)]|KDV_WITHHOLDING
825|825|Iron and steel product deliveries|Demir-Çelik Ürünlerinin Teslimi [KDVGUT-(I/C-2.1.3.3.8)]|KDV_WITHHOLDING`;
/** Verified withholding categories; rates are read from the invoice.
 * @example
 * WITHHOLDING_CODES.get("601");
 */
export const WITHHOLDING_CODES: ReadonlyMap<string, TaxTypeInfo> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ entries.split('\n').map((row) => {
    // The checked-in table above has exactly these columns on every row.
    const [code, short, en, tr, kind] = row.split('|') as [string, string, string, string, string];
    return [code, { code, short, label: { en, tr }, kind: kind as TaxTypeInfo['kind'] }];
  }),
);
