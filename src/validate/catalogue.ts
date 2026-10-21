import type { IssueCode, Severity, Label } from '../types';

/** Metadata and bilingual templates for one issue code (TRD §9.3).
 * @example
 * const definition: IssueDefinition = ISSUE_CATALOGUE.EF001;
 */
export type IssueDefinition = {
  severity: Severity;
  category: 'identity' | 'parties' | 'currency' | 'amounts' | 'totals' | 'lines' | 'taxes' | 'batch';
  kind: 'M' | 'V' | 'B';
  message: string;
  messageTr: string;
  variants?: Readonly<Record<string, Label>>;
};

/** Every issue code in normative catalogue order.
 * @example
 * ISSUE_CODES.includes('EF001'); // true
 */
export const ISSUE_CODES = [
  'EF001',
  'EF002',
  'EF003',
  'EF004',
  'EF005',
  'EF006',
  'EF007',
  'EF008',
  'EF009',
  'EF010',
  'EF011',
  'EF012',
  'EF013',
  'EF014',
  'EF015',
  'EF016',
  'EF017',
  'EF020',
  'EF021',
  'EF022',
  'EF023',
  'EF024',
  'EF025',
  'EF026',
  'EF030',
  'EF031',
  'EF032',
  'EF035',
  'EF040',
  'EF041',
  'EF042',
  'EF043',
  'EF044',
  'EF045',
  'EF046',
  'EF047',
  'EF048',
  'EF049',
  'EF050',
  'EF051',
  'EF052',
  'EF053',
  'EF054',
  'EF055',
  'EF060',
  'EF061',
  'EF062',
  'EF063',
  'EF064',
  'EF065',
  'EF066',
  'EF090',
  'EF091',
] as const;

/** Issue severities, categories, kinds and byte-exact bilingual templates.
 * @example
 * ISSUE_CATALOGUE.EF001.severity; // 'error'
 */
export const ISSUE_CATALOGUE: Readonly<Record<IssueCode, IssueDefinition>> = {
  EF001: {
    severity: 'error',
    category: 'identity',
    kind: 'V',
    message: 'Required field {field} is missing.',
    messageTr: 'Zorunlu alan {field} eksik.',
  },
  EF002: {
    severity: 'error',
    category: 'identity',
    kind: 'V',
    message: 'UUID {value} is not in the 8-4-4-4-12 hexadecimal format.',
    messageTr: 'ETTN {value}, 8-4-4-4-12 onaltılık biçiminde değil.',
  },
  EF003: {
    severity: 'warning',
    category: 'identity',
    kind: 'V',
    message:
      'Invoice number {value} does not have the 16-character format (3 letters or digits, 4-digit year, 9-digit sequence).',
    messageTr:
      'Fatura numarası {value} 16 karakterlik biçimde değil (3 harf veya rakam, 4 haneli yıl, 9 haneli sıra numarası).',
    variants: {
      pattern: {
        en: 'Invoice number {value} does not have the 16-character format (3 letters or digits, 4-digit year, 9-digit sequence).',
        tr: 'Fatura numarası {value} 16 karakterlik biçimde değil (3 harf veya rakam, 4 haneli yıl, 9 haneli sıra numarası).',
      },
      year: {
        en: 'Invoice number {value} contains the year {numberYear}, but the issue date is in {dateYear}.',
        tr: 'Fatura numarası {value} {numberYear} yılını içeriyor, ancak düzenleme tarihi {dateYear} yılında.',
      },
    },
  },
  EF004: {
    severity: 'error',
    category: 'identity',
    kind: 'V',
    message: 'Issue date {value} is not a valid date in YYYY-MM-DD format.',
    messageTr: 'Düzenleme tarihi {value}, YYYY-AA-GG biçiminde geçerli bir tarih değil.',
  },
  EF005: {
    severity: 'warning',
    category: 'identity',
    kind: 'V',
    message: 'Issue time {value} is not a valid time in hh:mm:ss format.',
    messageTr: 'Düzenleme saati {value}, ss:dd:sn biçiminde geçerli bir saat değil.',
  },
  EF006: {
    severity: 'warning',
    category: 'identity',
    kind: 'V',
    message: 'Profile {value} is not in the known profile list; it is reported as OTHER.',
    messageTr: 'Senaryo {value} bilinen senaryo listesinde yok; OTHER olarak raporlandı.',
  },
  EF007: {
    severity: 'warning',
    category: 'identity',
    kind: 'V',
    message: 'Invoice type {value} is not in the known type list; it is reported as OTHER.',
    messageTr: 'Fatura tipi {value} bilinen tip listesinde yok; OTHER olarak raporlandı.',
  },
  EF008: {
    severity: 'info',
    category: 'identity',
    kind: 'V',
    message: '{field} is {value}; expected {expected}.',
    messageTr: '{field} değeri {value}; beklenen {expected}.',
  },
  EF009: {
    severity: 'warning',
    category: 'identity',
    kind: 'M',
    message: 'Element is not in the expected namespace {expected}; it was matched by its local name.',
    messageTr: 'Eleman beklenen {expected} ad alanında değil; yerel adıyla eşleştirildi.',
  },
  EF010: {
    severity: 'error',
    category: 'parties',
    kind: 'V',
    message: 'The supplier has no VKN or TCKN.',
    messageTr: 'Satıcının VKN veya TCKN bilgisi yok.',
  },
  EF011: {
    severity: 'error',
    category: 'parties',
    kind: 'V',
    message: 'The customer has no VKN or TCKN.',
    messageTr: 'Alıcının VKN veya TCKN bilgisi yok.',
  },
  EF012: {
    severity: 'error',
    category: 'parties',
    kind: 'V',
    message: 'VKN {value} fails the checksum.',
    messageTr: 'VKN {value} kontrol hanesi doğrulamasından geçmiyor.',
  },
  EF013: {
    severity: 'error',
    category: 'parties',
    kind: 'V',
    message: 'TCKN {value} fails the checksum.',
    messageTr: 'TCKN {value} kontrol hanesi doğrulamasından geçmiyor.',
  },
  EF014: {
    severity: 'error',
    category: 'parties',
    kind: 'V',
    message:
      '{scheme} {value} has the wrong format: a VKN has 10 digits; a TCKN has 11 digits and does not start with 0.',
    messageTr:
      '{scheme} {value} hatalı biçimde: VKN 10 haneli olmalı; TCKN 11 haneli olmalı ve 0 ile başlamamalı.',
  },
  EF015: {
    severity: 'info',
    category: 'parties',
    kind: 'M',
    message: 'Identifier {value} has no schemeID; it was read as {scheme} from its length.',
    messageTr: '{value} tanımlayıcısında schemeID yok; uzunluğundan {scheme} olarak okundu.',
    variants: {
      missing: {
        en: 'Identifier {value} has no schemeID; it was read as {scheme} from its length.',
        tr: '{value} tanımlayıcısında schemeID yok; uzunluğundan {scheme} olarak okundu.',
      },
      case: {
        en: 'schemeID {schemeId} is not upper-case; it was read as {scheme}.',
        tr: 'schemeID {schemeId} büyük harfle yazılmamış; {scheme} olarak okundu.',
      },
    },
  },
  EF016: {
    severity: 'info',
    category: 'parties',
    kind: 'V',
    message: 'TCKN 11111111111 is the placeholder for an anonymous final consumer.',
    messageTr: '11111111111 TCKN, kimliği belirtilmeyen nihai tüketici için kullanılan yer tutucudur.',
  },
  EF017: {
    severity: 'warning',
    category: 'parties',
    kind: 'V',
    message: 'The {role} has no name (neither PartyName nor Person).',
    messageTr: '{role} için ad yok (PartyName veya Person bulunmuyor).',
  },
  EF020: {
    severity: 'error',
    category: 'currency',
    kind: 'V',
    message: 'Currency code {value} is not an active ISO 4217 code.',
    messageTr: 'Döviz kodu {value} geçerli bir ISO 4217 kodu değil.',
    variants: {
      alias: {
        en: 'Currency code {value} is not valid; use TRY.',
        tr: 'Döviz kodu {value} geçerli değil; TRY kullanılmalı.',
      },
    },
  },
  EF021: {
    severity: 'warning',
    category: 'currency',
    kind: 'V',
    message: '{count} amounts use a currency other than the document currency {currency} (first at {first}).',
    messageTr:
      '{count} tutar, belge para birimi {currency} dışında bir para birimi kullanıyor (ilki: {first}).',
  },
  EF022: {
    severity: 'error',
    category: 'currency',
    kind: 'V',
    message: 'The invoice is in {currency} but has no exchange rate.',
    messageTr: 'Fatura {currency} cinsinden, ancak döviz kuru içermiyor.',
  },
  EF023: {
    severity: 'warning',
    category: 'currency',
    kind: 'M',
    message: 'Exchange rate {rate} was taken from {source}, not from PricingExchangeRate.',
    messageTr: '{rate} döviz kuru PricingExchangeRate yerine {source} kaynağından alındı.',
  },
  EF024: {
    severity: 'error',
    category: 'currency',
    kind: 'V',
    message: 'Exchange rate {value} is not a positive number.',
    messageTr: 'Döviz kuru {value} pozitif bir sayı değil.',
  },
  EF025: {
    severity: 'warning',
    category: 'currency',
    kind: 'V',
    message: 'PricingExchangeRate converts {source} to {target}; expected {currency} to TRY.',
    messageTr:
      'PricingExchangeRate {source} para biriminden {target} para birimine çeviriyor; beklenen {currency} → TRY.',
  },
  EF026: {
    severity: 'info',
    category: 'currency',
    kind: 'V',
    message: 'The invoice is in TRY but has an exchange rate of {rate}.',
    messageTr: 'Fatura TRY cinsinden, ancak {rate} döviz kuru içeriyor.',
  },
  EF030: {
    severity: 'error',
    category: 'amounts',
    kind: 'M',
    message: '{value} is not a valid number.',
    messageTr: '{value} geçerli bir sayı değil.',
  },
  EF031: {
    severity: 'warning',
    category: 'amounts',
    kind: 'M',
    message: '{value} uses a decimal comma; it was read as {normalized}.',
    messageTr: '{value} ondalık ayırıcı olarak virgül kullanıyor; {normalized} olarak okundu.',
  },
  EF032: {
    severity: 'warning',
    category: 'amounts',
    kind: 'M',
    message: 'Amount {value} has no currencyID.',
    messageTr: '{value} tutarında currencyID yok.',
  },
  EF035: {
    severity: 'warning',
    category: 'amounts',
    kind: 'M',
    message: 'Declared encoding {declared} is not supported; the file was read as UTF-8.',
    messageTr: 'Bildirilen {declared} kodlaması desteklenmiyor; dosya UTF-8 olarak okundu.',
    variants: {
      unsupported: {
        en: 'Declared encoding {declared} is not supported; the file was read as UTF-8.',
        tr: 'Bildirilen {declared} kodlaması desteklenmiyor; dosya UTF-8 olarak okundu.',
      },
      fallback: {
        en: 'The file is not valid UTF-8 and declares no encoding; it was read as windows-1254.',
        tr: 'Dosya geçerli UTF-8 değil ve kodlama bildirmiyor; windows-1254 olarak okundu.',
      },
    },
  },
  EF040: {
    severity: 'error',
    category: 'totals',
    kind: 'V',
    message: 'Sum of line amounts is {computed}, but LineExtensionAmount is {declared}.',
    messageTr: 'Satır tutarlarının toplamı {computed}, ancak LineExtensionAmount {declared}.',
  },
  EF041: {
    severity: 'warning',
    category: 'totals',
    kind: 'V',
    message:
      'LineExtensionAmount − allowances + charges is {computed}, but TaxExclusiveAmount is {declared}.',
    messageTr:
      'LineExtensionAmount − iskontolar + artırımlar {computed}, ancak TaxExclusiveAmount {declared}.',
  },
  EF042: {
    severity: 'error',
    category: 'totals',
    kind: 'V',
    message: 'TaxExclusiveAmount + taxes is {computed}, but TaxInclusiveAmount is {declared}.',
    messageTr: 'TaxExclusiveAmount + vergiler {computed}, ancak TaxInclusiveAmount {declared}.',
  },
  EF043: {
    severity: 'error',
    category: 'totals',
    kind: 'V',
    message: 'TaxInclusiveAmount − withholding + rounding is {computed}, but PayableAmount is {declared}.',
    messageTr: 'TaxInclusiveAmount − tevkifat + yuvarlama {computed}, ancak PayableAmount {declared}.',
  },
  EF044: {
    severity: 'warning',
    category: 'totals',
    kind: 'V',
    message:
      'PayableAmount {declared} equals TaxInclusiveAmount + rounding; the withholding of {withholding} was not deducted.',
    messageTr:
      'PayableAmount {declared}, TaxInclusiveAmount + yuvarlama tutarına eşit; {withholding} tutarındaki tevkifat düşülmemiş.',
  },
  EF045: {
    severity: 'error',
    category: 'totals',
    kind: 'V',
    message: 'Sum of tax subtotals is {computed}, but TaxAmount is {declared}.',
    messageTr: 'Vergi alt toplamlarının toplamı {computed}, ancak TaxAmount {declared}.',
  },
  EF046: {
    severity: 'warning',
    category: 'totals',
    kind: 'V',
    message: 'TaxableAmount × Percent is {computed}, but TaxAmount is {declared}.',
    messageTr: 'TaxableAmount × Percent {computed}, ancak TaxAmount {declared}.',
  },
  EF047: {
    severity: 'warning',
    category: 'totals',
    kind: 'V',
    message: 'Quantity × price − allowances + charges is {computed}, but the line amount is {declared}.',
    messageTr: 'Miktar × fiyat − iskontolar + artırımlar {computed}, ancak satır tutarı {declared}.',
  },
  EF048: {
    severity: 'warning',
    category: 'totals',
    kind: 'V',
    message: 'Sum of line taxes is {computed}, but invoice taxes are {declared}.',
    messageTr: 'Satır vergilerinin toplamı {computed}, ancak fatura vergileri {declared}.',
  },
  EF049: {
    severity: 'warning',
    category: 'totals',
    kind: 'V',
    message: 'LineCountNumeric is {declared}, but the invoice has {computed} lines.',
    messageTr: 'LineCountNumeric {declared}, ancak faturada {computed} satır var.',
  },
  EF050: {
    severity: 'error',
    category: 'lines',
    kind: 'V',
    message: 'The invoice has no lines.',
    messageTr: 'Faturada satır yok.',
  },
  EF051: {
    severity: 'error',
    category: 'lines',
    kind: 'V',
    message: 'Line ID {value} is used more than once.',
    messageTr: '{value} satır numarası birden fazla kullanılmış.',
  },
  EF052: {
    severity: 'warning',
    category: 'lines',
    kind: 'V',
    message: 'Quantity {value} is negative.',
    messageTr: 'Miktar {value} negatif.',
  },
  EF053: {
    severity: 'info',
    category: 'lines',
    kind: 'V',
    message: 'Unit code {value} is not in the known unit list.',
    messageTr: 'Birim kodu {value} bilinen birim listesinde yok.',
  },
  EF054: {
    severity: 'warning',
    category: 'lines',
    kind: 'V',
    message: 'Line {position} has no ID.',
    messageTr: '{position}. satırın numarası yok.',
  },
  EF055: {
    severity: 'warning',
    category: 'lines',
    kind: 'V',
    message: 'Line {position} has no item name.',
    messageTr: '{position}. satırda mal/hizmet adı yok.',
  },
  EF060: {
    severity: 'warning',
    category: 'taxes',
    kind: 'V',
    message: 'Tax type code {value} is not in the known tax list.',
    messageTr: 'Vergi kodu {value} bilinen vergi listesinde yok.',
  },
  EF061: {
    severity: 'warning',
    category: 'taxes',
    kind: 'V',
    message: 'VAT at {percent} % has no exemption reason code.',
    messageTr: '%{percent} oranlı KDV için istisna kodu yok.',
  },
  EF062: {
    severity: 'warning',
    category: 'taxes',
    kind: 'V',
    message: '{value} invoices need a VAT exemption reason code, but none is given.',
    messageTr: '{value} faturalarında KDV istisna kodu bulunmalı, ancak yok.',
  },
  EF063: {
    severity: 'error',
    category: 'taxes',
    kind: 'V',
    message: 'Invoice type {value} requires withholding (WithholdingTaxTotal), but none is given.',
    messageTr: '{value} tipindeki faturada tevkifat (WithholdingTaxTotal) bulunmalı, ancak yok.',
  },
  EF064: {
    severity: 'warning',
    category: 'taxes',
    kind: 'V',
    message: 'The invoice has withholding, but its type is {value}.',
    messageTr: 'Faturada tevkifat var, ancak tipi {value}.',
  },
  EF065: {
    severity: 'info',
    category: 'taxes',
    kind: 'V',
    message: 'Withholding code {value} is not in the known withholding list.',
    messageTr: 'Tevkifat kodu {value} bilinen tevkifat listesinde yok.',
  },
  EF066: {
    severity: 'warning',
    category: 'taxes',
    kind: 'V',
    message: 'The invoice has no invoice-level TaxTotal.',
    messageTr: 'Faturada fatura düzeyinde TaxTotal yok.',
  },
  EF090: {
    severity: 'warning',
    category: 'batch',
    kind: 'B',
    message: 'UUID {value} also appears in {firstSource}.',
    messageTr: '{value} ETTN, {firstSource} dosyasında da var.',
  },
  EF091: {
    severity: 'info',
    category: 'batch',
    kind: 'B',
    message: 'Invoice number {number} from this supplier also appears with a different UUID ({firstUuid}).',
    messageTr: 'Bu satıcının {number} numaralı faturası farklı bir ETTN ile de var ({firstUuid}).',
  },
};
