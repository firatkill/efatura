import type { CodeInfo } from '../types';

// Fixed columns: code, en, tr.
// Delimited literals keep the complete verified labels within the core size budget.
const entries = `001|Diplomatic exemption|Diplomatik İstisna
101|Export exemption|İhracat İstisnası
102|Diplomatic exemption|Diplomatik İstisna
103|Military exemption|Askeri Amaçlı İstisna
104|Deliveries to petroleum exploration operators|Petrol Arama Faaliyetlerinde Bulunanlara Yapılan Teslimler
105|International agreement exemption|Uluslararası Anlaşmadan Doğan İstisna
106|Other exemptions|Diğer İstisnalar
107|Deliveries under Article 7/a|7/a Maddesi Kapsamında Yapılan Teslimler
108|Deliveries under provisional Article 5|Geçici 5. Madde Kapsamında Yapılan Teslimler
151|SCT: other, not exempt|ÖTV - İstisna Olmayan Diğer
201|Cultural and educational activities (17/1)|17/1 Kültür ve Eğitim Amacı Taşıyan İşlemler
202|Health, environmental and social assistance activities (17/2-a)|17/2-a Sağlık, Çevre Ve Sosyal Yardım Amaçlı İşlemler
204|Purchases funded by foreign diplomatic and charitable donations (17/2-c)|17/2-c Yabancı Diplomatik Organ Ve Hayır Kurumlarının Yapacakları Bağışlarla İlgili Mal Ve Hizmet Alışları
205|Immovable cultural property deliveries and architectural services (17/2-d)|17/2-d Taşınmaz Kültür Varlıklarına İlişkin Teslimler ve Mimarlık Hizmetleri
206|Professional organisations' transactions (17/2-e)|17/2-e Mesleki Kuruluşların İşlemleri
207|Military factory, shipyard and workshop transactions (17/3)|17/3 Askeri Fabrika, Tersane ve Atölyelerin İşlemleri
208|Mergers, transfers, conversions and divisions (17/4-c)|17/4-c Birleşme, Devir, Dönüşüm ve Bölünme İşlemleri
209|Transactions subject to banking and insurance transactions tax (17/4-e)|17/4-e Banka ve Sigorta Muameleleri Vergisi Kapsamına Giren İşlemler
211|Agricultural water and village drinking-water deliveries (17/4-h)|17/4-h Zirai Amaçlı Su Teslimleri İle Köy Tüzel Kişiliklerince Yapılan İçme Suyu teslimleri
212|Services in free zones (17/4-ı)|17/4-ı Serbest Bölgelerde Verilen Hizmetler
213|Petroleum and gas transport by pipeline (17/4-j)|17/4-j Boru Hattı İle Yapılan Petrol Ve Gaz Taşımacılığı
214|Industrial-zone land and workplace deliveries and cooperative housing (17/4-k)|17/4-k Organize Sanayi Bölgelerindeki Arsa ve İşyeri Teslimleri İle Konut Yapı Kooperatiflerinin Üyelerine Konut Teslimleri
215|Asset management company transactions (17/4-l)|17/4-l Varlık Yönetim Şirketlerinin İşlemleri
216|Savings Deposit Insurance Fund transactions (17/4-m)|17/4-m Tasarruf Mevduatı Sigorta Fonunun İşlemleri
217|News services to the press and information directorate (17/4-n)|17/4-n Basın-Yayın ve Enformasyon Genel Müdürlüğüne Verilen Haber Hizmetleri
218|Rental of customs warehouses, temporary stores and duty-free premises (17/4-o)|KDV 17/4-o md. Gümrük Antrepoları, Geçici Depolama Yerleri ile Gümrüklü Sahalarda Vergisiz Satış Yapılan İşyeri, Depo ve Ardiye Gibi Bağımsız Birimlerin Kiralanması
219|Treasury, housing administration and local authority transactions|Hazine , Toplu Konut İdaresi Başkanlığı, Belediyeler, il özel idareleri ve yatırım izleme ve koordinasyon başkanlıklarının İşlemleri
220|Sales of property and equity held for two years and property recorded before 15 July 2023 (17/4-r)|17/4-r İki Tam Yıl Süreyle Sahip Olunan Taşınmaz ve İştirak Hisseleri ile 15/7/2023 tarihinden önce kurumların aktifinde kayıtlı Taşınmaz satışı
221|Construction services to housing cooperatives, municipalities and social security bodies (provisional 15)|Geçici 15 Konut Yapı Kooperatifleri, Belediyeler ve Sosyal Güvenlik Kuruluşlarına Verilen İnşaat Taahhüt Hizmeti
223|Transactions in technology development zones (provisional 20/1)|Geçici 20/1 Teknoloji Geliştirme Bölgelerinde Yapılan İşlemler
225|Deliveries for computer donations to the education ministry (provisional 23)|Geçici 23 Milli Eğitim Bakanlığına Yapılan Bilgisayar Bağışları İle İlgili Teslimler
226|Free education by private schools and higher education institutions (17/2-b)|17/2-b Özel Okulları, Üniversite ve Yüksekokullar Tarafından Verilen Bedelsiz Eğitim Ve Öğretim Hizmetleri
227|Statutory free deliveries and services (17/2-b)|17/2-b Kanunların Gösterdiği Gerek Üzerine Bedelsiz Olarak Yapılan Teslim ve Hizmetler
228|Free deliveries to institutions listed in Article 17/1 (17/2-b)|17/2-b Kanunun (17/1) Maddesinde Sayılan Kurum ve Kuruluşlara Bedelsiz Olarak Yapılan Teslimler
229|Food-bank donations of food, cleaning products, clothing and fuel|Gıda Bankacılığı Faaliyetinde Bulunan Darülacezeye, Dernek ve Vakıflara Bağışlanan, Gıda, Temizlik, Giyecek ve Yakacak Maddeleri
230|Gold and silver bullion and precious stone deliveries (17/4-g)|17/4-g Külçe Altın, Külçe Gümüş Ve Kiymetli Taşlarin Teslimi
231|Metal, plastic, tyre, rubber, paper and glass scrap deliveries (17/4-g)|17/4-g Metal Plastik, Lastik, Kauçuk, Kağit, Cam Hurda Ve Atıkların Teslimi
232|Currency, money, revenue stamps, securities, shares and bonds (17/4-g)|17/4-g Döviz, Para, Damga Pulu, Değerli Kağıtlar, Hisse Senedi ve Tahvil Teslimleri
233|Property transfers to expropriating public bodies under Law 2942|2942 Sayılı Kamulaştırma Kanunu Kapsamında Taşınmazların Kamulaştırmayı Yapan Devlet ve Kamu Tüzel Kişilerine Devri
234|Deliveries of homes pledged or mortgaged for housing finance (17/4-ş)|17/4-ş Konut Finansmanı Amacıyla Teminat Gösterilen ve İpotek Konulan Konutların Teslimi
235|Goods under transit, customs warehousing, temporary storage and free-zone regimes (16/1-c)|16/1-c Transit ve Gümrük Antrepo Rejimleri İle Geçici Depolama ve Serbest Bölge Hükümlerinin Uygulandığiı Malların Teslimi
236|International agreement exemptions without refund rights (19/2)|19/2 Usulüne Göre Yürürlüğe Girmiş Uluslararası Anlaşmalar Kapsamındaki İstisnalar (İade Hakkı Tanınmayan)
237|Subsequent deliveries of product certificates through exchanges (17/4-t)|17/4-t 5300 Sayılı Kanuna Göre Düzenlenen Ürün Senetlerinin İhtisas/Ticaret Borsaları Aracılığıyla İlk Teslimlerinden Sonraki Teslim
238|Asset transfers to and leasing by asset leasing companies (17/4-u)|17/4-u Varlıkların Varlık Kiralama Şirketlerine Devri İle Bu Varlıkların Varlık Kiralama Şirketlerince Kiralanması ve Devralınan Kuruma Devri
239|Property transfers to financial leasing companies and leasebacks (17/4-y)|17/4-y Taşınmazların Finansal Kiralama Şirketlerine Devri, Finansal Kiralama Şirketi Tarafından Devredene Kiralanması ve Devri
240|Licensing, transfer and sale of patented or utility-model rights (17/4-z)|17/4-z Patentli Veya Faydalı Model Belgeli Buluşa İlişkin Gayri Maddi Hakların Kiralanması, Devri ve Satışı
241|TurkStream agreement services under Article 9/b|TürkAkım Gaz Boru Hattı Projesine İlişkin Anlaşmanın (9/b) Maddesinde Yer Alan Hizmetler
242|Warehousing, storage and terminal services for customs and transit goods (17/4-ö)|KDV 17/4-ö md. Gümrük Antrepoları, Geçici Depolama Yerleri ile Gümrüklü Sahalarda, İthalat ve İhracat İşlemlerine konu mallar ile transit rejim kapsamında işlem gören mallar için verilen ardiye, depolama ve terminal hizmetleri
250|Other exemptions|Diğerleri
301|Export of goods (11/1-a)|11/1-a Mal İhracatı
302|Export of services (11/1-a)|11/1-a Hizmet İhracatı
303|Roaming services (11/1-a)|11/1-a Roaming Hizmetleri
304|Sea, air and rail vehicles and their construction, modification, maintenance and repair (13/a)|13/a Deniz Hava ve Demiryolu Taşıma Araçlarının Teslimi İle İnşa, Tadil, Bakım ve Onarımları
305|Port and airport services for sea and air vehicles (13/b)|13/b Deniz ve Hava Taşıma Araçları İçin Liman Ve Hava Meydanlarında Yapılan Hizmetler
306|Petroleum exploration and pipeline construction and modernisation (13/c)|13/c Petrol Aramaları ve Petrol Boru Hatlarının İnşa ve Modernizasyonuna İlişkin Yapılan Teslim ve Hizmetler
307|Mining exploration and gold, silver and platinum operation, enrichment and refining (13/c)|13/c Maden Arama, Altın, Gümüş ve Platin Madenleri İçin İşletme, Zenginleştirme Ve Rafinaj Faaliyetlerine İlişkin Teslim Ve Hizmetler[KDVGUT-(II/8-4)]
308|Incentivised investment goods deliveries (13/d)|13/d Teşvikli Yatırım Mallarının Teslimi
309|Port and airport construction, renewal and expansion (13/e)|13/e Liman Ve Hava Meydanlarının İnşası, Yenilenmesi Ve Genişletilmesi
310|National security deliveries and services (13/f)|13/f Ulusal Güvenlik Amaçlı Teslim ve Hizmetler
311|International transport (14/1)|14/1 Uluslararası Taşımacılık
312|Deliveries and services to diplomatic bodies and missions (15/a)|15/a Diplomatik Organ Ve Misyonlara Yapılan Teslim ve Hizmetler
313|Deliveries and services to international organisations (15/b)|15/b Uluslararası Kuruluşlara Yapılan Teslim ve Hizmetler
314|International agreement exemptions (19/2)|19/2 Usulüne Göre Yürürlüğe Girmiş Uluslar Arası Anlaşmalar Kapsamındaki İstisnalar
315|Diesel deliveries to trucks and tractors carrying export goods (14/3)|14/3 İhraç Konusu Eşyayı Taşıyan Kamyon, Çekici ve Yarı Romorklara Yapılan Motorin Teslimleri
316|Contract manufacturing for free-zone customers (11/1-a)|11/1-a Serbest Bölgelerdeki Müşteriler İçin Yapılan Fason Hizmetler
317|Equipment and software for disabled people's education, work and daily life (17/4-s)|17/4-s Engellilerin Eğitimleri, Meslekleri ve Günlük Yaşamlarına İlişkin Araç-Gereç ve Bilgisayar Programları
318|Build-operate-transfer and leased health and education facility projects (provisional 29)|Geçici 29 3996 Sayılı Kanuna Göre Yap-İşlet-Devret Modeli Çerçevesinde Gerçekleştirilecek Projeler, 3359 Sayılı Kanuna Göre Kiralama Karşılığı Yaptırılan Sağlık Tesislerine İlişkin Projeler ve 652 Sayılı Kanun Hükmünde Kararnameye Göre Kiralama Karşılığı Yaptırılan Eğitim Öğretim Tesislerine İlişkin Projelere İlişkin Teslim ve Hizmetler
319|Vehicle deliveries to the Prime Ministry central organisation (13/g)|13/g Başbakanlık Merkez Teşkilatına Yapılan Araç Teslimleri
320|Deliveries and services to the Istanbul Project Coordination Unit under ISMEP|Geçici 16 (6111 sayılı K.) İSMEP Kapsamında İstanbul İl Özel İdaresi'ne Bağlı Olarak Faaliyet Gösteren "İstanbul Proje Koordinasyon Birimi"ne Yapılacak Teslim ve Hizmetler
321|Deliveries and services for UN, NATO and OECD bodies and their social and economic aid|Geçici 26 Birleşmiş Milletler (BM) ile Kuzey Atlantik Antlaşması Teşkilatı (NATO) Temsilcilikleri ve Bu Teşkilatlara Bağlı Program, Fon ve Özel İhtisas Kuruluşları ile İktisadi İşbirliği ve Kalkınma Teşkilatına (OECD) Resmi Kullanımları İçin Yapılacak Mal Teslimi ve Hizmet İfaları, Bunların Sosyal ve Ekonomik Yardım Amacıyla Bedelsiz Olarak Yapacakları Mal Teslimi ve Hizmet İfaları İle İlgili Bunlara Yapılan Mal Teslimi ve Hizmet İfaları
322|Special-invoice deliveries to non-residents: suitcase trade (11/1-a)|11/1-a Türkiye'de İkamet Etmeyenlere Özel Fatura ile Yapılan Teslimler (Bavul Ticareti)
323|First deliveries of product certificates through exchanges (13/ğ)|13/ğ 5300 Sayılı Kanuna Göre Düzenlenen Ürün Senetlerinin İhtisas/Ticaret Borsaları Aracılığıyla İlk Teslimi
324|Deliveries and services to and by the Turkish Red Crescent (13/h)|13/h Türkiye Kızılay Derneğine Yapılan Teslim ve Hizmetler ile Türkiye Kızılay Derneğinin Teslim ve Hizmetleri
325|Feed deliveries (13/ı)|13/ı Yem Teslimleri
326|Registered fertiliser deliveries (13/ı)|13/ı Gıda, Tarım ve Hayvancılık Bakanlığı Tarafından Tescil Edilmiş Gübrelerin Teslimi
327|Fertiliser raw-material deliveries to producers (13/ı)|13/ı Gıda, Tarım ve Hayvancılık Bakanlığı Tarafından Tescil Edilmiş Gübrelerin İçeriğinde Bulunan Hammaddelerin Gübre Üreticilerine Teslimi
328|Housing or workplace deliveries (13/i)|13/i Konut veya İşyeri Teslimleri
329|Deliveries and services to the education ministry under FATİH|Eğitimde Fırsatları Artırma ve Teknolojiyi İyileştirme Hareketi (FATİH) projesi Kapsamında Milli Eğitim Bakanlığına Yapılacak Mal Teslimi ve Hizmet İfası
330|Construction of organised industrial zones and small industrial sites (13/j)|KDV 13/j md. Organize Sanayi Bölgeleri ile Küçük Sanayi Sitelerinin İnşasına İlişkin Teslim ve Hizmetler
331|New machinery and equipment for research, innovation and design (13/m)|KDV 13/m md. Ar-Ge, Yenilik ve Tasarım Faaliyetlerinde Kullanılmak Üzere Yapılan Yeni Makina ve Teçhizat Teslimlerinde İstisna
332|New machinery and equipment for manufacturing (provisional 39)|KDV Geçici 39. Md. İmalat Sanayiinde Kullanılmak Üzere Yapılan Yeni Makina ve Teçhizat Teslimlerinde İstisna
333|Construction of facilities donated to public bodies (13/k)|KDV 13/k md. Kapsamında Genel ve Özel Bütçeli Kamu İdarelerine, İl Özel İdarelerine, Belediyelere ve Köylere bağışlanan Tesislerin İnşasına İlişkin İstisna
334|Health services to foreigners (13/l)|KDV 13/l md. Kapsamında Yabancılara Verilen Sağlık Hizmetlerinde İstisna
335|Printed books and periodicals (13/n)|KDV 13/n Basılı Kitap ve Süreli Yayınların Teslimleri
336|Deliveries and services for UEFA competitions (provisional 46)|Geçici 46 UEFA Müsabakaları Kapsamında Yapılacak Teslim ve Hizmetler
337|Gas transport under Article 9/h of the TurkStream agreement|Türk Akım Gaz Boru Hattı Projesine İlişkin Anlaşmanın (9/h) Maddesi Kapsamındaki Gaz Taşıma Hizmetleri
338|Manufacturers' exports of goods|İmalatçıların Mal İhracatları
339|Construction under manufacturing and tourism investment incentive certificates|İmalat Sanayii ile Turizme Yönelik Yatırım Teşvik Belgesi Kapsamındaki İnşaat İşlerine İlişkin Teslim ve Hizmetler
340|Engineering services for electric vehicle development|Elektrik Motorlu Taşıt Araçlarının Geliştirilmesine Yönelik Mühendislik Hizmetleri
341|Construction of housing to be donated to disaster victims|Afetzedelere Bağışlanacak Konutların İnşasına İlişkin İstisna
342|Construction of property to be donated to general-budget public bodies|Genel Bütçeli Kamu İdarelerine Bağışlanacak Taşınmazların İnşasına İlişkin İstisna
343|Housing deliveries to foreign state bodies for donation to general-budget public bodies|Genel Bütçeli Kamu İdarelerine Bağışlanacak Konutların Yabancı Devlet Kurum ve Kuruluşlarına Teslimine İlişkin İstisna
344|Vehicle deliveries for national defence and internal security (13/o)|13/o Milli Savunma ve İç Güvenlik İhtiyaçlarında Kullanılmak Üzere Taşıt Teslimi
350|Other exemptions|Diğerleri
351|VAT: other, not exempt|KDV - İstisna Olmayan Diğer
501|Sales to non-resident travellers (11/1-b)|11/1-b Türkiye’de İkamet Etmeyen Yolculara Yapılan Satışlar
555|Sales not subject to VAT rate control|KDV Oran Kontrolüne Tabi Olmayan Satışlar
701|Export-registered sales under VAT Law 3065, Article 11/1-c|3065 s. KDV Kanununun 11/1-c md. Kapsamındaki İhraç Kayıtlı Satış
702|Sales under inward processing certificates and temporary admission|DİİB ve Geçici Kabul Rejimi Kapsamındaki Satışlar
703|Export-registered sales under SCT Law 4760, Article 8/2|4760 s. ÖTV Kanununun 8/2 Md. Kapsamındaki İhraç Kayıtlı Satış
704|Export-registered sales under VAT Article 11/1-c and SCT Article 8/2|3065 sayılı KDV Kanununun (11/1-c) maddesi ve 4760 s. Ötv Kanununun 8/2. Md. Kapsamındaki İhraç Kayıtlı Satış
801|National lottery, Sports Toto and similar games|Milli Piyango, Spor Toto vb. Oyunlar
802|Horse racing and other pooled betting and games of chance|At Yarışları ve Diğer Müşterek Bahis ve Talih Oyunları
803|Professional artistic performances, concerts and sporting events|Profesyonel Sanatçıların Yer Aldığı Gösteriler, Konserler, Profesyonel Sporcuların Katıldığı Sportif Faaliyetler, Maçlar, Yarışlar ve Yarışmalar
804|Sales in customs warehouses and auction premises|Gümrük Depolarında ve Müzayede Mahallerinde Yapılan Satışlar
805|Gold jewellery and gold coin deliveries|Altından Mamül veya Altın İçeren Ziynet Eşyaları İle Sikke Altınların Teslimi
806|Tobacco products|Tütün Mamülleri
807|Newspapers and periodicals subject to harmful-publications rules|Muzır Neşriyat Kapsamındaki Gazete, Dergi vb. Periyodik Yayınlar
808|Silver jewellery and silver coin deliveries|Gümüşten Mamul veya Gümüş İçeren Ziynet Eşyaları ile Sikke Gümüşlerin Teslimi
809|Dealer sales of municipal urban passenger transport tickets and cards|Belediyeler Tarafından Yapılan Şehir İçi Yolcu Taşımacılığında Kullanılan Biletlerin ve Kartların Bayiler Tarafından Satışı
810|Prepaid electronic communications services|Ön Ödemeli Elektronik Haberleşme Hizmetleri
811|TŞOF deliveries of vehicle plates and driving-school documents|TŞOF Tarafından Araç Plakaları ile Sürücü Kurslarında Kullanılan Bir Kısım Evrakın Teslimi
812|Deliveries of used motor vehicles or property purchased without VAT|KDV Uygulanmadan Alınan İkinci El Motorlu Kara Taşıtı veya Taşınmaz Teslimi`;
/** Verified exemption reasons; English labels are literal translations.
 * @example
 * EXEMPTION_CODES.get("001");
 */
export const EXEMPTION_CODES: ReadonlyMap<string, CodeInfo> = /* @__PURE__ */ new Map(
  /* @__PURE__ */ entries.split('\n').map((row) => {
    // The checked-in table above has exactly these columns on every row.
    const [code, en, tr] = row.split('|') as [string, string, string];
    return [code, { code, label: { en, tr } }];
  }),
);
