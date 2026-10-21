import type { CodeInfo } from '../types';

const entries = [
  { code: '001', label: { en: 'Diplomatic exemption', tr: 'Diplomatik İstisna' } },
  { code: '101', label: { en: 'Export exemption', tr: 'İhracat İstisnası' } },
  { code: '102', label: { en: 'Diplomatic exemption', tr: 'Diplomatik İstisna' } },
  { code: '103', label: { en: 'Military exemption', tr: 'Askeri Amaçlı İstisna' } },
  {
    code: '104',
    label: {
      en: 'Deliveries to petroleum exploration operators',
      tr: 'Petrol Arama Faaliyetlerinde Bulunanlara Yapılan Teslimler',
    },
  },
  {
    code: '105',
    label: { en: 'International agreement exemption', tr: 'Uluslararası Anlaşmadan Doğan İstisna' },
  },
  { code: '106', label: { en: 'Other exemptions', tr: 'Diğer İstisnalar' } },
  {
    code: '107',
    label: { en: 'Deliveries under Article 7/a', tr: '7/a Maddesi Kapsamında Yapılan Teslimler' },
  },
  {
    code: '108',
    label: {
      en: 'Deliveries under provisional Article 5',
      tr: 'Geçici 5. Madde Kapsamında Yapılan Teslimler',
    },
  },
  { code: '151', label: { en: 'SCT: other, not exempt', tr: 'ÖTV - İstisna Olmayan Diğer' } },
  {
    code: '201',
    label: {
      en: 'Cultural and educational activities (17/1)',
      tr: '17/1 Kültür ve Eğitim Amacı Taşıyan İşlemler',
    },
  },
  {
    code: '202',
    label: {
      en: 'Health, environmental and social assistance activities (17/2-a)',
      tr: '17/2-a Sağlık, Çevre Ve Sosyal Yardım Amaçlı İşlemler',
    },
  },
  {
    code: '204',
    label: {
      en: 'Purchases funded by foreign diplomatic and charitable donations (17/2-c)',
      tr: '17/2-c Yabancı Diplomatik Organ Ve Hayır Kurumlarının Yapacakları Bağışlarla İlgili Mal Ve Hizmet Alışları',
    },
  },
  {
    code: '205',
    label: {
      en: 'Immovable cultural property deliveries and architectural services (17/2-d)',
      tr: '17/2-d Taşınmaz Kültür Varlıklarına İlişkin Teslimler ve Mimarlık Hizmetleri',
    },
  },
  {
    code: '206',
    label: {
      en: "Professional organisations' transactions (17/2-e)",
      tr: '17/2-e Mesleki Kuruluşların İşlemleri',
    },
  },
  {
    code: '207',
    label: {
      en: 'Military factory, shipyard and workshop transactions (17/3)',
      tr: '17/3 Askeri Fabrika, Tersane ve Atölyelerin İşlemleri',
    },
  },
  {
    code: '208',
    label: {
      en: 'Mergers, transfers, conversions and divisions (17/4-c)',
      tr: '17/4-c Birleşme, Devir, Dönüşüm ve Bölünme İşlemleri',
    },
  },
  {
    code: '209',
    label: {
      en: 'Transactions subject to banking and insurance transactions tax (17/4-e)',
      tr: '17/4-e Banka ve Sigorta Muameleleri Vergisi Kapsamına Giren İşlemler',
    },
  },
  {
    code: '211',
    label: {
      en: 'Agricultural water and village drinking-water deliveries (17/4-h)',
      tr: '17/4-h Zirai Amaçlı Su Teslimleri İle Köy Tüzel Kişiliklerince Yapılan İçme Suyu teslimleri',
    },
  },
  {
    code: '212',
    label: { en: 'Services in free zones (17/4-ı)', tr: '17/4-ı Serbest Bölgelerde Verilen Hizmetler' },
  },
  {
    code: '213',
    label: {
      en: 'Petroleum and gas transport by pipeline (17/4-j)',
      tr: '17/4-j Boru Hattı İle Yapılan Petrol Ve Gaz Taşımacılığı',
    },
  },
  {
    code: '214',
    label: {
      en: 'Industrial-zone land and workplace deliveries and cooperative housing (17/4-k)',
      tr: '17/4-k Organize Sanayi Bölgelerindeki Arsa ve İşyeri Teslimleri İle Konut Yapı Kooperatiflerinin Üyelerine Konut Teslimleri',
    },
  },
  {
    code: '215',
    label: {
      en: 'Asset management company transactions (17/4-l)',
      tr: '17/4-l Varlık Yönetim Şirketlerinin İşlemleri',
    },
  },
  {
    code: '216',
    label: {
      en: 'Savings Deposit Insurance Fund transactions (17/4-m)',
      tr: '17/4-m Tasarruf Mevduatı Sigorta Fonunun İşlemleri',
    },
  },
  {
    code: '217',
    label: {
      en: 'News services to the press and information directorate (17/4-n)',
      tr: '17/4-n Basın-Yayın ve Enformasyon Genel Müdürlüğüne Verilen Haber Hizmetleri',
    },
  },
  {
    code: '218',
    label: {
      en: 'Rental of customs warehouses, temporary stores and duty-free premises (17/4-o)',
      tr: 'KDV 17/4-o md. Gümrük Antrepoları, Geçici Depolama Yerleri ile Gümrüklü Sahalarda Vergisiz Satış Yapılan İşyeri, Depo ve Ardiye Gibi Bağımsız Birimlerin Kiralanması',
    },
  },
  {
    code: '219',
    label: {
      en: 'Treasury, housing administration and local authority transactions',
      tr: 'Hazine , Toplu Konut İdaresi Başkanlığı, Belediyeler, il özel idareleri ve yatırım izleme ve koordinasyon başkanlıklarının İşlemleri',
    },
  },
  {
    code: '220',
    label: {
      en: 'Sales of property and equity held for two years and property recorded before 15 July 2023 (17/4-r)',
      tr: '17/4-r İki Tam Yıl Süreyle Sahip Olunan Taşınmaz ve İştirak Hisseleri ile 15/7/2023 tarihinden önce kurumların aktifinde kayıtlı Taşınmaz satışı',
    },
  },
  {
    code: '221',
    label: {
      en: 'Construction services to housing cooperatives, municipalities and social security bodies (provisional 15)',
      tr: 'Geçici 15 Konut Yapı Kooperatifleri, Belediyeler ve Sosyal Güvenlik Kuruluşlarına Verilen İnşaat Taahhüt Hizmeti',
    },
  },
  {
    code: '223',
    label: {
      en: 'Transactions in technology development zones (provisional 20/1)',
      tr: 'Geçici 20/1 Teknoloji Geliştirme Bölgelerinde Yapılan İşlemler',
    },
  },
  {
    code: '225',
    label: {
      en: 'Deliveries for computer donations to the education ministry (provisional 23)',
      tr: 'Geçici 23 Milli Eğitim Bakanlığına Yapılan Bilgisayar Bağışları İle İlgili Teslimler',
    },
  },
  {
    code: '226',
    label: {
      en: 'Free education by private schools and higher education institutions (17/2-b)',
      tr: '17/2-b Özel Okulları, Üniversite ve Yüksekokullar Tarafından Verilen Bedelsiz Eğitim Ve Öğretim Hizmetleri',
    },
  },
  {
    code: '227',
    label: {
      en: 'Statutory free deliveries and services (17/2-b)',
      tr: '17/2-b Kanunların Gösterdiği Gerek Üzerine Bedelsiz Olarak Yapılan Teslim ve Hizmetler',
    },
  },
  {
    code: '228',
    label: {
      en: 'Free deliveries to institutions listed in Article 17/1 (17/2-b)',
      tr: '17/2-b Kanunun (17/1) Maddesinde Sayılan Kurum ve Kuruluşlara Bedelsiz Olarak Yapılan Teslimler',
    },
  },
  {
    code: '229',
    label: {
      en: 'Food-bank donations of food, cleaning products, clothing and fuel',
      tr: 'Gıda Bankacılığı Faaliyetinde Bulunan Darülacezeye, Dernek ve Vakıflara Bağışlanan, Gıda, Temizlik, Giyecek ve Yakacak Maddeleri',
    },
  },
  {
    code: '230',
    label: {
      en: 'Gold and silver bullion and precious stone deliveries (17/4-g)',
      tr: '17/4-g Külçe Altın, Külçe Gümüş Ve Kiymetli Taşlarin Teslimi',
    },
  },
  {
    code: '231',
    label: {
      en: 'Metal, plastic, tyre, rubber, paper and glass scrap deliveries (17/4-g)',
      tr: '17/4-g Metal Plastik, Lastik, Kauçuk, Kağit, Cam Hurda Ve Atıkların Teslimi',
    },
  },
  {
    code: '232',
    label: {
      en: 'Currency, money, revenue stamps, securities, shares and bonds (17/4-g)',
      tr: '17/4-g Döviz, Para, Damga Pulu, Değerli Kağıtlar, Hisse Senedi ve Tahvil Teslimleri',
    },
  },
  {
    code: '233',
    label: {
      en: 'Property transfers to expropriating public bodies under Law 2942',
      tr: '2942 Sayılı Kamulaştırma Kanunu Kapsamında Taşınmazların Kamulaştırmayı Yapan Devlet ve Kamu Tüzel Kişilerine Devri',
    },
  },
  {
    code: '234',
    label: {
      en: 'Deliveries of homes pledged or mortgaged for housing finance (17/4-ş)',
      tr: '17/4-ş Konut Finansmanı Amacıyla Teminat Gösterilen ve İpotek Konulan Konutların Teslimi',
    },
  },
  {
    code: '235',
    label: {
      en: 'Goods under transit, customs warehousing, temporary storage and free-zone regimes (16/1-c)',
      tr: '16/1-c Transit ve Gümrük Antrepo Rejimleri İle Geçici Depolama ve Serbest Bölge Hükümlerinin Uygulandığiı Malların Teslimi',
    },
  },
  {
    code: '236',
    label: {
      en: 'International agreement exemptions without refund rights (19/2)',
      tr: '19/2 Usulüne Göre Yürürlüğe Girmiş Uluslararası Anlaşmalar Kapsamındaki İstisnalar (İade Hakkı Tanınmayan)',
    },
  },
  {
    code: '237',
    label: {
      en: 'Subsequent deliveries of product certificates through exchanges (17/4-t)',
      tr: '17/4-t 5300 Sayılı Kanuna Göre Düzenlenen Ürün Senetlerinin İhtisas/Ticaret Borsaları Aracılığıyla İlk Teslimlerinden Sonraki Teslim',
    },
  },
  {
    code: '238',
    label: {
      en: 'Asset transfers to and leasing by asset leasing companies (17/4-u)',
      tr: '17/4-u Varlıkların Varlık Kiralama Şirketlerine Devri İle Bu Varlıkların Varlık Kiralama Şirketlerince Kiralanması ve Devralınan Kuruma Devri',
    },
  },
  {
    code: '239',
    label: {
      en: 'Property transfers to financial leasing companies and leasebacks (17/4-y)',
      tr: '17/4-y Taşınmazların Finansal Kiralama Şirketlerine Devri, Finansal Kiralama Şirketi Tarafından Devredene Kiralanması ve Devri',
    },
  },
  {
    code: '240',
    label: {
      en: 'Licensing, transfer and sale of patented or utility-model rights (17/4-z)',
      tr: '17/4-z Patentli Veya Faydalı Model Belgeli Buluşa İlişkin Gayri Maddi Hakların Kiralanması, Devri ve Satışı',
    },
  },
  {
    code: '241',
    label: {
      en: 'TurkStream agreement services under Article 9/b',
      tr: 'TürkAkım Gaz Boru Hattı Projesine İlişkin Anlaşmanın (9/b) Maddesinde Yer Alan Hizmetler',
    },
  },
  {
    code: '242',
    label: {
      en: 'Warehousing, storage and terminal services for customs and transit goods (17/4-ö)',
      tr: 'KDV 17/4-ö md. Gümrük Antrepoları, Geçici Depolama Yerleri ile Gümrüklü Sahalarda, İthalat ve İhracat İşlemlerine konu mallar ile transit rejim kapsamında işlem gören mallar için verilen ardiye, depolama ve terminal hizmetleri',
    },
  },
  { code: '250', label: { en: 'Other exemptions', tr: 'Diğerleri' } },
  { code: '301', label: { en: 'Export of goods (11/1-a)', tr: '11/1-a Mal İhracatı' } },
  { code: '302', label: { en: 'Export of services (11/1-a)', tr: '11/1-a Hizmet İhracatı' } },
  { code: '303', label: { en: 'Roaming services (11/1-a)', tr: '11/1-a Roaming Hizmetleri' } },
  {
    code: '304',
    label: {
      en: 'Sea, air and rail vehicles and their construction, modification, maintenance and repair (13/a)',
      tr: '13/a Deniz Hava ve Demiryolu Taşıma Araçlarının Teslimi İle İnşa, Tadil, Bakım ve Onarımları',
    },
  },
  {
    code: '305',
    label: {
      en: 'Port and airport services for sea and air vehicles (13/b)',
      tr: '13/b Deniz ve Hava Taşıma Araçları İçin Liman Ve Hava Meydanlarında Yapılan Hizmetler',
    },
  },
  {
    code: '306',
    label: {
      en: 'Petroleum exploration and pipeline construction and modernisation (13/c)',
      tr: '13/c Petrol Aramaları ve Petrol Boru Hatlarının İnşa ve Modernizasyonuna İlişkin Yapılan Teslim ve Hizmetler',
    },
  },
  {
    code: '307',
    label: {
      en: 'Mining exploration and gold, silver and platinum operation, enrichment and refining (13/c)',
      tr: '13/c Maden Arama, Altın, Gümüş ve Platin Madenleri İçin İşletme, Zenginleştirme Ve Rafinaj Faaliyetlerine İlişkin Teslim Ve Hizmetler[KDVGUT-(II/8-4)]',
    },
  },
  {
    code: '308',
    label: {
      en: 'Incentivised investment goods deliveries (13/d)',
      tr: '13/d Teşvikli Yatırım Mallarının Teslimi',
    },
  },
  {
    code: '309',
    label: {
      en: 'Port and airport construction, renewal and expansion (13/e)',
      tr: '13/e Liman Ve Hava Meydanlarının İnşası, Yenilenmesi Ve Genişletilmesi',
    },
  },
  {
    code: '310',
    label: {
      en: 'National security deliveries and services (13/f)',
      tr: '13/f Ulusal Güvenlik Amaçlı Teslim ve Hizmetler',
    },
  },
  { code: '311', label: { en: 'International transport (14/1)', tr: '14/1 Uluslararası Taşımacılık' } },
  {
    code: '312',
    label: {
      en: 'Deliveries and services to diplomatic bodies and missions (15/a)',
      tr: '15/a Diplomatik Organ Ve Misyonlara Yapılan Teslim ve Hizmetler',
    },
  },
  {
    code: '313',
    label: {
      en: 'Deliveries and services to international organisations (15/b)',
      tr: '15/b Uluslararası Kuruluşlara Yapılan Teslim ve Hizmetler',
    },
  },
  {
    code: '314',
    label: {
      en: 'International agreement exemptions (19/2)',
      tr: '19/2 Usulüne Göre Yürürlüğe Girmiş Uluslar Arası Anlaşmalar Kapsamındaki İstisnalar',
    },
  },
  {
    code: '315',
    label: {
      en: 'Diesel deliveries to trucks and tractors carrying export goods (14/3)',
      tr: '14/3 İhraç Konusu Eşyayı Taşıyan Kamyon, Çekici ve Yarı Romorklara Yapılan Motorin Teslimleri',
    },
  },
  {
    code: '316',
    label: {
      en: 'Contract manufacturing for free-zone customers (11/1-a)',
      tr: '11/1-a Serbest Bölgelerdeki Müşteriler İçin Yapılan Fason Hizmetler',
    },
  },
  {
    code: '317',
    label: {
      en: "Equipment and software for disabled people's education, work and daily life (17/4-s)",
      tr: '17/4-s Engellilerin Eğitimleri, Meslekleri ve Günlük Yaşamlarına İlişkin Araç-Gereç ve Bilgisayar Programları',
    },
  },
  {
    code: '318',
    label: {
      en: 'Build-operate-transfer and leased health and education facility projects (provisional 29)',
      tr: 'Geçici 29 3996 Sayılı Kanuna Göre Yap-İşlet-Devret Modeli Çerçevesinde Gerçekleştirilecek Projeler, 3359 Sayılı Kanuna Göre Kiralama Karşılığı Yaptırılan Sağlık Tesislerine İlişkin Projeler ve 652 Sayılı Kanun Hükmünde Kararnameye Göre Kiralama Karşılığı Yaptırılan Eğitim Öğretim Tesislerine İlişkin Projelere İlişkin Teslim ve Hizmetler',
    },
  },
  {
    code: '319',
    label: {
      en: 'Vehicle deliveries to the Prime Ministry central organisation (13/g)',
      tr: '13/g Başbakanlık Merkez Teşkilatına Yapılan Araç Teslimleri',
    },
  },
  {
    code: '320',
    label: {
      en: 'Deliveries and services to the Istanbul Project Coordination Unit under ISMEP',
      tr: 'Geçici 16 (6111 sayılı K.) İSMEP Kapsamında İstanbul İl Özel İdaresi\'ne Bağlı Olarak Faaliyet Gösteren "İstanbul Proje Koordinasyon Birimi"ne Yapılacak Teslim ve Hizmetler',
    },
  },
  {
    code: '321',
    label: {
      en: 'Deliveries and services for UN, NATO and OECD bodies and their social and economic aid',
      tr: 'Geçici 26 Birleşmiş Milletler (BM) ile Kuzey Atlantik Antlaşması Teşkilatı (NATO) Temsilcilikleri ve Bu Teşkilatlara Bağlı Program, Fon ve Özel İhtisas Kuruluşları ile İktisadi İşbirliği ve Kalkınma Teşkilatına (OECD) Resmi Kullanımları İçin Yapılacak Mal Teslimi ve Hizmet İfaları, Bunların Sosyal ve Ekonomik Yardım Amacıyla Bedelsiz Olarak Yapacakları Mal Teslimi ve Hizmet İfaları İle İlgili Bunlara Yapılan Mal Teslimi ve Hizmet İfaları',
    },
  },
  {
    code: '322',
    label: {
      en: 'Special-invoice deliveries to non-residents: suitcase trade (11/1-a)',
      tr: "11/1-a Türkiye'de İkamet Etmeyenlere Özel Fatura ile Yapılan Teslimler (Bavul Ticareti)",
    },
  },
  {
    code: '323',
    label: {
      en: 'First deliveries of product certificates through exchanges (13/ğ)',
      tr: '13/ğ 5300 Sayılı Kanuna Göre Düzenlenen Ürün Senetlerinin İhtisas/Ticaret Borsaları Aracılığıyla İlk Teslimi',
    },
  },
  {
    code: '324',
    label: {
      en: 'Deliveries and services to and by the Turkish Red Crescent (13/h)',
      tr: '13/h Türkiye Kızılay Derneğine Yapılan Teslim ve Hizmetler ile Türkiye Kızılay Derneğinin Teslim ve Hizmetleri',
    },
  },
  { code: '325', label: { en: 'Feed deliveries (13/ı)', tr: '13/ı Yem Teslimleri' } },
  {
    code: '326',
    label: {
      en: 'Registered fertiliser deliveries (13/ı)',
      tr: '13/ı Gıda, Tarım ve Hayvancılık Bakanlığı Tarafından Tescil Edilmiş Gübrelerin Teslimi',
    },
  },
  {
    code: '327',
    label: {
      en: 'Fertiliser raw-material deliveries to producers (13/ı)',
      tr: '13/ı Gıda, Tarım ve Hayvancılık Bakanlığı Tarafından Tescil Edilmiş Gübrelerin İçeriğinde Bulunan Hammaddelerin Gübre Üreticilerine Teslimi',
    },
  },
  {
    code: '328',
    label: { en: 'Housing or workplace deliveries (13/i)', tr: '13/i Konut veya İşyeri Teslimleri' },
  },
  {
    code: '329',
    label: {
      en: 'Deliveries and services to the education ministry under FATİH',
      tr: 'Eğitimde Fırsatları Artırma ve Teknolojiyi İyileştirme Hareketi (FATİH) projesi Kapsamında Milli Eğitim Bakanlığına Yapılacak Mal Teslimi ve Hizmet İfası',
    },
  },
  {
    code: '330',
    label: {
      en: 'Construction of organised industrial zones and small industrial sites (13/j)',
      tr: 'KDV 13/j md. Organize Sanayi Bölgeleri ile Küçük Sanayi Sitelerinin İnşasına İlişkin Teslim ve Hizmetler',
    },
  },
  {
    code: '331',
    label: {
      en: 'New machinery and equipment for research, innovation and design (13/m)',
      tr: 'KDV 13/m md. Ar-Ge, Yenilik ve Tasarım Faaliyetlerinde Kullanılmak Üzere Yapılan Yeni Makina ve Teçhizat Teslimlerinde İstisna',
    },
  },
  {
    code: '332',
    label: {
      en: 'New machinery and equipment for manufacturing (provisional 39)',
      tr: 'KDV Geçici 39. Md. İmalat Sanayiinde Kullanılmak Üzere Yapılan Yeni Makina ve Teçhizat Teslimlerinde İstisna',
    },
  },
  {
    code: '333',
    label: {
      en: 'Construction of facilities donated to public bodies (13/k)',
      tr: 'KDV 13/k md. Kapsamında Genel ve Özel Bütçeli Kamu İdarelerine, İl Özel İdarelerine, Belediyelere ve Köylere bağışlanan Tesislerin İnşasına İlişkin İstisna',
    },
  },
  {
    code: '334',
    label: {
      en: 'Health services to foreigners (13/l)',
      tr: 'KDV 13/l md. Kapsamında Yabancılara Verilen Sağlık Hizmetlerinde İstisna',
    },
  },
  {
    code: '335',
    label: {
      en: 'Printed books and periodicals (13/n)',
      tr: 'KDV 13/n Basılı Kitap ve Süreli Yayınların Teslimleri',
    },
  },
  {
    code: '336',
    label: {
      en: 'Deliveries and services for UEFA competitions (provisional 46)',
      tr: 'Geçici 46 UEFA Müsabakaları Kapsamında Yapılacak Teslim ve Hizmetler',
    },
  },
  {
    code: '337',
    label: {
      en: 'Gas transport under Article 9/h of the TurkStream agreement',
      tr: 'Türk Akım Gaz Boru Hattı Projesine İlişkin Anlaşmanın (9/h) Maddesi Kapsamındaki Gaz Taşıma Hizmetleri',
    },
  },
  { code: '338', label: { en: "Manufacturers' exports of goods", tr: 'İmalatçıların Mal İhracatları' } },
  {
    code: '339',
    label: {
      en: 'Construction under manufacturing and tourism investment incentive certificates',
      tr: 'İmalat Sanayii ile Turizme Yönelik Yatırım Teşvik Belgesi Kapsamındaki İnşaat İşlerine İlişkin Teslim ve Hizmetler',
    },
  },
  {
    code: '340',
    label: {
      en: 'Engineering services for electric vehicle development',
      tr: 'Elektrik Motorlu Taşıt Araçlarının Geliştirilmesine Yönelik Mühendislik Hizmetleri',
    },
  },
  {
    code: '341',
    label: {
      en: 'Construction of housing to be donated to disaster victims',
      tr: 'Afetzedelere Bağışlanacak Konutların İnşasına İlişkin İstisna',
    },
  },
  {
    code: '342',
    label: {
      en: 'Construction of property to be donated to general-budget public bodies',
      tr: 'Genel Bütçeli Kamu İdarelerine Bağışlanacak Taşınmazların İnşasına İlişkin İstisna',
    },
  },
  {
    code: '343',
    label: {
      en: 'Housing deliveries to foreign state bodies for donation to general-budget public bodies',
      tr: 'Genel Bütçeli Kamu İdarelerine Bağışlanacak Konutların Yabancı Devlet Kurum ve Kuruluşlarına Teslimine İlişkin İstisna',
    },
  },
  {
    code: '344',
    label: {
      en: 'Vehicle deliveries for national defence and internal security (13/o)',
      tr: '13/o Milli Savunma ve İç Güvenlik İhtiyaçlarında Kullanılmak Üzere Taşıt Teslimi',
    },
  },
  { code: '350', label: { en: 'Other exemptions', tr: 'Diğerleri' } },
  { code: '351', label: { en: 'VAT: other, not exempt', tr: 'KDV - İstisna Olmayan Diğer' } },
  {
    code: '501',
    label: {
      en: 'Sales to non-resident travellers (11/1-b)',
      tr: '11/1-b Türkiye’de İkamet Etmeyen Yolculara Yapılan Satışlar',
    },
  },
  {
    code: '555',
    label: { en: 'Sales not subject to VAT rate control', tr: 'KDV Oran Kontrolüne Tabi Olmayan Satışlar' },
  },
  {
    code: '701',
    label: {
      en: 'Export-registered sales under VAT Law 3065, Article 11/1-c',
      tr: '3065 s. KDV Kanununun 11/1-c md. Kapsamındaki İhraç Kayıtlı Satış',
    },
  },
  {
    code: '702',
    label: {
      en: 'Sales under inward processing certificates and temporary admission',
      tr: 'DİİB ve Geçici Kabul Rejimi Kapsamındaki Satışlar',
    },
  },
  {
    code: '703',
    label: {
      en: 'Export-registered sales under SCT Law 4760, Article 8/2',
      tr: '4760 s. ÖTV Kanununun 8/2 Md. Kapsamındaki İhraç Kayıtlı Satış',
    },
  },
  {
    code: '704',
    label: {
      en: 'Export-registered sales under VAT Article 11/1-c and SCT Article 8/2',
      tr: '3065 sayılı KDV Kanununun (11/1-c) maddesi ve 4760 s. Ötv Kanununun 8/2. Md. Kapsamındaki İhraç Kayıtlı Satış',
    },
  },
  {
    code: '801',
    label: {
      en: 'National lottery, Sports Toto and similar games',
      tr: 'Milli Piyango, Spor Toto vb. Oyunlar',
    },
  },
  {
    code: '802',
    label: {
      en: 'Horse racing and other pooled betting and games of chance',
      tr: 'At Yarışları ve Diğer Müşterek Bahis ve Talih Oyunları',
    },
  },
  {
    code: '803',
    label: {
      en: 'Professional artistic performances, concerts and sporting events',
      tr: 'Profesyonel Sanatçıların Yer Aldığı Gösteriler, Konserler, Profesyonel Sporcuların Katıldığı Sportif Faaliyetler, Maçlar, Yarışlar ve Yarışmalar',
    },
  },
  {
    code: '804',
    label: {
      en: 'Sales in customs warehouses and auction premises',
      tr: 'Gümrük Depolarında ve Müzayede Mahallerinde Yapılan Satışlar',
    },
  },
  {
    code: '805',
    label: {
      en: 'Gold jewellery and gold coin deliveries',
      tr: 'Altından Mamül veya Altın İçeren Ziynet Eşyaları İle Sikke Altınların Teslimi',
    },
  },
  { code: '806', label: { en: 'Tobacco products', tr: 'Tütün Mamülleri' } },
  {
    code: '807',
    label: {
      en: 'Newspapers and periodicals subject to harmful-publications rules',
      tr: 'Muzır Neşriyat Kapsamındaki Gazete, Dergi vb. Periyodik Yayınlar',
    },
  },
  {
    code: '808',
    label: {
      en: 'Silver jewellery and silver coin deliveries',
      tr: 'Gümüşten Mamul veya Gümüş İçeren Ziynet Eşyaları ile Sikke Gümüşlerin Teslimi',
    },
  },
  {
    code: '809',
    label: {
      en: 'Dealer sales of municipal urban passenger transport tickets and cards',
      tr: 'Belediyeler Tarafından Yapılan Şehir İçi Yolcu Taşımacılığında Kullanılan Biletlerin ve Kartların Bayiler Tarafından Satışı',
    },
  },
  {
    code: '810',
    label: {
      en: 'Prepaid electronic communications services',
      tr: 'Ön Ödemeli Elektronik Haberleşme Hizmetleri',
    },
  },
  {
    code: '811',
    label: {
      en: 'TŞOF deliveries of vehicle plates and driving-school documents',
      tr: 'TŞOF Tarafından Araç Plakaları ile Sürücü Kurslarında Kullanılan Bir Kısım Evrakın Teslimi',
    },
  },
  {
    code: '812',
    label: {
      en: 'Deliveries of used motor vehicles or property purchased without VAT',
      tr: 'KDV Uygulanmadan Alınan İkinci El Motorlu Kara Taşıtı veya Taşınmaz Teslimi',
    },
  },
] as const;
/** Verified exemption reasons; English labels are literal translations.
 * @example
 * EXEMPTION_CODES.get("001");
 */
export const EXEMPTION_CODES: ReadonlyMap<string, CodeInfo> = new Map(
  entries.map((entry) => [entry.code, entry]),
);
