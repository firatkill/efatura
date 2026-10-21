import type { EfaturaParseErrorCode } from './errors';
import type { XmlElement } from './xml/tree';

/** Decimal public data contract (TRD §§5 and 7).
 * @example
 * import type { Decimal } from '@firatkill/efatura';
 */
export type Decimal = string;
/** Severity public data contract (TRD §§5 and 7).
 * @example
 * import type { Severity } from '@firatkill/efatura';
 */
export type Severity = 'error' | 'warning' | 'info';

/** Label public data contract (TRD §§5 and 7).
 * @example
 * import type { Label } from '@firatkill/efatura';
 */
export interface Label {
  en: string;
  tr: string;
}

/** Amount public data contract (TRD §§5 and 7).
 * @example
 * import type { Amount } from '@firatkill/efatura';
 */
export interface Amount {
  /** Decimal string as written (section 7.1); null when the text is not a decimal. */
  value: Decimal | null;
  /** Trimmed text as written. */
  raw: string;
  /** currencyID attribute (upper-case) or null. */
  currency: string | null;
}

/** UnitInfo public data contract (TRD §§5 and 7).
 * @example
 * import type { UnitInfo } from '@firatkill/efatura';
 */
export interface UnitInfo {
  code: string;
  label: Label;
}

/** Quantity public data contract (TRD §§5 and 7).
 * @example
 * import type { Quantity } from '@firatkill/efatura';
 */
export interface Quantity {
  value: Decimal | null;
  raw: string;
  unitCode: string | null;
  unit: UnitInfo | null;
}

/** ProfileId public data contract (TRD §§5 and 7).
 * @example
 * import type { ProfileId } from '@firatkill/efatura';
 */
export type ProfileId =
  | 'TEMELFATURA'
  | 'TICARIFATURA'
  | 'EARSIVFATURA'
  | 'IHRACAT'
  | 'YOLCUBERABERFATURA'
  | 'KAMU'
  | 'HKS'
  | 'ENERJI'
  | 'ILAC_TIBBICIHAZ'
  | 'YATIRIMTESVIK'
  | 'OZELFATURA'
  | 'IDIS'
  | 'OTHER';

/** InvoiceTypeCode public data contract (TRD §§5 and 7).
 * @example
 * import type { InvoiceTypeCode } from '@firatkill/efatura';
 */
export type InvoiceTypeCode =
  | 'SATIS'
  | 'IADE'
  | 'TEVKIFAT'
  | 'TEVKIFATIADE'
  | 'ISTISNA'
  | 'OZELMATRAH'
  | 'IHRACKAYITLI'
  | 'SGK'
  | 'KOMISYONCU'
  | 'HKSSATIS'
  | 'HKSKOMISYONCU'
  | 'KONAKLAMAVERGISI'
  | 'SARJ'
  | 'SARJANLIK'
  | 'TEKNOLOJIDESTEK'
  | 'YTBSATIS'
  | 'YTBIADE'
  | 'YTBISTISNA'
  | 'YTBTEVKIFAT'
  | 'YTBTEVKIFATIADE'
  | 'OTHER';

/** TaxKind public data contract (TRD §§5 and 7).
 * @example
 * import type { TaxKind } from '@firatkill/efatura';
 */
export type TaxKind = 'KDV' | 'OTV' | 'OIV' | 'DAMGA' | 'KONAKLAMA' | 'STOPAJ' | 'KDV_WITHHOLDING' | 'OTHER';

/** TaxTypeInfo public data contract (TRD §§5 and 7).
 * @example
 * import type { TaxTypeInfo } from '@firatkill/efatura';
 */
export interface TaxTypeInfo {
  code: string;
  short: string;
  label: Label;
  kind: TaxKind;
}
/** CodeInfo public data contract (TRD §§5 and 7).
 * @example
 * import type { CodeInfo } from '@firatkill/efatura';
 */
export interface CodeInfo {
  code: string;
  label: Label;
}

/** ExchangeRateSource public data contract (TRD §§5 and 7).
 * @example
 * import type { ExchangeRateSource } from '@firatkill/efatura';
 */
export type ExchangeRateSource =
  | 'PricingExchangeRate'
  | 'TaxExchangeRate'
  | 'PaymentExchangeRate'
  | 'PaymentAlternativeExchangeRate'
  | 'Note';

/** ExchangeRate public data contract (TRD §§5 and 7).
 * @example
 * import type { ExchangeRate } from '@firatkill/efatura';
 */
export interface ExchangeRate {
  sourceCurrency: string | null;
  targetCurrency: string | null;
  rate: Decimal | null;
  rateRaw: string;
  date: string | null;
  source: ExchangeRateSource;
}

/** DueDate public data contract (TRD §§5 and 7).
 * @example
 * import type { DueDate } from '@firatkill/efatura';
 */
export interface DueDate {
  date: string;
  source: 'PaymentMeans' | 'PaymentTerms' | 'Note';
}

/** InvoicePeriod public data contract (TRD §§5 and 7).
 * @example
 * import type { InvoicePeriod } from '@firatkill/efatura';
 */
export interface InvoicePeriod {
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

/** DocumentReference public data contract (TRD §§5 and 7).
 * @example
 * import type { DocumentReference } from '@firatkill/efatura';
 */
export interface DocumentReference {
  id: string | null;
  issueDate: string | null;
  documentTypeCode: string | null;
  documentType: string | null;
  descriptions: string[];
}

/** Attachment public data contract (TRD §§5 and 7).
 * @example
 * import type { Attachment } from '@firatkill/efatura';
 */
export interface Attachment extends DocumentReference {
  filename: string | null;
  mimeCode: string | null;
  encodingCode: string | null;
  characterSetCode: string | null;
  /** True when this attachment is the XSLT for the official view (section 7.8.5). */
  isXslt: boolean;
  /** Decoded size in bytes, computed from the base64 length. */
  size: number;
  /** Base64 text with whitespace removed; null when parsed with attachments: 'metadata'. */
  base64: string | null;
  /** cac:Attachment/cac:ExternalReference/cbc:URI; never fetched. */
  externalUri: string | null;
}

/** PersonName public data contract (TRD §§5 and 7).
 * @example
 * import type { PersonName } from '@firatkill/efatura';
 */
export interface PersonName {
  firstName: string | null;
  middleName: string | null;
  familyName: string | null;
  title: string | null;
  nameSuffix: string | null;
  nationalityId: string | null;
  identityDocumentId: string | null;
}

/** TaxId public data contract (TRD §§5 and 7).
 * @example
 * import type { TaxId } from '@firatkill/efatura';
 */
export interface TaxId {
  scheme: 'VKN' | 'TCKN';
  value: string;
  /** schemeID as written, or null when inferred. */
  schemeRaw: string | null;
  /** True when the scheme was inferred from the length. */
  inferred: boolean;
}

/** PartyIdentifier public data contract (TRD §§5 and 7).
 * @example
 * import type { PartyIdentifier } from '@firatkill/efatura';
 */
export interface PartyIdentifier {
  schemeId: string | null;
  value: string;
}

/** Address public data contract (TRD §§5 and 7).
 * @example
 * import type { Address } from '@firatkill/efatura';
 */
export interface Address {
  id: string | null;
  postbox: string | null;
  room: string | null;
  streetName: string | null;
  blockName: string | null;
  buildingName: string | null;
  buildingNumber: string | null;
  district: string | null; // cbc:District (mahalle/semt)
  citySubdivisionName: string | null; // ilçe
  cityName: string | null; // il
  postalZone: string | null;
  region: string | null;
  countryCode: string | null;
  countryName: string | null;
}

/** Contact public data contract (TRD §§5 and 7).
 * @example
 * import type { Contact } from '@firatkill/efatura';
 */
export interface Contact {
  name: string | null;
  telephone: string | null;
  telefax: string | null;
  email: string | null;
  note: string | null;
}

/** Party public data contract (TRD §§5 and 7).
 * @example
 * import type { Party } from '@firatkill/efatura';
 */
export interface Party {
  name: string | null;
  person: PersonName | null;
  /** name, else "first middle family" joined with single spaces, else null. */
  displayName: string | null;
  taxId: TaxId | null;
  identifiers: PartyIdentifier[];
  taxOffice: string | null;
  address: Address | null;
  websiteUri: string | null;
  contact: Contact | null;
}

/** AllowanceCharge public data contract (TRD §§5 and 7).
 * @example
 * import type { AllowanceCharge } from '@firatkill/efatura';
 */
export interface AllowanceCharge {
  isCharge: boolean | null;
  reasonCode: string | null;
  reason: string | null;
  multiplierFactor: Decimal | null;
  amount: Amount | null;
  baseAmount: Amount | null;
}

/** TaxSubtotal public data contract (TRD §§5 and 7).
 * @example
 * import type { TaxSubtotal } from '@firatkill/efatura';
 */
export interface TaxSubtotal {
  taxableAmount: Amount | null;
  taxAmount: Amount | null;
  percent: Decimal | null;
  calculationSequence: string | null;
  perUnitAmount: Amount | null;
  baseUnitMeasure: Quantity | null;
  categoryName: string | null;
  exemptionReasonCode: string | null;
  exemptionReason: string | null;
  exemption: CodeInfo | null;
  taxSchemeName: string | null;
  taxTypeCode: string | null;
  /** From TAX_TYPES (tax totals) or WITHHOLDING_CODES (withholding totals); null when unknown. */
  taxType: TaxTypeInfo | null;
  /** Withholding totals only: "5/10" when percent is a multiple of 10 in 10..100, else null. */
  withholdingRatio: string | null;
}

/** TaxTotal public data contract (TRD §§5 and 7).
 * @example
 * import type { TaxTotal } from '@firatkill/efatura';
 */
export interface TaxTotal {
  taxAmount: Amount | null;
  subtotals: TaxSubtotal[];
}

/** MonetaryTotals public data contract (TRD §§5 and 7).
 * @example
 * import type { MonetaryTotals } from '@firatkill/efatura';
 */
export interface MonetaryTotals {
  lineExtensionAmount: Amount | null;
  taxExclusiveAmount: Amount | null;
  taxInclusiveAmount: Amount | null;
  allowanceTotalAmount: Amount | null;
  chargeTotalAmount: Amount | null;
  payableRoundingAmount: Amount | null;
  payableAmount: Amount | null;
}

/** ComputedTotals public data contract (TRD §§5 and 7).
 * @example
 * import type { ComputedTotals } from '@firatkill/efatura';
 */
export interface ComputedTotals {
  sumOfLines: Decimal | null;
  taxTotal: Decimal | null;
  kdvTotal: Decimal | null;
  otvTotal: Decimal | null;
  otherTaxTotal: Decimal | null;
  withholdingTotal: Decimal | null;
  payableTry: Decimal | null;
}

/** Item public data contract (TRD §§5 and 7).
 * @example
 * import type { Item } from '@firatkill/efatura';
 */
export interface Item {
  name: string | null;
  description: string | null;
  keyword: string | null;
  brandName: string | null;
  modelName: string | null;
  buyersItemId: string | null;
  sellersItemId: string | null;
  manufacturersItemId: string | null;
  // eslint-disable-next-line @typescript-eslint/array-type -- Preserve the normative TRD §7.2 declaration.
  classificationCodes: Array<{ listId: string | null; value: string }>;
  originCountryCode: string | null;
}

/** Price public data contract (TRD §§5 and 7).
 * @example
 * import type { Price } from '@firatkill/efatura';
 */
export interface Price {
  amount: Amount | null;
  baseQuantity: Quantity | null;
}

/** LineDelivery public data contract (TRD §§5 and 7).
 * @example
 * import type { LineDelivery } from '@firatkill/efatura';
 */
export interface LineDelivery {
  incoterms: string | null;
  customsTariffCode: string | null; // GTİP
  transportModeCode: string | null;
  packagingTypeCode: string | null;
  deliveryAddress: Address | null;
}

/** InvoiceLine public data contract (TRD §§5 and 7).
 * @example
 * import type { InvoiceLine } from '@firatkill/efatura';
 */
export interface InvoiceLine {
  /** 1-based position among the invoice's lines. */
  position: number;
  id: string | null;
  notes: string[];
  quantity: Quantity | null;
  lineExtensionAmount: Amount | null;
  allowanceCharges: AllowanceCharge[];
  taxTotal: TaxTotal | null;
  withholdingTaxTotals: TaxTotal[];
  item: Item;
  price: Price | null;
  delivery: LineDelivery | null;
}

/** PaymentMeans public data contract (TRD §§5 and 7).
 * @example
 * import type { PaymentMeans } from '@firatkill/efatura';
 */
export interface PaymentMeans {
  code: string | null;
  dueDate: string | null;
  channelCode: string | null;
  instructionNote: string | null;
  accountId: string | null;
  accountCurrency: string | null;
  paymentNote: string | null;
  bankBranchName: string | null;
  bankName: string | null;
}

/** PaymentTerms public data contract (TRD §§5 and 7).
 * @example
 * import type { PaymentTerms } from '@firatkill/efatura';
 */
export interface PaymentTerms {
  note: string | null;
  penaltySurchargePercent: Decimal | null;
  amount: Amount | null;
  dueDate: string | null;
}

/** Invoice public data contract (TRD §§5 and 7).
 * @example
 * import type { Invoice } from '@firatkill/efatura';
 */
export interface Invoice {
  ublVersionId: string | null;
  customizationId: string | null;
  profileId: ProfileId;
  profileIdRaw: string | null;
  number: string | null;
  copyIndicator: boolean | null;
  uuid: string | null;
  issueDate: string | null;
  issueTime: string | null;
  typeCode: InvoiceTypeCode;
  typeCodeRaw: string | null;
  notes: string[];
  currency: string | null;
  lineCountNumeric: number | null;
  period: InvoicePeriod | null;
  exchangeRate: ExchangeRate | null;
  dueDate: DueDate | null;
  orderReferences: DocumentReference[];
  billingReferences: DocumentReference[];
  despatchReferences: DocumentReference[];
  receiptReferences: DocumentReference[];
  contractReferences: DocumentReference[];
  additionalReferences: DocumentReference[];
  attachments: Attachment[];
  supplier: Party | null;
  customer: Party | null;
  buyerCustomer: Party | null;
  paymentMeans: PaymentMeans[];
  paymentTerms: PaymentTerms[];
  allowanceCharges: AllowanceCharge[];
  taxTotals: TaxTotal[];
  withholdingTaxTotals: TaxTotal[];
  totals: MonetaryTotals;
  computed: ComputedTotals;
  lines: InvoiceLine[];
  signed: boolean;
  raw: XmlElement | null;
}

/** IssueCode public data contract (TRD §§5 and 7).
 * @example
 * import type { IssueCode } from '@firatkill/efatura';
 */
export type IssueCode =
  | 'EF001'
  | 'EF002'
  | 'EF003'
  | 'EF004'
  | 'EF005'
  | 'EF006'
  | 'EF007'
  | 'EF008'
  | 'EF009'
  | 'EF010'
  | 'EF011'
  | 'EF012'
  | 'EF013'
  | 'EF014'
  | 'EF015'
  | 'EF016'
  | 'EF017'
  | 'EF020'
  | 'EF021'
  | 'EF022'
  | 'EF023'
  | 'EF024'
  | 'EF025'
  | 'EF026'
  | 'EF030'
  | 'EF031'
  | 'EF032'
  | 'EF035'
  | 'EF040'
  | 'EF041'
  | 'EF042'
  | 'EF043'
  | 'EF044'
  | 'EF045'
  | 'EF046'
  | 'EF047'
  | 'EF048'
  | 'EF049'
  | 'EF050'
  | 'EF051'
  | 'EF052'
  | 'EF053'
  | 'EF054'
  | 'EF055'
  | 'EF060'
  | 'EF061'
  | 'EF062'
  | 'EF063'
  | 'EF064'
  | 'EF065'
  | 'EF066'
  | 'EF090'
  | 'EF091'; // T-17 derives this from ISSUE_CODES.

/** Issue public data contract (TRD §§5 and 7).
 * @example
 * import type { Issue } from '@firatkill/efatura';
 */
export interface Issue {
  code: IssueCode;
  severity: Severity;
  /** Canonical path, e.g. "/Invoice/cac:InvoiceLine[2]/cbc:InvoicedQuantity". */
  path: string;
  message: string;
  messageTr: string;
  details?: Readonly<Record<string, string | number>>;
}

/** XmlInput public data contract (TRD §§5 and 7).
 * @example
 * import type { XmlInput } from '@firatkill/efatura';
 */
export type XmlInput = string | Uint8Array | ArrayBuffer;

/** ParseOptions public data contract (TRD §§5 and 7).
 * @example
 * import type { ParseOptions } from '@firatkill/efatura';
 */
export interface ParseOptions {
  /** Run validation rules (FR-17). Default true. Mapping issues (EF009, EF015, EF023, EF030, EF031, EF032, EF035) are always reported unless turned off in `rules`. */
  validate?: boolean;
  /** Severity overrides or 'off' per issue code (FR-19). */
  rules?: Partial<Record<IssueCode, Severity | 'off'>>;
  /** Totals tolerance, decimal string ≥ 0 ('0' means exact). Default '0.01'. Invalid values throw TypeError. */
  tolerance?: string;
  /** Keep the namespace-resolved XML tree in `invoice.raw`. Default true. */
  includeRaw?: boolean;
  /** 'data' keeps base64 text in attachments; 'metadata' drops it (size is still computed). Default 'data'. */
  attachments?: 'data' | 'metadata';
  /** Maximum input size in bytes. Default MAX_XML_BYTES. */
  maxBytes?: number;
}

/** ParseResult public data contract (TRD §§5 and 7).
 * @example
 * import type { ParseResult } from '@firatkill/efatura';
 */
export interface ParseResult {
  invoice: Invoice;
  issues: Issue[];
  /** Encoding used to decode bytes ('utf-8' for string input). */
  encoding: string;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { InputFile } from '@firatkill/efatura';
 */
export interface InputFile {
  /** Display path; used in SourceRef.path. */
  name: string;
  data: XmlInput | Blob;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { BatchOptions } from '@firatkill/efatura';
 */
export interface BatchOptions extends Omit<ParseOptions, 'includeRaw' | 'attachments'> {
  /** Default false in batches (D-22). */
  includeRaw?: boolean;
  /** Default 'metadata' in batches (D-22). */
  attachments?: 'data' | 'metadata';
  /** 'flag' adds EF090 and keeps the invoice; 'skip' yields a `duplicate` item. Default 'flag'. */
  duplicates?: 'flag' | 'skip';
  /** Share duplicate state across several batch calls (playground "Add files"). */
  duplicateTracker?: DuplicateTracker;
  signal?: AbortSignal;
  onProgress?: (progress: BatchProgress) => void;
  /** Keep decompressed XML bytes on each invoice item (`item.bytes`). Default false. Used by the playground worker. */
  keepBytes?: boolean;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { SourceRef } from '@firatkill/efatura';
 */
export interface SourceRef {
  /** Path; archive boundaries are written as "!/", e.g. "2025.zip!/07/a.zip!/x.xml". */
  path: string;
  /** Last path segment. */
  name: string;
  /** Size of this file's bytes (decompressed for archive entries). */
  bytes: number;
  /** 0 for top-level inputs, 1 for entries of a top-level archive, and so on. */
  depth: number;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { BatchItem } from '@firatkill/efatura';
 */
export type BatchItem =
  | {
      kind: 'invoice';
      source: SourceRef;
      invoice: Invoice;
      issues: Issue[];
      encoding: string;
      bytes?: Uint8Array;
    }
  | { kind: 'duplicate'; source: SourceRef; uuid: string; firstSource: string }
  | { kind: 'error'; source: SourceRef; error: ItemError }
  | { kind: 'skipped'; source: SourceRef; reason: 'unsupported-type' }; // junk entries (section 10.3) yield nothing

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { ItemError } from '@firatkill/efatura';
 */
export interface ItemError {
  code: EfaturaParseErrorCode | ZipErrorCode | BatchErrorCode; // BatchErrorCode = 'READ_FAILED' | 'ZIP_INPUT_REQUIRES_ZIP_ENTRY' (section 10.4)
  message: string;
  messageTr: string;
  details?: Record<string, string | number>;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { BatchProgress } from '@firatkill/efatura';
 */
export interface BatchProgress {
  filesDone: number; // items yielded so far (all kinds)
  filesTotal: number | null; // known only for plain XML inputs without archives
  bytesDone: number; // compressed bytes consumed from top-level inputs
  bytesTotal: number | null; // sum of top-level input sizes when known
  invoices: number;
  failed: number;
  currentPath: string | null;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { BatchSummary } from '@firatkill/efatura';
 */
export interface BatchSummary {
  files: number;
  archives: number;
  invoices: number;
  duplicates: number;
  failed: number;
  skipped: number;
  issues: { error: number; warning: number; info: number };
  invoicesWithErrors: number;
  invoicesWithWarnings: number;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { BatchResult } from '@firatkill/efatura';
 */
export interface BatchResult {
  items: BatchItem[];
  summary: BatchSummary;
}

/** Public batch contract (TRD §5.3 / §10.4).
 * @example
 * import type { DuplicateTracker } from '@firatkill/efatura';
 */
export interface DuplicateTracker {
  /** Returns the first source path if the UUID was seen, else records it and returns null. */
  check(uuid: string, path: string): string | null;
  /** Same for supplier tax ID + invoice number (EF091). Returns the first UUID if seen with a different UUID. */
  checkNumber(supplierTaxId: string, number: string, uuid: string): string | null;
  reset(): void;
}

/** Public error contract (TRD §5.3 / §10.4).
 * @example
 * import type { BatchErrorCode } from '@firatkill/efatura';
 */
export type BatchErrorCode = 'READ_FAILED' | 'ZIP_INPUT_REQUIRES_ZIP_ENTRY';
/** Public error contract (TRD §5.3 / §10.4).
 * @example
 * import type { ZipErrorCode } from '@firatkill/efatura';
 */
export type ZipErrorCode =
  | 'ZIP_INVALID'
  | 'ZIP_ENCRYPTED'
  | 'ZIP_UNSUPPORTED_METHOD'
  | 'ZIP_DEPTH_EXCEEDED'
  | 'ZIP_TOO_MANY_ENTRIES'
  | 'ZIP_TOO_LARGE'
  | 'ZIP_ENTRY_TOO_LARGE'
  | 'ZIP_RATIO_EXCEEDED';

/** Per-top-level-archive decompression limits (TRD §5.4).
 * @example
 * const limits: Partial<ZipLimits> = {maxEntries: 10};
 */
export interface ZipLimits {
  maxDepth: number;
  maxEntries: number;
  maxTotalBytes: number;
  maxEntryBytes: number;
  maxRatio: number;
  ratioMinBytes: number;
}
