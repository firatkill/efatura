import type { TaxTypeInfo } from '../types';

// Fixed columns: code, short, kind, en, tr.
// Delimited literals keep the complete verified labels within the core size budget.
const entries = `0003|GV STOPAJI|STOPAJ|Income tax withholding|Gelir Vergisi Stopajı
0011|KV STOPAJI|STOPAJ|Corporate tax withholding|Kurumlar Vergisi Stopajı
0015|KDV GERCEK|KDV|Value-added tax under the actual method|Gerçek Usulde Katma Değer Vergisi
0021|BMV|OTHER|Banking transactions tax|Banka Muameleleri Vergisi
0022|SMV|OTHER|Insurance transactions tax|Sigorta Muameleleri Vergisi
0059|KONAKLAMA V.|KONAKLAMA|Accommodation tax|KONAKLAMA VERGİSİ
0061|KKDF KESİNTİ|OTHER|Resource utilisation support fund deduction|Kaynak Kullanımı Destekleme Fonu Kesintisi
0071|ÖTV 1.LİSTE|OTV|Special consumption tax on petroleum and natural gas products|Petrol Ve Doğalgaz Ürünlerine İlişkin Özel Tüketim Vergisi
0073|ÖTV 3.LİSTE|OTV|Special consumption tax on cola, alcoholic beverages and tobacco products|Kolalı Gazoz, Alkollü İçeçekler Ve Tütün Mamüllerine İlişkin Özel Tüketim Vergisi
0074|ÖTV 4.LİSTE|OTV|Special consumption tax on durable consumer and other goods|Dayanıklı Tüketim Ve Diğer Mallara İlişkin Özel Tüketim Vergisi
0075|ÖTV 3A LİSTE|OTV|Special consumption tax on alcoholic beverages|Alkollü İçeçeklere İlişkin Özel Tüketim Vergisi
0076|ÖTV 3B LİSTE|OTV|Special consumption tax on tobacco products|Tütün Mamüllerine İlişkin Özel Tüketim Vergisi
0077|ÖTV 3C LİSTE|OTV|Special consumption tax on cola|Kolalı Gazozlara İlişkin Özel Tüketim Vergisi
1047|DAMGA V|DAMGA|Stamp duty|Damga Vergisi
1048|5035SKDAMGAV|DAMGA|Stamp duty under Law 5035|5035 Sayılı Kanuna Göre Damga Vergisi
4071|ELK.HAVAGAZ.TÜK.VER.|OTHER|Electricity and town gas consumption tax|Elektrik Ve Havagazi Tüketim Vergisi
4080|Ö.İLETİŞİM V|OIV|Special communication tax|Özel İletişim Vergisi
4081|5035ÖZİLETV.|OIV|Special communication tax under Law 5035|5035 Sayılı Kanuna Göre Özel İletişim Vergisi
4171|PTR-DGZ ÖTV TEVKİFAT|OTV|SCT withholding on petroleum and natural gas products|Petrol Ve Doğalgaz Ürünlerine İlişkin Ötv Tevkifatı
8001|BORSA TES.ÜC.|OTHER|Commodity exchange registration fee|Borsa Tescil Ücreti
8002|ENERJİ FONU|OTHER|Energy fund|Enerji Fonu
8004|TRT PAYI|OTHER|TRT share|Trt Payı
8005|ELK.TÜK.VER.|OTHER|Electricity consumption tax|Elektrik Tüketim Vergisi
8006|TK KULLANIM|OTHER|Radio usage fee|Telsiz Kullanım Ücreti
8007|TK RUHSAT|OTHER|Radio licence fee|Telsiz Ruhsat Ücreti
8008|ÇEV. TEM .VER.|OTHER|Environmental cleaning tax|Çevre Temizlik Vergisi
9015|KDV TEVKİFAT|KDV_WITHHOLDING|VAT withholding (without taxpayer registration)|KATMA DEĞER VERGİSİ TEVKİFATI (MÜKELLEFİYETSİZ)
9021|4961BANKASMV|OTHER|Banking and insurance transactions tax under Law 4961|4961 Banka Sigorta Muameleleri Vergisi
9040|MERA FONU|OTHER|Pasture fund|Mera Fonu
9077|ÖTV 2.LİSTE|OTV|Special consumption tax on motor vehicles subject to registration|Motorlu Taşıt Araçlarına İlişkin Özel Tüketim Vergisi (Tescile Tabi Olanlar)
9944|BEL.ÖD.HAL RÜSUM|OTHER|Municipal wholesale market fee|Belediyelere Ödenen Hal Rüsumu`;
/** Verified tax types; 0059/9015 short labels are owner-approved project abbreviations (D-60).
 * @example
 * TAX_TYPES.get("0003");
 */
export const TAX_TYPES: ReadonlyMap<string, TaxTypeInfo> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ entries.split('\n').map((row) => {
    // The checked-in table above has exactly these columns on every row.
    const [code, short, kind, en, tr] = row.split('|') as [string, string, string, string, string];
    return [code, { code, short, kind: kind as TaxTypeInfo['kind'], label: { en, tr } }];
  }),
);
