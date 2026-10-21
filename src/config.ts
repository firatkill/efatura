/** Maximum size of one XML input: the byte length for byte input, `string.length` (UTF-16 code units) for string input (section 6.1). */
export const MAX_XML_BYTES = 50 * 1024 * 1024;

/** Default totals tolerance in document currency (decimal string). */
export const DEFAULT_TOLERANCE = '0.01';

/** Per-line tolerance step for EF048 (Σ line tax vs invoice tax). */
export const LINE_TAX_TOLERANCE_STEP = '0.005';

/** ZIP limits (FR-24, D-08). */
export const DEFAULT_ZIP_LIMITS = {
  maxDepth: 3,
  maxEntries: 5000,
  maxTotalBytes: 500 * 1024 * 1024,
  maxEntryBytes: 50 * 1024 * 1024,
  maxRatio: 100,
  ratioMinBytes: 1024 * 1024,
} as const;

/** Chunk size when pushing archive bytes into the streaming unzipper. */
export const ZIP_PUSH_CHUNK_BYTES = 1024 * 1024;

/** Iterators yield to the event loop after this much continuous work (FR-25). */
export const YIELD_BUDGET_MS = 50;

/** Minimum interval between onProgress calls (FR-28). */
export const PROGRESS_INTERVAL_MS = 100;

/** XML namespace URIs (UBL 2.1). */
export const NS = {
  inv: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  ext: 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
  ds: 'http://www.w3.org/2000/09/xmldsig#',
  xades: 'http://uri.etsi.org/01903/v1.3.2#',
} as const;

/** Expected UBL-TR identifiers (A-01). */
export const EXPECTED_UBL_VERSION = '2.1';
export const EXPECTED_CUSTOMIZATION_IDS = ['TR1.2', 'TR1.2.1'] as const;

/** Placeholder TCKN used for anonymous final consumers in e-Arşiv (A-08, D-24). */
export const ANONYMOUS_TCKN = '11111111111';

/** Currency codes treated as TRY for EF022 (D-25). */
export const TRY_ALIASES = ['TL', 'YTL'] as const;

/** Supported declared encodings (FR-02), lower-case labels. */
export const SUPPORTED_ENCODINGS = [
  'utf-8',
  'utf8',
  'utf-16',
  'utf-16le',
  'utf-16be',
  'windows-1254',
  'iso-8859-9',
  'iso-8859-1',
  'latin1',
  'us-ascii',
  'ascii',
] as const;

/** Duplicate tracking in batches. */
export const DEFAULT_DUPLICATES = 'flag' as const;

/** CLI progress: one line per this many files when stderr is not a TTY. */
export const CLI_PROGRESS_EVERY_FILES = 500;

/** Playground. */
export const PLAYGROUND = {
  pageSize: 100,
  workerBatchMs: 100,
  workerBatchItems: 250,
  retainLimitBytes: 256 * 1024 * 1024,
  largeSelectionBytes: 200 * 1024 * 1024,
  maxXsltBytes: 5 * 1024 * 1024,
  filterDebounceMs: 200,
  mobileBreakpointPx: 640,
} as const;

/** Exchange-rate note recognition, including Turkish dotted and dotless I (TRD §7.4).
 * @example
 * RATE_NOTE_PATTERN.exec('DÖVİZ KURU: 35,1')?.[1]; // '35,1'
 */
export const RATE_NOTE_PATTERN =
  /(?:d[öo]v[iıİ]z\s*kuru|exchange\s*rate|kur)\s*[:=]\s*([0-9]{1,6}(?:[.,][0-9]{1,10})?)/iu;

/** Transitional rule names for T-16 option validation; T-17 replaces this with ISSUE_CODES.
 * @example
 * KNOWN_ISSUE_CODES.includes('EF009'); // true
 */
export const KNOWN_ISSUE_CODES = [
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
