# efatura: Product Requirements Document

| Field | Value |
|---|---|
| Product | efatura: parse Turkish e-invoices (UBL-TR) into typed data |
| Owner | Fırat Kıl |
| Package | `@firatkill/efatura` on npm (library + CLI), MIT |
| Repository | github.com/firatkill/efatura |
| Playground | https://efatura.firatkil.com (static, Vercel Hobby) |
| Status | Approved for implementation |
| Companion docs | `docs/TRD.md` (how), `docs/IMPLEMENTATION_PLAN.md` (in what order), `AGENTS.md` (rules for coding agents) |

This document defines what efatura does and why. Requirement IDs (US-xx, FR-xx, NFR-xx, D-xx, R-xx) are stable. The TRD and the implementation plan reference them. Do not renumber; append new IDs at the end of each list.

Turkish domain terms are used throughout. Section 16 is a Turkish ↔ English glossary; read it first if a term is unfamiliar.

---

## 1. Problem

Every VAT-registered business in Türkiye above the e-Fatura thresholds issues and receives invoices as UBL-TR XML (e-Fatura between registered taxpayers, e-Arşiv Fatura to everyone else). Accountants and developers receive these as single XML files or as ZIP archives, often nested (year/month folders, one ZIP per invoice, ZIPs inside ZIPs), exported from GİB's portal or from a private integrator (özel entegratör).

Reading them is harder than it looks:

- UBL-TR is UBL 2.1 with Turkish profiles, codes and rules. The official documentation is a set of PDF guides and code lists in Turkish. There is no maintained, typed, open-source parser for JavaScript or TypeScript that covers the money and tax details accountants need.
- Real files vary: different namespace prefixes, default namespaces, byte order marks, encodings declared as `windows-1254`, exchange rates written only in a free-text note, withholding (tevkifat) that is or is not deducted from the payable amount, duplicate copies of the same invoice in one archive.
- Amounts must never pass through floating point. A one-kuruş error in a withholding or exchange-difference report is a real problem for an accountant.
- Invoices contain personal and company data. Many people will not upload them to a web service, and should not have to.

The owner has built two private tools on this problem (a browser-side e-invoice parser with FIFO payment matching and FX difference reports, and a bulk e-invoice processor). efatura extracts that knowledge into a reusable, well-tested public library, a CLI, and a browser playground that never uploads anything.

## 2. Product summary

efatura has three parts that share one parser:

1. **Library** `@firatkill/efatura`: `parseInvoice(xml)` returns `{ invoice, issues }`. `invoice` is a fully typed, JSON-safe model of a UBL-TR 1.2 Invoice: identity, parties, lines, taxes, withholding, monetary totals, references, attachments (including the embedded XSLT that renders the official view) and the raw XML tree for anything else. Amounts are decimal strings, never numbers. `issues` lists content problems with a code, severity, path and an English and Turkish message. The parser throws only when the input is not acceptable XML or not an Invoice. The subpath `@firatkill/efatura/zip` adds ZIP handling with nested archives and zip-bomb limits. `toRows` and `toCsv` turn results into flat, Excel-friendly tables. Runs in Node 20+ and modern browsers with two runtime dependencies.
2. **CLI** `efatura parse`: parses files, globs and ZIPs into JSON or CSV, prints progress on stderr, and can fail a pipeline on errors (`--strict`).
3. **Playground** at efatura.firatkil.com: a static page where you drop XML or ZIP files. Parsing runs in a Web Worker on your device. You get invoice and line tables, filters, an issues list, a detail view with the official rendering (the invoice's own XSLT, run in a sandboxed frame), and CSV, JSON and Excel exports. Bilingual (Turkish and English). No uploads, no cookies, no analytics.

The repository contains only synthetic invoices produced by a fixture generator, and CI enforces this.

## 3. Goals

| ID | Goal | Measured by |
|---|---|---|
| G-01 | A correct, typed model of the UBL-TR 1.2 Invoice fields accountants use. | Field mapping table in TRD §7 fully implemented; 43 fixture scenarios pass (TRD §15). |
| G-02 | Exact money: no floating point anywhere amounts are stored, summed or compared. | ESLint rule and unit tests (TRD §8); property tests on decimal sums. |
| G-03 | Tolerant parsing with explicit diagnostics instead of exceptions. | Fuzz test: arbitrary bytes never throw anything but `EfaturaParseError` (NFR-10). |
| G-04 | Useful validation: identity, checksums, currencies, totals consistency, withholding. | Each rule EF001–EF091 has at least one positive and one negative test and a fixture. |
| G-05 | Handle real archives safely: nested ZIPs, thousands of files, zip bombs, cancellation. | ZIP tests and the zip-bomb fixture; browser stays responsive (NFR-02). |
| G-06 | Privacy by construction: the playground never sends invoice data anywhere; the repo never holds real invoices. | E2E network assertion (NFR-06); `pnpm fixtures:check` in CI (FR-54). |
| G-07 | A code base a reviewer can judge quickly: strict TypeScript, small dependency set, high coverage, clear docs. | CI gates in TRD §17; coverage targets in NFR-13. |

## 4. Non-goals

- Creating, signing, sending or receiving e-invoices through GİB or an integrator.
- Full schema (XSD) or schematron validation. efatura checks the rules in TRD §9 only; it does not certify that an invoice is legally valid.
- Tax or accounting advice. efatura reports what an invoice says and whether its numbers are internally consistent.
- Document types other than the UBL-TR Invoice (see §13).
- A hosted service, accounts, storage or sync. Everything is local.
- Excel export in the library core (the playground offers it as a lazy-loaded extra, FR-46).

## 5. Audience

| Audience | Needs | Main surface |
|---|---|---|
| Turkish developers integrating e-invoices (ERP add-ons, accounting tools, reporting scripts) | A typed model, exact amounts, Turkish code names, predictable diagnostics, small bundle, works in the browser and Node. | Library, CLI, `docs/`, README in Turkish and English |
| Accountants and finance staff (mali müşavir, muhasebeci) | Open a folder of invoices, see totals, VAT and withholding per invoice and line, spot broken or duplicate invoices, export to Excel, without uploading client data. | Playground |
| Reviewers judging code quality (hiring managers, open-source contributors) | Clear specs, tests that explain behaviour, a clean public API, CI that proves it. | Repository, CI, docs |

## 6. User stories

| ID | As a | I want to | So that |
|---|---|---|---|
| US-01 | developer | call one function with an XML string or bytes and get a typed invoice | I do not write XPath code for UBL-TR myself. |
| US-02 | developer | get amounts as exact decimal strings and convert them to minor units as `bigint` | my sums and database values are exact. |
| US-03 | developer | get problems as a list of issues instead of exceptions | one bad invoice does not stop a batch of 5,000. |
| US-04 | developer | turn issue codes on or off and change their severity | the checks fit my pipeline. |
| US-05 | developer | parse a ZIP of ZIPs from GİB or an integrator without unpacking it myself | I can feed archives straight from the user. |
| US-06 | developer | iterate a large archive with progress and cancel it | the browser stays responsive and the user can stop. |
| US-07 | developer | get flat rows with stable column names and Turkish labels, and Excel-friendly CSV | I can produce reports without mapping fields myself. |
| US-08 | developer | read any field the model does not cover from the raw XML tree | I am never blocked by the model. |
| US-09 | developer or operator | run `efatura parse` on a folder in CI and fail on errors | I can check invoice exports automatically. |
| US-10 | accountant | drop a ZIP of a month's invoices into a web page and see every invoice and line in a table | I can review a client's month in minutes. |
| US-11 | accountant | filter by supplier, type and date | I can find the invoices I need. |
| US-12 | accountant | see which invoices have broken totals, invalid tax numbers, missing exchange rates or duplicates, in Turkish | I catch problems before booking. |
| US-13 | accountant | open an invoice and see the official rendering exactly as the issuer's XSLT shows it | I can compare with the printed invoice. |
| US-14 | accountant | export the table to Excel or CSV that opens correctly in Turkish Excel | I can continue in my usual tools. |
| US-15 | accountant | know for certain that my clients' invoices are not uploaded | I can use the tool without breaching confidentiality (KVKK). |
| US-16 | keyboard, screen-reader or phone user | use every playground feature without a mouse, with severity not shown by colour alone, on a 360 px screen | the playground is accessible. |
| US-17 | contributor | reproduce a parsing bug with a synthetic fixture instead of a real invoice | I never have to share real data. |
| US-18 | reviewer | see tests, CI and docs that prove each rule | I can trust the library. |

## 7. Functional requirements

Priority: **Must** (required for 0.1.0), **Should** (expected in 0.1.0; may slip to 0.2 with a decisions log entry), **Could** (only if time remains).

### 7.1 Core parsing

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-01 | `parseInvoice(input, options?)` accepts `string`, `Uint8Array` or `ArrayBuffer` and returns `{ invoice, issues }` synchronously. Signature and options in TRD §5.2. | Must | US-01 |
| FR-02 | Byte input is decoded by BOM (UTF-8, UTF-16 LE/BE), else by the XML declaration's `encoding` (`utf-8`, `utf-16`, `windows-1254`, `iso-8859-9`, `iso-8859-1`, `us-ascii`), else as UTF-8. An unsupported declared encoding decodes as UTF-8 and adds warning EF035 (TRD §6.1); invalid UTF-8 without a declaration is decoded as `windows-1254` with EF035. | Must | US-01 |
| FR-03 | Parsing is namespace-agnostic: any prefix (`cbc:`, `cac:`, `b:`, `ns2:` …) and default-namespace declarations resolve to the UBL namespace URIs. Elements with undeclared prefixes or no namespace are matched by local name with warning EF009. Design in TRD §6. | Must | US-01 |
| FR-04 | The parser never throws on content problems. It throws `EfaturaParseError` only with code `EMPTY_INPUT`, `INPUT_TOO_LARGE`, `NOT_XML`, `DOCTYPE_FORBIDDEN` or `NOT_INVOICE` (TRD §5.6). Everything else becomes an issue. | Must | US-03 |
| FR-05 | The model exposes invoice identity: UUID, number, issue date and time, profile (scenario), invoice type code, copy indicator, document currency, line count, exchange rate (rate, source and target currency, date, and where it came from), notes, invoice period, order, despatch, billing and other document references. Unknown profiles and type codes map to `"OTHER"` with the raw value kept. | Must | US-01 |
| FR-06 | The model exposes supplier, customer and (when present) buyer-customer parties: organisation name or person name, a resolved tax ID (VKN 10 digits or TCKN 11 digits) with scheme, all other party identifiers (MERSİS, ticaret sicil, etc.), tax office, postal address, website and contact. | Must | US-01 |
| FR-07 | The model exposes every invoice line: id, position, notes, item name, description, brand, model, buyer/seller/manufacturer item ids, classification codes, quantity with unit code and EN/TR unit label, unit price, base quantity, line extension amount, allowances and charges, line taxes, line withholding, and export delivery data (Incoterms, GTİP, transport mode). | Must | US-01 |
| FR-08 | The model exposes invoice-level tax totals with subtotals per tax type (KDV, ÖTV, ÖİV, damga, konaklama and every code in the code list), with taxable amount, rate, per-unit amount, tax amount, exemption code and reason, and the tax name from both the XML and the code list. Withholding (tevkifat) is a separate `withholdingTaxTotals` list with rate, ratio (`"5/10"`) and amount. | Must | US-01, US-12 |
| FR-09 | The model exposes all seven monetary totals (LineExtensionAmount, TaxExclusiveAmount, TaxInclusiveAmount, AllowanceTotalAmount, ChargeTotalAmount, PayableRoundingAmount, PayableAmount) and invoice-level allowances and charges. | Must | US-01 |
| FR-10 | The model exposes payment means (code, due date, IBAN, currency), payment terms, and a due date resolved from payment means, payment terms, or a `Vade Tarihi` note (source recorded). | Should | US-01 |
| FR-11 | Exchange rate resolution order: `PricingExchangeRate`, `TaxExchangeRate`, `PaymentExchangeRate`, `PaymentAlternativeExchangeRate`, then a note matching the `Döviz Kuru` pattern (TRD §7.4). Any source but the first adds warning EF023. | Must | US-12 |
| FR-12 | Attachments (`AdditionalDocumentReference` with an embedded binary object) expose id, document type, filename, MIME code, encoding, decoded size, whether it is the XSLT used for the official view, and the base64 data. Bytes are decoded only when `decodeAttachment()` is called. In batch mode only metadata is kept by default. | Must | US-13 |
| FR-13 | `invoice.raw` holds the namespace-resolved XML tree (when `includeRaw` is true), and `select`, `selectAll`, `selectText` read any path from it with canonical prefixes. | Must | US-08 |
| FR-14 | Code lists (profiles, invoice types, tax types, withholding codes, exemption codes, unit codes, currencies) ship with English and Turkish labels and a record of which official list version they were checked against (TRD §7.9, A-02 to A-07). | Must | US-01, US-12 |
| FR-15 | All amounts, quantities, rates and percentages are decimal strings as written in the XML (trimmed; decimal comma replaced by a dot with warning EF031). `decimal` helpers add, subtract, multiply, compare, sum and round exactly. `toMinorUnits(amount, currency)` returns `bigint`. Algorithm in TRD §8. | Must | US-02 |
| FR-16 | The whole result is plain data: JSON-serialisable (no `bigint`, functions, `Date` or class instances), structured-cloneable, and deterministic (same input and options, deep-equal output). | Must | US-01 |

### 7.2 Validation

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-17 | `parseInvoice` runs the validation rules EF001–EF066 in TRD §9 by default and puts their issues in `issues`. | Must | US-03, US-12 |
| FR-18 | Every issue has `code`, `severity` (`error`, `warning`, `info`), `path` (canonical XPath-like location), `message` (English), `messageTr` (Turkish) and optional `details`. Messages are byte-exact from TRD §9.3. | Must | US-03, US-12 |
| FR-19 | Validation is configurable: `validate: false` turns it off; `rules: { EF040: 'off', EF012: 'warning' }` turns rules off or changes severity; `tolerance` (default `"0.01"`) changes the totals tolerance. | Must | US-04 |
| FR-20 | `validateInvoice(invoice, options?)` runs the same rules on an already-parsed model. | Should | US-04 |
| FR-21 | `isValidVkn`, `isValidTckn`, `isValidUuid` and `classifyTaxId` are exported. | Must | US-01 |

### 7.3 Batch and ZIP

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-22 | `parseMany(files, options?)` parses many XML inputs (`{ name, data }` or `File`/`Blob`) and returns items plus a summary. `iterateMany` yields the same items one at a time as an async iterator. | Must | US-03 |
| FR-23 | Across one batch, a UUID seen before adds warning EF090 to the later invoice with the first source path; `duplicates: 'skip'` returns a `duplicate` item instead. The same supplier tax ID and invoice number with a different UUID adds info EF091. | Must | US-12 |
| FR-24 | `parseZip(bytes, options?)` and `iterateZip` (subpath `@firatkill/efatura/zip`) read nested ZIPs with limits `maxDepth` 3, `maxEntries` 5000, `maxTotalBytes` 500 MB, `maxEntryBytes` 50 MB and `maxRatio` 100 (TRD §10). Limit violations become error items, never crashes or hangs. | Must | US-05 |
| FR-25 | Iterators yield to the event loop at least every 50 ms of work so a browser main thread or worker can process messages. | Must | US-06 |
| FR-26 | All batch and ZIP functions accept an `AbortSignal`; aborting stops work within 100 ms and rejects with `signal.reason`. | Must | US-06 |
| FR-27 | Entries are classified by content: ZIP by magic bytes, XML by `.xml` extension; junk (`__MACOSX/`, `.DS_Store`, `._*`, `Thumbs.db`, `desktop.ini`, directories) is ignored; other files become `skipped` items. | Must | US-05 |
| FR-28 | An `onProgress` callback reports files done, bytes done, invoices, failures and the current path, at most every 100 ms. | Must | US-06 |
| FR-29 | `parseAny(files)` and `iterateAny(files)` accept a mix of XML and ZIP inputs (used by the CLI and the playground). | Must | US-05 |

### 7.4 Exports

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-30 | `toRows(invoices, { level: 'invoice' })` returns one row per invoice with the 44 columns in TRD §11.1, in that order. | Must | US-07 |
| FR-31 | `toRows(invoices, { level: 'line' })` returns one row per line with the 36 columns in TRD §11.2, in that order. | Must | US-07 |
| FR-32 | Each column has a stable snake_case key, an English label, a Turkish label and a type. Keys never change within a major version; new columns are appended at the end. | Must | US-07 |
| FR-33 | `toCsv(rowSet, options?)` writes RFC 4180 CSV with `delimiter` `';'` (default) or `','`, `bom` (default `true`), decimal comma when the delimiter is `';'`, header labels `key`, `en` or `tr`, CRLF line ends, and formula-injection escaping for text cells (TRD §11.3). | Must | US-07, US-14 |

### 7.5 CLI

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-34 | `efatura parse <inputs...>` accepts files, directories (recursive), glob patterns (`*`, `?`, `**`) and ZIPs. | Must | US-09 |
| FR-35 | Output: `--json` (full model, or rows with `--level`), `--csv` (rows, default level `invoice`), or neither (a human summary). `--out <file>` writes to a file instead of stdout. Options in TRD §12. | Must | US-09 |
| FR-36 | Exit codes: `0` success; `1` with `--strict` when any error-severity issue or failed item exists; `2` usage or I/O error; `130` when interrupted with Ctrl+C (SIGINT), with no partial output written (TRD §12.2). | Must | US-09 |
| FR-37 | Progress goes to stderr (a single updating line on a TTY, one line per 500 files otherwise); `--quiet` turns it off. | Must | US-09 |
| FR-38 | `efatura --help`, `efatura parse --help` and `efatura --version` print the exact texts in TRD §12. | Must | US-09 |

### 7.6 Playground

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-39 | The home view accepts files by drag and drop, by a file picker (multiple XML and ZIP), and by one-click synthetic samples (§9.3). | Must | US-10 |
| FR-40 | Parsing runs in a module Web Worker. The view shows progress and a Cancel button; cancelling keeps what was read. The main thread never parses XML. | Must | US-10, US-15 |
| FR-41 | The results view has three tabs: Invoices, Lines, Issues. Tables paginate at 100 rows; on screens narrower than 640 px rows render as cards. | Must | US-10, US-16 |
| FR-42 | Filters: supplier, invoice type, date range (from, to), text search (number, UUID, party name), "Only invoices with issues". Filters apply to all three tabs and to exports. | Must | US-11 |
| FR-43 | Tables sort by date, number, supplier and payable amount (exact decimal compare), ascending and descending, with `aria-sort`. | Should | US-11 |
| FR-44 | The Issues tab lists issues with severity shown as icon + text label + colour, code, message in the current language, invoice, file and path, with severity filters. A separate list shows files that could not be read and files that were skipped. | Must | US-12, US-16 |
| FR-45 | The invoice detail view (`#/invoice/<id>`) shows every section of the model in readable form, the invoice's issues, and previous/next navigation within the filtered list. | Must | US-10 |
| FR-46 | The official view applies the invoice's embedded XSLT with the browser's XSLT engine (or the fallback in TRD §14.6) only after the user clicks, sanitises the output, and shows it in an `<iframe sandbox>` with no scripts, no network and no same-origin access (TRD §14). Download HTML and download XSLT are offered. | Must | US-13 |
| FR-47 | Exports of the current filtered set: CSV for Turkish Excel (`;`, decimal comma, BOM), CSV with commas, JSON, at invoice or line level (current tab). | Must | US-14 |
| FR-48 | Excel (.xlsx) export loads the writer library on first use only (TRD §14.8). | Should | US-14 |
| FR-49 | A privacy banner states "Your files never leave your browser." with an explanation and a link to the privacy view. The site sets no cookies and loads no analytics or third-party resources. | Must | US-15 |
| FR-50 | The interface is bilingual. Turkish is the default when `navigator.language` starts with `tr`, English otherwise; the toggle choice is remembered in `localStorage`. All copy is in §9. | Must | US-10 |
| FR-51 | Light, dark and system themes; system is the default; the choice is remembered. | Must | US-16 |
| FR-52 | "Add files" appends to the current results (duplicates across additions are detected); "Start over" clears everything after confirmation. | Must | US-10 |

### 7.7 Fixtures, privacy of the repository, tests

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-53 | `pnpm fixtures:generate` builds every fixture file deterministically from TypeScript scenario definitions: valid UBL-TR XML with fake but checksum-valid VKN/TCKN, fictitious names, a dummy XSLT, and ZIP archives with fixed timestamps. | Must | US-17 |
| FR-54 | At least 25 scenarios exist; v0.1.0 ships the 43 in TRD §15.4 (S43 holds one file per rule not covered by another scenario), each with its expected issues or expected error. Snapshot tests cover every generated file. | Must | US-17, US-18 |
| FR-55 | `fixtures/manifest.json` lists every generated file with its SHA-256. `pnpm fixtures:check` (in CI) fails if a fixture differs from a fresh generation, a file is not in the manifest, an XML/ZIP/XSL file is committed outside `fixtures/generated/`, a fixture contains a tax ID outside the synthetic identity list, a fixture contains an XML signature, a fixture contains an e-mail or URL host outside `.invalid`, or a generated invoice lacks the synthetic-data marker (TRD §15.2, §15.5). | Must | US-17 |
| FR-56 | Committing real invoices is forbidden (AGENTS.md, CONTRIBUTING section of the README, PR template checkbox, issue templates asking for a generator definition instead of a file). | Must | US-17 |
| FR-57 | `pnpm corpus:private <dir>` parses a local folder outside the repository and prints only aggregate counts per issue code, never field values. | Could | US-17 |

### 7.8 Documentation and release

| ID | Requirement | Priority | Stories |
|---|---|---|---|
| FR-58 | `README.md` (English) and `README.tr.md` (Turkish) with install, quick start for library, ZIP, exports and CLI, the privacy statement, the "not affiliated with GİB, not tax advice" notice, and links to `docs/`. | Must | US-01, US-18 |
| FR-59 | The glossary (§16) is part of the docs and linked from both READMEs. | Must | US-01 |
| FR-60 | Releases are published to npm from GitHub Actions with provenance, versioned with Changesets. | Must | US-18 |
| FR-61 | The playground deploys to Vercel through Vercel's Git integration: production on every push to `main`, a preview deployment for every pull request. GitHub Actions runs the tests and the build check but does not deploy. | Must | US-10 |

## 8. Non-functional requirements

| ID | Category | Requirement | How it is checked |
|---|---|---|---|
| NFR-01 | Performance (browser) | Parse 1,000 typical invoices (definition below) from one ZIP in the playground worker in ≤ 8 s on the reference laptop: 4 performance cores, 2020 or newer (Apple M1, Intel Core i5-1135G7, AMD Ryzen 5 5500U), 16 GB RAM, current Chrome. | `pnpm bench:browser` (TRD §15.6, E2E-20), recorded in the release checklist. |
| NFR-02 | Responsiveness | While the worker parses, no main-thread task exceeds 100 ms, and Cancel responds within 200 ms. | Playwright perf test with Long Tasks API (E2E-14). |
| NFR-03 | Performance (Node) | `pnpm bench` parses the same 1,000 invoices in ≤ 5 s on a GitHub `ubuntu-latest` runner; CI fails above 10 s. | `bench` CI job. |
| NFR-04 | Memory | `iterateZip` holds at most one decompressed entry plus one nested archive per depth level in memory, beyond the results it yields. | Code review against TRD §10.3; bomb tests. |
| NFR-05 | Bundle size (min + brotli, measured by size-limit, dependencies included) | `@firatkill/efatura` full import ≤ 40 kB; `@firatkill/efatura/zip` full import (includes core) ≤ 50 kB; playground initial JS + CSS ≤ 90 kB excluding fonts; worker chunk ≤ 60 kB; Excel chunk (lazy) ≤ 120 kB. | `pnpm size` in CI; playground budgets in `playground/size-limit.json`. |
| NFR-06 | Privacy | The playground makes no network request except same-origin static assets (HTML, JS, CSS, fonts, `samples/*`). No cookies, no `localStorage` keys except `efatura.lang` and `efatura.theme`. | E2E-12 records all requests and storage. |
| NFR-07 | Accessibility | WCAG 2.2 AA. axe-core reports 0 violations on every view and state. Keyboard-only operation of every feature. Severity is never conveyed by colour alone. | E2E-10, E2E-11; manual screen-reader pass in the release checklist. |
| NFR-08 | Responsive | No horizontal page scroll from 360 px to 1920 px wide. | E2E-13 at 360, 768, 1280. |
| NFR-09 | Determinism | Same input and options produce deep-equal output across runs, Node versions and browsers. The fixture generator is byte-reproducible. | Snapshot tests in Node and browser; `fixtures:check`. |
| NFR-10 | Robustness | For any byte input, `parseInvoice` returns or throws `EfaturaParseError`; nothing else escapes. | PT-05 fuzz property test (10,000 runs in CI). |
| NFR-11 | Types | Public `.d.ts` files contain no `any`; `attw --pack` reports no problems for ESM and CJS consumers; `publint` reports no errors. | `package` CI job. |
| NFR-12 | Security | Playground CSP as in TRD §14.7; XSLT output sandboxed (TRD §14); ZIP limits enforced (TRD §10); DOCTYPE rejected (no entity expansion). | E2E-08, E2E-09, UT and ZIP tests. |
| NFR-13 | Test coverage | `src/` (excluding `src/cli/`) ≥ 95% lines and ≥ 90% branches; `src/decimal/**`, `src/ids/**`, `src/validate/**`, `src/export/csv.ts` 100% lines. | `pnpm test:coverage` thresholds. |
| NFR-14 | Runtime support | Node 20, 22, 24 (CI matrix); Chrome and Edge last 2 versions, Firefox last 2 + ESR, Safari 16.4+. No Node built-ins in the core and zip entries. | CI matrix; Vitest browser mode in Chromium, Firefox, WebKit; ESLint `no-restricted-imports`. |
| NFR-15 | Supply chain | Runtime dependencies of the package: exactly `fast-xml-parser` and `fflate`, pinned. Every shipped dependency (package and playground) has a licence in the allowlist (TRD §17.6). Releases carry npm provenance. | `pnpm licenses:check`; `npm view @firatkill/efatura` shows provenance. |
| NFR-16 | CLI startup | `efatura --version` completes in ≤ 300 ms on the CI runner. | CT-10. |
| NFR-17 | Code quality | TypeScript `strict` with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; ESLint and Prettier clean; no `any`, no `@ts-ignore`. | `lint` and `typecheck` jobs. |
| NFR-18 | Documentation | Every exported symbol has a TSDoc comment with at least one example; READMEs exist in English and Turkish with equivalent content. | `pnpm docs:check` (TRD §17.7). |

**Typical invoice** (for NFR-01, NFR-03): the fixture `bench/typical` produced by the generator: TEMELFATURA SATIS, TRY, 5 lines with KDV 20 %, both parties with full addresses, 3 notes (the first is the synthetic-data marker, TRD §15.2), an embedded XSLT attachment of 60 kB (base64 ≈ 80 kB), total file size ≈ 95 kB. The benchmark ZIP holds 1,000 copies with distinct UUIDs in 10 nested monthly ZIPs.

## 9. Playground pages, states and copy

All copy is exact. The left column is the i18n key (used in `playground/src/i18n/en.ts` and `tr.ts`), then English, then Turkish. `{name}` marks an interpolated value. Numbers and amounts are formatted per language (TRD §14.9): Turkish `1.234,56`, English `1,234.56`; dates as `14.07.2025` (TR) and `2025-07-14` (EN).

Tone: plain, short, no exclamation marks, no emoji. Turkish copy uses the formal "siz" form.

### 9.1 Global layout

Header (all views): product name `efatura` in the mono font, linked to `#/`; tagline; language toggle (two buttons, `aria-pressed`); theme menu; GitHub link. Below the header, the privacy banner (§9.2). Footer at the bottom of every view.

| Key | English | Turkish |
|---|---|---|
| `app.title` (document title, home) | efatura · Turkish e-invoice parser | efatura · e-Fatura ayrıştırıcı |
| `app.title.results` | {count} invoices · efatura | {count} fatura · efatura |
| `app.title.detail` | Invoice {number} · efatura | Fatura {number} · efatura |
| `app.title.privacy` | Privacy · efatura | Gizlilik · efatura |
| `header.tagline` | Turkish e-invoice parser | e-Fatura ayrıştırıcı |
| `header.lang.label` (group label) | Language | Dil |
| `header.lang.tr` | Türkçe | Türkçe |
| `header.lang.en` | English | English |
| `header.theme.label` | Theme | Tema |
| `header.theme.system` | System | Sistem |
| `header.theme.light` | Light | Açık |
| `header.theme.dark` | Dark | Koyu |
| `header.source` | Source code | Kaynak kod |
| `skip.link` | Skip to main content | Ana içeriğe geç |
| `footer.license` | MIT licensed. Built by Fırat Kıl. | MIT lisanslı. Fırat Kıl tarafından geliştirildi. |
| `footer.privacy` | No cookies, no analytics. | Çerez yok, analitik yok. |
| `footer.privacyLink` | Privacy | Gizlilik |
| `footer.npm` | npm package | npm paketi |
| `footer.disclaimer` | Not affiliated with the Revenue Administration (GİB). Not tax advice. | Gelir İdaresi Başkanlığı (GİB) ile bağlantısı yoktur. Vergi danışmanlığı değildir. |

### 9.2 Privacy banner

A full-width strip under the header on every view. Not dismissible (it is short and is the main promise). Contains a lock-shaped SVG icon (decorative, `aria-hidden`), the statement, one sentence of explanation and a link.

| Key | English | Turkish |
|---|---|---|
| `privacy.banner.title` | Your files never leave your browser. | Dosyalarınız tarayıcınızdan çıkmaz. |
| `privacy.banner.body` | Parsing runs on your device. Nothing is uploaded, stored on a server or tracked. | Ayrıştırma cihazınızda çalışır. Hiçbir şey yüklenmez, sunucuda saklanmaz veya izlenmez. |
| `privacy.banner.link` | How this works | Nasıl çalışır |

### 9.3 Home view (`#/`), state: empty

| Key | English | Turkish |
|---|---|---|
| `home.h1` | Read e-invoices in your browser | e-Faturaları tarayıcınızda okuyun |
| `home.lead` | Drop UBL-TR e-Fatura or e-Arşiv XML files, or ZIP archives of them. You get every invoice and line in a table, checks for broken totals and invalid tax numbers, the official view, and exports for Excel. | UBL-TR e-Fatura veya e-Arşiv XML dosyalarını ya da bunların ZIP arşivlerini bırakın. Tüm fatura ve satırları tabloda görür, bozuk toplamlar ve geçersiz vergi numaraları için kontrolleri, resmî görünümü ve Excel için dışa aktarmaları alırsınız. |
| `drop.label` (dropzone accessible name) | File drop area | Dosya bırakma alanı |
| `drop.title` | Drop XML or ZIP files here | XML veya ZIP dosyalarını buraya bırakın |
| `drop.or` | or | veya |
| `drop.button` | Choose files | Dosya seçin |
| `drop.hint` | ZIP archives may contain folders and other ZIP archives, up to 3 levels deep. | ZIP arşivleri klasörler ve başka ZIP arşivleri içerebilir (en fazla 3 seviye). |
| `samples.h2` | Try a sample | Örnek deneyin |
| `samples.note` | All samples are synthetic. They contain no real company or personal data. | Tüm örnekler yapaydır; gerçek şirket veya kişi verisi içermez. |
| `samples.all` | Load all samples | Tüm örnekleri yükle |
| `sample.plainSale` | Sale in TRY | TL satış faturası |
| `sample.usdSale` | Sale in USD with exchange rate | Kurlu USD satış faturası |
| `sample.withholding` | Withholding 5/10 (tevkifat) | 5/10 tevkifatlı fatura |
| `sample.earsiv` | e-Arşiv to an individual | Bireye e-Arşiv fatura |
| `sample.xslt` | With official view (XSLT) | Resmî görünümlü (XSLT) |
| `sample.brokenTotals` | Broken totals (shows issues) | Hatalı toplamlar (sorunları gösterir) |
| `sample.nestedZip` | Nested ZIP with 6 invoices | 6 fatura içeren iç içe ZIP |

Samples map to fixture scenarios: plainSale S01, usdSale S02, withholding S06, earsiv S16, xslt S25, brokenTotals S26, nestedZip S35 (TRD §15.4).

### 9.4 Home view, state: drag over

The dropzone border becomes the accent colour and 2 px; the title is replaced.

| Key | English | Turkish |
|---|---|---|
| `drop.active` | Release to read {count} files | {count} dosyayı okumak için bırakın |
| `drop.activeUnknown` (count not available during drag) | Release to read the files | Dosyaları okumak için bırakın |

### 9.5 Home view, state: large selection confirmation

Shown as a native `<dialog>` when the selected files total more than 200 MB.

| Key | English | Turkish |
|---|---|---|
| `large.title` | Read {size} of files? | {size} dosya okunsun mu? |
| `large.body` | Large selections can take a few minutes and use a lot of memory. Archives are limited to 500 MB after unpacking. | Büyük seçimler birkaç dakika sürebilir ve çok bellek kullanabilir. Arşivler açıldıktan sonra en fazla 500 MB olabilir. |
| `large.confirm` | Read files | Dosyaları oku |
| `large.cancel` | Cancel | İptal |

### 9.6 Processing state

Replaces the dropzone. Progress is a `<progress>` element when the total file count is known (plain XML selections), indeterminate for ZIPs. The status line is in an `aria-live="polite"` region updated at most once per second.

| Key | English | Turkish |
|---|---|---|
| `progress.h2` | Reading files… | Dosyalar okunuyor… |
| `progress.known` | {done} of {total} files · {invoices} invoices · {failed} could not be read | {total} dosyadan {done} tanesi · {invoices} fatura · {failed} okunamadı |
| `progress.unknown` | {done} files read · {invoices} invoices · {failed} could not be read | {done} dosya okundu · {invoices} fatura · {failed} okunamadı |
| `progress.current` | Now reading {path} | Okunan: {path} |
| `progress.cancel` | Cancel | İptal |
| `progress.cancelling` | Cancelling… | İptal ediliyor… |

### 9.7 Cancelled state

| Key | English | Turkish |
|---|---|---|
| `cancelled.h2` | Reading cancelled | Okuma iptal edildi |
| `cancelled.body` | {invoices} invoices were read before you cancelled. | İptalden önce {invoices} fatura okundu. |
| `cancelled.show` | Show what was read | Okunanları göster |
| `cancelled.restart` | Start over | Baştan başla |

If 0 invoices were read, only "Start over" is shown.

### 9.8 No invoices found state

| Key | English | Turkish |
|---|---|---|
| `none.h2` | No invoices found | Fatura bulunamadı |
| `none.body` | None of the {files} files contained a UBL-TR invoice. Check that you exported e-Fatura or e-Arşiv XML, not PDF or HTML. | {files} dosyanın hiçbiri UBL-TR fatura içermiyor. PDF veya HTML değil, e-Fatura ya da e-Arşiv XML dışa aktardığınızdan emin olun. |
| `none.details` | Show file list | Dosya listesini göster |
| `none.restart` | Try other files | Başka dosya deneyin |

### 9.9 Results view (`#/`), state: results

Layout from top: summary line; action bar (Add files, Export, Start over); filter bar; tabs (Invoices, Lines, Issues); tab panel; pagination.

Summary and actions:

| Key | English | Turkish |
|---|---|---|
| `results.h1` | Results | Sonuçlar |
| `results.summary` | {invoices} invoices from {files} files · {withErrors} with errors · {withWarnings} with warnings · {duplicates} duplicates | {files} dosyadan {invoices} fatura · {withErrors} hatalı · {withWarnings} uyarılı · {duplicates} mükerrer |
| `results.failedNote` | {failed} files could not be read and {skipped} were skipped. See the Issues tab. | {failed} dosya okunamadı, {skipped} dosya atlandı. Sorunlar sekmesine bakın. |
| `actions.add` | Add files | Dosya ekle |
| `actions.export` | Export | Dışa aktar |
| `actions.restart` | Start over | Baştan başla |
| `restart.title` | Clear all results? | Tüm sonuçlar silinsin mi? |
| `restart.body` | This removes the results from this tab. Your files are not affected. | Bu işlem sonuçları bu sekmeden kaldırır. Dosyalarınız etkilenmez. |
| `restart.confirm` | Clear results | Sonuçları sil |
| `restart.cancel` | Keep results | Vazgeç |

Filters (one `<form role="search">`; changes apply immediately, debounced 200 ms for text):

| Key | English | Turkish |
|---|---|---|
| `filters.label` | Filters | Filtreler |
| `filters.search` | Search | Ara |
| `filters.searchPlaceholder` | Number, UUID or name | Numara, UUID veya ad |
| `filters.supplier` | Supplier | Satıcı |
| `filters.supplierAll` | All suppliers | Tüm satıcılar |
| `filters.type` | Invoice type | Fatura tipi |
| `filters.typeAll` | All types | Tüm tipler |
| `filters.from` | From | Başlangıç |
| `filters.to` | To | Bitiş |
| `filters.onlyIssues` | Only invoices with issues | Yalnızca sorunlu faturalar |
| `filters.clear` | Clear filters | Filtreleri temizle |
| `filters.count` | Showing {shown} of {total} invoices | {total} faturadan {shown} tanesi gösteriliyor |
| `filters.invalidRange` | The start date is after the end date. | Başlangıç tarihi bitiş tarihinden sonra. |

Supplier options read `{name} ({taxId})`, sorted by name using `localeCompare` with the current language. Type options use the code list label: `{label} ({code})`, for example `Tevkifat (TEVKIFAT)`.

Tabs (`role="tablist"`, arrow-key navigation):

| Key | English | Turkish |
|---|---|---|
| `tab.invoices` | Invoices ({count}) | Faturalar ({count}) |
| `tab.lines` | Lines ({count}) | Satırlar ({count}) |
| `tab.issues` | Issues ({count}) | Sorunlar ({count}) |

Invoices table columns (left to right; amounts right-aligned, mono font):

| Key | English | Turkish |
|---|---|---|
| `col.number` | Number | Fatura No |
| `col.date` | Date | Tarih |
| `col.supplier` | Supplier | Satıcı |
| `col.customer` | Customer | Alıcı |
| `col.profile` | Scenario | Senaryo |
| `col.type` | Type | Tip |
| `col.currency` | Currency | Döviz |
| `col.taxInclusive` | Total incl. tax | Vergiler dahil toplam |
| `col.withholding` | Withholding | Tevkifat |
| `col.payable` | Payable | Ödenecek |
| `col.status` | Status | Durum |

Lines table columns:

| Key | English | Turkish |
|---|---|---|
| `col.invoiceNumber` | Invoice | Fatura |
| `col.lineNo` | Line | Sıra |
| `col.item` | Item | Mal/Hizmet |
| `col.quantity` | Quantity | Miktar |
| `col.unit` | Unit | Birim |
| `col.unitPrice` | Unit price | Birim fiyat |
| `col.lineAmount` | Amount | Tutar |
| `col.kdvPercent` | VAT % | KDV % |
| `col.kdvAmount` | VAT | KDV |

Status cell and badges:

| Key | English | Turkish |
|---|---|---|
| `status.ok` | No issues | Sorun yok |
| `status.errors` | {count} errors | {count} hata |
| `status.warnings` | {count} warnings | {count} uyarı |
| `status.duplicate` | Duplicate | Mükerrer |
| `severity.error` | Error | Hata |
| `severity.warning` | Warning | Uyarı |
| `severity.info` | Info | Bilgi |

When both errors and warnings exist the cell shows both badges. Each badge is an SVG shape (error: octagon with a cross; warning: triangle with an exclamation mark; info: circle with an "i"; ok: circle with a check) plus the visible text, plus colour.

Sorting (Should, FR-43): column headers for Date, Number, Supplier and Payable are buttons.

| Key | English | Turkish |
|---|---|---|
| `sort.by` | Sort by {column} | {column} sütununa göre sırala |
| `sort.asc` | ascending | artan |
| `sort.desc` | descending | azalan |

Pagination:

| Key | English | Turkish |
|---|---|---|
| `pager.label` | Pagination | Sayfalama |
| `pager.status` | Page {page} of {pages} | Sayfa {page}/{pages} |
| `pager.prev` | Previous | Önceki |
| `pager.next` | Next | Sonraki |

Row interaction: in the Invoices tab the number cell is a link to `#/invoice/<id>`. In the Lines tab the invoice cell links to the same.

Mobile cards (< 640 px): each card shows Number (link), Date, Supplier, Payable with currency, and the status badges; line cards show Invoice, Line, Item, Quantity + Unit, Amount.

Empty filter result:

| Key | English | Turkish |
|---|---|---|
| `empty.filtered` | No invoices match these filters. | Bu filtrelere uyan fatura yok. |
| `empty.filteredLines` | No lines match these filters. | Bu filtrelere uyan satır yok. |

### 9.10 Issues tab

Columns: Severity, Code, Message, Invoice, File, Location. Severity filter is a group of three checkboxes (all checked by default), each showing a count.

| Key | English | Turkish |
|---|---|---|
| `issues.filterLabel` | Show | Göster |
| `issues.errors` | Errors ({count}) | Hatalar ({count}) |
| `issues.warnings` | Warnings ({count}) | Uyarılar ({count}) |
| `issues.infos` | Info ({count}) | Bilgiler ({count}) |
| `issues.col.severity` | Severity | Önem |
| `issues.col.code` | Code | Kod |
| `issues.col.message` | Message | Mesaj |
| `issues.col.invoice` | Invoice | Fatura |
| `issues.col.file` | File | Dosya |
| `issues.col.path` | Location | Konum |
| `issues.empty` | No issues found. Every invoice passed all checks. | Sorun bulunamadı. Tüm faturalar kontrollerden geçti. |
| `issues.emptyFiltered` | No issues match the selected severities. | Seçilen önem düzeylerine uyan sorun yok. |
| `issues.codeHelp` | What does {code} mean? | {code} ne anlama geliyor? |
| `files.failed.h2` | Files that could not be read ({count}) | Okunamayan dosyalar ({count}) |
| `files.skipped.h2` | Skipped files ({count}) | Atlanan dosyalar ({count}) |
| `files.skipped.body` | These files are not XML or ZIP (for example PDF or HTML) or are system files. | Bu dosyalar XML veya ZIP değil (örneğin PDF veya HTML) ya da sistem dosyası. |

The `issues.codeHelp` link points to `https://github.com/firatkill/efatura/blob/main/docs/TRD.md#93-issue-catalogue` with the code as a text fragment; it opens in a new tab with `rel="noopener noreferrer"`.

Failed-file messages, keyed by error code (TRD §5.6 and §10.4):

| Key | English | Turkish |
|---|---|---|
| `fileError.EMPTY_INPUT` | The file is empty. | Dosya boş. |
| `fileError.INPUT_TOO_LARGE` | The file is larger than {limit} MB. | Dosya {limit} MB'tan büyük. |
| `fileError.NOT_XML` | Not a well-formed XML file (line {line}, column {column}). | Geçerli bir XML dosyası değil (satır {line}, sütun {column}). |
| `fileError.DOCTYPE_FORBIDDEN` | The file contains a DOCTYPE declaration, which is not allowed for security reasons. | Dosya, güvenlik nedeniyle izin verilmeyen bir DOCTYPE bildirimi içeriyor. |
| `fileError.NOT_INVOICE` | This XML is not an invoice (root element: {root}). | Bu XML bir fatura değil (kök eleman: {root}). |
| `fileError.NOT_INVOICE.envelope` | This XML is a GİB envelope, not an invoice. Envelopes are not supported yet. | Bu XML fatura değil, bir GİB zarfı. Zarflar henüz desteklenmiyor. |
| `fileError.ZIP_INVALID` | The ZIP archive is damaged or uses an unsupported format. | ZIP arşivi bozuk veya desteklenmeyen bir biçimde. |
| `fileError.ZIP_ENCRYPTED` | Password-protected ZIP entries are not supported. | Parola korumalı ZIP dosyaları desteklenmiyor. |
| `fileError.ZIP_UNSUPPORTED_METHOD` | This ZIP entry uses a compression method that is not supported. | Bu ZIP girdisi desteklenmeyen bir sıkıştırma yöntemi kullanıyor. |
| `fileError.ZIP_DEPTH_EXCEEDED` | ZIP archives are nested more than {max} levels deep. This archive was skipped. | ZIP arşivleri {max} seviyeden fazla iç içe. Bu arşiv atlandı. |
| `fileError.ZIP_TOO_MANY_ENTRIES` | The archive has more than {max} files. Reading stopped at the limit. | Arşivde {max} dosyadan fazlası var. Okuma sınırda durduruldu. |
| `fileError.ZIP_TOO_LARGE` | The archive unpacks to more than {max} MB. Reading stopped at the limit. | Arşiv açıldığında {max} MB'ı aşıyor. Okuma sınırda durduruldu. |
| `fileError.ZIP_ENTRY_TOO_LARGE` | This file unpacks to more than {max} MB and was skipped. | Bu dosya açıldığında {max} MB'ı aşıyor ve atlandı. |
| `fileError.ZIP_RATIO_EXCEEDED` | This file is compressed more than {max} to 1, which is typical of zip bombs. It was skipped. | Bu dosya {max}'e 1'den fazla sıkıştırılmış; bu, zip bombalarına özgüdür. Atlandı. |
| `fileError.READ_FAILED` | The browser could not read this file. | Tarayıcı bu dosyayı okuyamadı. |

### 9.11 Export menu

A menu button (`aria-haspopup="menu"`) opening a list of four items. Exports use the current tab's level (Invoices tab and Issues tab: invoice level; Lines tab: line level) and the current filters.

| Key | English | Turkish |
|---|---|---|
| `export.csvTr` | CSV for Excel (Turkish) | Excel için CSV (Türkçe) |
| `export.csvComma` | CSV (comma-separated) | CSV (virgülle ayrılmış) |
| `export.json` | JSON | JSON |
| `export.xlsx` | Excel workbook (.xlsx) | Excel çalışma kitabı (.xlsx) |
| `export.scope` | Exports the {count} rows that match the current filters. | Geçerli filtrelere uyan {count} satırı dışa aktarır. |
| `export.preparing` | Preparing Excel file… | Excel dosyası hazırlanıyor… |
| `export.xlsxFailed` | The Excel writer could not be loaded. Use CSV instead. | Excel modülü yüklenemedi. Bunun yerine CSV kullanın. |
| `export.done` | Saved {filename} | {filename} kaydedildi |

File names: `efatura-{level}-{YYYYMMDD-HHmm}.{ext}` with level `invoices` or `lines` and local time, for example `efatura-lines-20251021-1430.csv`. CSV for Excel (Turkish) uses Turkish header labels; CSV with commas uses English labels; JSON contains the filtered invoices (without `raw` and attachment data) and their issues. The Excel workbook has one sheet named `Faturalar`/`Invoices` or `Satırlar`/`Lines` according to the UI language, header labels in the UI language.

### 9.12 Invoice detail view (`#/invoice/<id>`)

A full view (not a modal). Focus moves to the H1 on open. Sections are `<section>` elements with H2 headings; definition lists for key–value data; tables for lines, taxes and totals.

| Key | English | Turkish |
|---|---|---|
| `detail.back` | Back to results | Sonuçlara dön |
| `detail.h1` | Invoice {number} | Fatura {number} |
| `detail.h1NoNumber` | Invoice without a number | Numarasız fatura |
| `detail.prev` | Previous invoice | Önceki fatura |
| `detail.next` | Next invoice | Sonraki fatura |
| `detail.position` | {index} of {total} | {total} faturadan {index}. |
| `detail.summary` | Summary | Özet |
| `detail.uuid` | UUID (ETTN) | ETTN (UUID) |
| `detail.issueDate` | Issue date | Düzenleme tarihi |
| `detail.issueTime` | Issue time | Düzenleme saati |
| `detail.profile` | Scenario | Senaryo |
| `detail.type` | Invoice type | Fatura tipi |
| `detail.currency` | Currency | Döviz cinsi |
| `detail.rate` | Exchange rate | Döviz kuru |
| `detail.rateSource.PricingExchangeRate` | from the invoice's pricing exchange rate | faturanın fiyatlandırma kurundan |
| `detail.rateSource.TaxExchangeRate` | from the tax exchange rate | vergi kurundan |
| `detail.rateSource.PaymentExchangeRate` | from the payment exchange rate | ödeme kurundan |
| `detail.rateSource.PaymentAlternativeExchangeRate` | from the alternative payment exchange rate | alternatif ödeme kurundan |
| `detail.rateSource.Note` | read from a note | nottan okundu |
| `detail.dueDate` | Due date | Vade tarihi |
| `detail.file` | File | Dosya |
| `detail.signed` | Signature present | İmza var |
| `detail.yes` | Yes | Evet |
| `detail.no` | No | Hayır |
| `detail.supplier` | Supplier | Satıcı |
| `detail.customer` | Customer | Alıcı |
| `detail.buyer` | Buyer | Asıl alıcı |
| `detail.taxId.VKN` | Tax number (VKN) | Vergi kimlik no (VKN) |
| `detail.taxId.TCKN` | Identity number (TCKN) | TC kimlik no (TCKN) |
| `detail.taxOffice` | Tax office | Vergi dairesi |
| `detail.address` | Address | Adres |
| `detail.contact` | Contact | İletişim |
| `detail.otherIds` | Other identifiers | Diğer tanımlayıcılar |
| `detail.lines` | Lines ({count}) | Satırlar ({count}) |
| `detail.allowance` | Discount | İskonto |
| `detail.charge` | Charge | Artırım |
| `detail.exemption` | Exemption {code}: {reason} | İstisna {code}: {reason} |
| `detail.taxes` | Taxes | Vergiler |
| `detail.tax.type` | Tax | Vergi |
| `detail.tax.base` | Taxable amount | Matrah |
| `detail.tax.rate` | Rate | Oran |
| `detail.tax.amount` | Tax amount | Vergi tutarı |
| `detail.withholding` | Withholding (tevkifat) | Tevkifat |
| `detail.withholding.ratio` | Ratio | Oran |
| `detail.totals` | Totals | Toplamlar |
| `detail.total.lineExtension` | Sum of lines | Mal/hizmet toplam tutarı |
| `detail.total.allowance` | Total discount | Toplam iskonto |
| `detail.total.charge` | Total charge | Toplam artırım |
| `detail.total.taxExclusive` | Total excl. tax | Vergiler hariç tutar |
| `detail.total.taxInclusive` | Total incl. tax | Vergiler dahil tutar |
| `detail.total.withholding` | Withholding | Tevkifat tutarı |
| `detail.total.rounding` | Rounding | Yuvarlama |
| `detail.total.payable` | Payable | Ödenecek tutar |
| `detail.total.payableTry` | Payable in TRY at the invoice rate | Fatura kuruyla ödenecek TL tutarı |
| `detail.notes` | Notes | Notlar |
| `detail.references` | References | Referanslar |
| `detail.ref.order` | Order | Sipariş |
| `detail.ref.despatch` | Despatch advice | İrsaliye |
| `detail.ref.billing` | Original invoice | İlgili fatura |
| `detail.ref.other` | Other document | Diğer belge |
| `detail.attachments` | Attachments | Ekler |
| `detail.attachment.download` | Download {filename} | {filename} indir |
| `detail.issues` | Issues ({count}) | Sorunlar ({count}) |
| `detail.issuesNone` | No issues | Sorun yok |
| `detail.none` | None | Yok |
| `detail.notFound.h1` | Invoice not found | Fatura bulunamadı |
| `detail.notFound.body` | This invoice is not in the current results. Results are kept only while this tab is open. | Bu fatura geçerli sonuçlarda yok. Sonuçlar yalnızca bu sekme açıkken tutulur. |

Empty optional sections are omitted, except Issues, which always shows ("No issues").

### 9.13 Official view (section inside the detail view)

| Key | English | Turkish |
|---|---|---|
| `official.h2` | Official view | Resmî görünüm |
| `official.none` | This invoice has no embedded XSLT, so the official view is not available. | Bu faturada gömülü XSLT yok; resmî görünüm gösterilemiyor. |
| `official.intro` | Renders the invoice with its own XSLT stylesheet in an isolated frame. Scripts, forms and network access are blocked. | Faturayı kendi XSLT şablonuyla, yalıtılmış bir çerçevede gösterir. Betikler, formlar ve ağ erişimi engellenir. |
| `official.show` | Show official view | Resmî görünümü göster |
| `official.rendering` | Rendering… | İşleniyor… |
| `official.frameTitle` | Official view of invoice {number} | {number} numaralı faturanın resmî görünümü |
| `official.hide` | Hide | Gizle |
| `official.downloadHtml` | Download HTML | HTML indir |
| `official.downloadXslt` | Download XSLT | XSLT indir |
| `official.downloadXml` | Download XML | XML indir |
| `official.blocked` | This stylesheet tries to load other files ({reason}), so it was not run. | Bu şablon başka dosyalar yüklemeye çalışıyor ({reason}); bu nedenle çalıştırılmadı. |
| `official.tooLarge` | The stylesheet is larger than 5 MB and was not run. | Şablon 5 MB'tan büyük olduğu için çalıştırılmadı. |
| `official.failed` | The stylesheet could not be applied: {message} | Şablon uygulanamadı: {message} |
| `official.unsupported` | This browser cannot run XSLT. Download the XML and XSLT to view the invoice in another program. | Bu tarayıcı XSLT çalıştıramıyor. Faturayı başka bir programda görmek için XML ve XSLT dosyalarını indirin. |
| `official.note` | The view is produced by the issuer's stylesheet. efatura does not check that it matches the data above. | Bu görünüm düzenleyenin şablonuyla üretilir. efatura, yukarıdaki verilerle uyuşup uyuşmadığını kontrol etmez. |

`{reason}` values: `xsl:import`, `xsl:include`, `document()`.

### 9.14 Privacy view (`#/privacy`)

| Key | English | Turkish |
|---|---|---|
| `privacy.h1` | Privacy | Gizlilik |
| `privacy.p1` | efatura reads your files with JavaScript inside this browser tab. The files are never uploaded. The page has no server-side code: it is a set of static files. | efatura dosyalarınızı bu tarayıcı sekmesinin içinde JavaScript ile okur. Dosyalar hiçbir zaman yüklenmez. Sayfanın sunucu tarafında çalışan kodu yoktur; yalnızca statik dosyalardan oluşur. |
| `privacy.p2` | Parsing runs in a Web Worker, a background thread of this page. Results stay in this tab's memory and are discarded when you close or reload it. Nothing is written to cookies, local storage or IndexedDB, except your language and theme choice. | Ayrıştırma, bu sayfanın arka plan iş parçacığı olan bir Web Worker içinde çalışır. Sonuçlar bu sekmenin belleğinde kalır ve sekmeyi kapattığınızda veya yenilediğinizde silinir. Dil ve tema tercihiniz dışında çerezlere, yerel depolamaya veya IndexedDB'ye hiçbir şey yazılmaz. |
| `privacy.p3` | The site uses no analytics, no cookies and no third-party scripts or fonts. A Content Security Policy blocks the page from connecting to any other server. | Site analitik, çerez veya üçüncü taraf betik ya da yazı tipi kullanmaz. İçerik Güvenliği Politikası (CSP), sayfanın başka bir sunucuya bağlanmasını engeller. |
| `privacy.p4` | The official view runs the stylesheet embedded in the invoice. It runs in a sandboxed frame with scripts and network access blocked, so the stylesheet cannot send your data anywhere. | Resmî görünüm, faturanın içine gömülü şablonu çalıştırır. Şablon, betiklerin ve ağ erişiminin engellendiği yalıtılmış bir çerçevede çalışır; bu nedenle verilerinizi hiçbir yere gönderemez. |
| `privacy.p5` | The hosting provider (Vercel) receives standard request data such as your IP address when you load the page, as with any website. It never receives your files. | Barındırma sağlayıcısı (Vercel), her web sitesinde olduğu gibi sayfayı yüklediğinizde IP adresiniz gibi standart istek bilgilerini alır. Dosyalarınızı hiçbir zaman almaz. |
| `privacy.p6` | You can check all of this in the source code and in your browser's network panel. | Bunların hepsini kaynak kodda ve tarayıcınızın ağ panelinde doğrulayabilirsiniz. |
| `privacy.back` | Back to the playground | Deneme alanına dön |

### 9.15 Error and unsupported states

| Key | English | Turkish |
|---|---|---|
| `crash.h2` | Something went wrong | Bir sorun oluştu |
| `crash.body` | The parser stopped unexpectedly. Your files were not sent anywhere. Reload the page and try again. | Ayrıştırıcı beklenmedik şekilde durdu. Dosyalarınız hiçbir yere gönderilmedi. Sayfayı yenileyip tekrar deneyin. |
| `crash.reload` | Reload | Yenile |
| `unsupported.h2` | This browser is not supported | Bu tarayıcı desteklenmiyor |
| `unsupported.body` | efatura needs module Web Workers. Use a current version of Chrome, Edge, Firefox or Safari. | efatura modül Web Worker desteğine ihtiyaç duyar. Chrome, Edge, Firefox veya Safari'nin güncel bir sürümünü kullanın. |
| `noscript` (in `<noscript>`, both languages shown) | efatura needs JavaScript to read files in your browser. | efatura dosyaları tarayıcınızda okumak için JavaScript'e ihtiyaç duyar. |
| `notFound.h1` | Page not found | Sayfa bulunamadı |
| `notFound.back` | Back to the playground | Deneme alanına dön |
| `sampleFailed` | The sample could not be loaded. Check your connection and try again. | Örnek yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin. |

## 10. Library and CLI user-facing text

Issue messages (English and Turkish) for every code are in TRD §9.3. CLI help and output texts are in TRD §12. Both are part of the public contract: changing a message is a patch change; changing a code's meaning or default severity is a breaking change (TRD §19).

## 11. Success metrics

| ID | Metric | Target | When |
|---|---|---|---|
| SM-01 | Fixture scenarios passing (snapshot + expected issues) | 43/43 | 0.1.0 |
| SM-02 | Validation rules with a positive and negative unit test | 100 % | 0.1.0 |
| SM-03 | Core line coverage | ≥ 95 % | 0.1.0 |
| SM-04 | Browser parse of 1,000 typical invoices on the reference laptop | ≤ 8 s | 0.1.0, every minor |
| SM-05 | Package size (core, brotli) | ≤ 40 kB | every release |
| SM-06 | Lighthouse (playground, mobile): Accessibility 100, Best Practices 100, Performance ≥ 90 | met | 0.1.0 |
| SM-07 | False-positive error issues on the owner's private corpus (FR-57, run locally) | ≤ 1 % of invoices; every false positive recorded as a decision or a fix | 0.1.0 |
| SM-08 | External signal of usefulness | ≥ 1 issue or PR from someone other than the owner, or ≥ 50 weekly npm downloads | 3 months after 0.1.0 |

## 12. Milestones

| Milestone | Content | Exit criteria |
|---|---|---|
| M0 Setup | Repository, tooling, CI skeleton, build, package checks, changesets, licence check | `pnpm lint typecheck test build` green in CI; publint and attw pass on an empty export |
| M1 Model + core parser | Decimal, decoding, XML tree with namespaces, code lists, model types, all mappings, attachments, raw access | `parseInvoice` maps every field in TRD §7 on hand-written test XML; unit tests pass |
| M2 Validation | Issue infrastructure, messages, checksums, rules EF001–EF066, configuration | Every rule has positive and negative tests |
| M3 ZIP + batch + exports | `parseMany`, iterators, abort, duplicates, `parseZip` with limits, `parseAny`, `toRows`, `toCsv` | ZIP limit tests and CSV property tests pass; size budgets met |
| M4 CLI | `efatura parse` with all options, progress, exit codes | CLI tests (spawned built bin) pass on Linux and Windows |
| M5 Fixtures + full test suite | Generator, 43 scenarios, manifest, `fixtures:check`, snapshots, property and fuzz tests, browser tests, benchmark | All CI jobs green; coverage thresholds met |
| M6 Playground | Static site with worker, views, filters, detail, official view, exports, i18n, themes, CSP | E2E suite, axe and network-privacy tests pass; preview deploy works |
| M7 Docs + release 0.1.0 + deploy | READMEs, docs review, publish workflow, production deploy to efatura.firatkil.com | 0.1.0 on npm with provenance; playground live; release checklist done |

## 13. Out of scope (v1) and future work

| Item | Why not in v1 | Possible later approach |
|---|---|---|
| e-İrsaliye (DespatchAdvice) | Different document type and model | Second root type `DespatchAdvice` with its own model |
| e-SMM (serbest meslek makbuzu) | e-Arşiv-like but separate document rules | Profile-specific model extension |
| e-Müstahsil makbuzu | Separate document and tax rules | Same as above |
| Application responses (KABUL/RED, ApplicationResponse) | Not an invoice | Small separate parser |
| GİB envelopes (StandardBusinessDocument containing invoices) | Wrapper format; detected and reported (`NOT_INVOICE` with hint `envelope`) | Unwrap and yield each Invoice |
| Signing, sending to GİB or an integrator | Requires certificates and legal process | Not planned |
| Signature verification (XAdES) | Needs crypto and certificate chains | Optional separate package |
| Full XSD and schematron validation | Large; official schematron is XSLT 2.0 | Optional separate package |
| Excel export in the core | Size and dependency budget | Playground only |
| Server-side XSLT rendering in Node | Needs an XSLT engine dependency | Optional separate package |
| PDF export of the official view | Needs a PDF engine | Browser print from a downloaded HTML |
| Persistent storage, accounts, sharing in the playground | Privacy promise and scope | Not planned |

## 14. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Schema and practice variations across integrators produce false errors (for example withholding not deducted, allowance totals reported differently). | High | Medium | Tolerant rules with alternative formulas (EF041, EF043/EF044); documented variations V-01–V-22 (TRD §6.5); private-corpus run before release (FR-57, SM-07); rule severities configurable. |
| R-02 | Official code lists change (new invoice types, tax codes, units). | High | Low | Unknown codes never fail parsing (`OTHER`, raw kept, warning); code lists carry a `verifiedAgainst` record; A-02–A-07 re-checked each minor release. |
| R-03 | Someone commits or attaches a real invoice (KVKK breach, client confidentiality). | Medium | High | Generator-only fixtures, manifest and content scans in CI (FR-55), PR template checkbox, issue templates that ask for a generator definition, AGENTS.md never-do list, `private/` git-ignored for local testing. |
| R-04 | Malicious XSLT in an invoice exfiltrates data or runs script. | Medium | High | Static guard (no import, include, `document()`, external URLs), DOMPurify sanitisation, `sandbox` iframe without `allow-scripts` or `allow-same-origin`, inner CSP `default-src 'none'`, page CSP `connect-src 'self'`, render only on click (TRD §14). |
| R-05 | Malicious XSLT causes an infinite loop and freezes the tab. | Low | Medium | Render only on explicit click; warning in the intro text; the tab can be closed; documented as a known limit. |
| R-06 | Browsers remove XSLT. Chrome has deprecated XSLT and announced removal from stable in Chrome 155, scheduled for 17 November 2026, about the time of 0.1.0 (verify at T-41); Firefox and WebKit support removal. Most Chrome and Edge users then cannot use the official view without a fallback, and Playwright's Chromium in CI loses it too. | Certain (Chrome) | Medium | Feature-detect `XSLTProcessor`; lazy-load a JavaScript/WASM XSLT 1.0 fallback if a permissively licensed one is available (A-17, candidates in TRD §14.6.1); otherwise show `official.unsupported` with downloads. E2E-08/E2E-09 assert whichever path the engine supports and are never skipped (TRD §16.3). |
| R-07 | Zip bombs or huge archives exhaust memory. | Medium | Medium | Limits on depth, entries, total bytes, entry bytes and ratio, counted on actual output bytes (TRD §10). |
| R-08 | XML entity expansion (billion laughs) or XXE. | Low | High | Reject any DOCTYPE before parsing (`DOCTYPE_FORBIDDEN`); fast-xml-parser does not resolve external entities. |
| R-09 | Users read the validation result as legal or tax advice. | Medium | Medium | Disclaimer in footer, READMEs and docs; messages describe internal consistency, not legality. |
| R-10 | Use of "GİB" or official look implies endorsement. | Low | Medium | Disclaimer; no GİB logos; neutral design. |
| R-11 | Fake VKN/TCKN in fixtures coincide with a real person or company. | Low | Medium | No official reserved test range is known, so synthetic identities use visibly artificial patterns (`99900000xx` VKN, `5000000xxxx` TCKN) with valid check digits, fictitious names ("Örnek", "Deneme", "Kurgu", "Hayali", "Sanal"); fixtures never combine them with real-looking addresses; every generated invoice carries a synthetic-data comment and note marker (TRD §15.2); the owner checks the VKNs once in GİB's public lookup (A-26). |
| R-12 | Bundle budget exceeded by fast-xml-parser. | Medium | Low | Measure at T-02; if over, record a decision with the measured size and adjust NFR-05 (never drop the dependency choice without owner approval). |
| R-13 | npm trusted publishing does not work with the pnpm/changesets publish path. | Medium | Low | Fallback in TRD §18.2 (npm CLI publish with provenance); A-15. |
| R-14 | Performance target missed on large XSLT-heavy archives. | Medium | Medium | Attachments as metadata only in batch mode; benchmark in CI; profile before release. |

## 15. Decisions log

| ID | Decision | Rationale | Source |
|---|---|---|---|
| D-01 | Scope: GİB e-Fatura and e-Arşiv invoices in UBL-TR 1.2 (Invoice root only). | Highest-volume document; matches the owner's experience. | Brief |
| D-02 | Runtime: Node 20+ and modern browsers; no Node built-ins in core and zip entries; ESM + CJS via tsup; types included. | One library for servers, scripts and the playground. | Brief |
| D-03 | Runtime dependencies: `fast-xml-parser` and `fflate` only. | Small, maintained, MIT, browser-friendly. | Brief |
| D-04 | Entry points: `@firatkill/efatura` (core), `@firatkill/efatura/zip`, bin `efatura`. | Core users do not pay for ZIP code. | Brief |
| D-05 | Amounts are decimal strings; `toMinorUnits` returns `bigint`; own bigint-based decimal helper, no decimal library. | Exactness without a dependency. | Brief |
| D-06 | The parser returns `{ invoice, issues }` and throws only `EfaturaParseError` for non-XML or non-Invoice input. | Batches must survive bad files. | Brief |
| D-07 | Validation checks and codes as in TRD §9 with tolerance 0.01 in document currency. | Matches accountants' expectations of one-kuruş rounding. | Brief; codes assigned in this spec |
| D-08 | ZIP limits: depth 3, entries 5,000, total 500 MB; plus 50 MB per entry and ratio 100 (applied above 1 MB). | Bomb protection with room for real archives (a year of a mid-size company's invoices). Per-entry and ratio limits added by this spec. | Brief + this spec |
| D-09 | CSV defaults: `;` delimiter, UTF-8 BOM, decimal comma, CRLF, Turkish headers in the playground's Turkish export. | Turkish Excel uses `;` as list separator and `,` as decimal separator, and needs a BOM to detect UTF-8 (otherwise ğ, ş, ı break). | Brief + this spec |
| D-10 | Model property names are camelCase; row and CSV column keys are snake_case. | TypeScript convention for objects; stable, spreadsheet-friendly column keys. | This spec |
| D-11 | The invoice number field is `number` (UBL `cbc:ID`); the model has no `id` field for it to avoid confusion with line ids and UUID. | Clarity. | This spec |
| D-12 | The model is plain data. Attachments carry base64 text; decoding happens in `decodeAttachment()`. No methods on model objects. | JSON and `postMessage` safe; lazy decoding without hidden state. | This spec |
| D-13 | DOCTYPE in input throws `EfaturaParseError('DOCTYPE_FORBIDDEN')`. | UBL never uses DOCTYPE; refusing it removes entity-expansion attacks. Treated as "not acceptable XML". | This spec |
| D-14 | Repository is a pnpm workspace whose root package is the library; the playground is the private workspace package `playground/`. | One README serves GitHub and npm; simple paths. | This spec |
| D-15 | Playground: Vite + vanilla TypeScript with a 40-line DOM helper; no framework. | Smallest bundle (React + ReactDOM alone is ≈ 45 kB brotli, over half the initial budget); few views; no complex client state. | This spec |
| D-16 | Browser testing: Vitest browser mode (Playwright provider; Chromium, Firefox, WebKit) for the core; Playwright Test for playground E2E. | The core must be proven in all engines without a UI; the playground needs real user flows, accessibility and network checks. | This spec |
| D-17 | Excel writer: `write-excel-file` (MIT), lazy-loaded; fallback `exceljs` (MIT) if A-19 fails. SheetJS is not used (current versions are not distributed via the npm registry). | Small, permissive, browser-friendly. | This spec |
| D-18 | Playground deploy: Vercel Hobby project `efatura` through Vercel's Git integration (production from `main`, preview deployments for pull requests); build settings and headers in the root `vercel.json` (TRD §14.7, §18.3). GitHub Actions runs the tests and the build check but does not deploy, and GitHub holds no hosting token. | Owner standard: every deployed site is on Vercel (D-45). Branch protection keeps commits without green CI off `main`; the build pins the same pnpm (Corepack) and Node 22 as CI. | This spec; owner decision 2026-10-21 |
| D-19 | No analytics in v1 (not even cookieless). | The strongest and simplest privacy promise; nothing to explain. | This spec |
| D-20 | Fonts (Schibsted Grotesk, JetBrains Mono) are self-hosted from Fontsource packages (OFL-1.1), latin and latin-ext subsets only. | No third-party requests; Turkish characters are in latin-ext. | This spec |
| D-21 | `style-src 'unsafe-inline'` is allowed in the playground CSP; `script-src` stays `'self'` only. | The official view iframe (`srcdoc`) inherits the page CSP and XSLT output relies on inline styles; inline styles cannot execute code. | This spec |
| D-22 | Batch defaults: `includeRaw: false`, `attachments: 'metadata'`. Single parse defaults: `includeRaw: true`, `attachments: 'data'`. | Keeps 1,000-invoice batches within memory; detail views re-parse one file with full options. | This spec |
| D-23 | The CLI uses `node:util.parseArgs` and an internal glob matcher (`*`, `?`, `**`), adding no dependencies. | Keeps the package to two runtime dependencies. | This spec |
| D-24 | Placeholder TCKN `11111111111` (e-Arşiv final consumer) is reported as info EF016, not as checksum error EF013. | It is the documented placeholder and intentionally fails the checksum (A-08). | This spec |
| D-25 | Currency aliases `TL` and `YTL` are reported as EF020 errors but treated as TRY for the exchange-rate rule EF022. | Common real-world mistake; avoid a second, misleading error. | This spec |
| D-26 | Issue paths use canonical prefixes (`cbc:`, `cac:`, `ext:`) and 1-based indexes regardless of the prefixes in the file. | Stable, comparable paths for snapshots and documentation. | This spec |
| D-27 | First npm publish uses a short-lived granular token in CI (with provenance); afterwards trusted publishing (OIDC) is configured and the token deleted. | npm trusted publishing can only be configured for an existing package. | This spec |
| D-28 | XSLT fallback when `XSLTProcessor` is missing: evaluated at T-41 (A-17); if no permissively licensed engine fits the 300 kB lazy budget, show the unsupported state with downloads. | Chrome's XSLT removal timeline; avoid shipping a heavy or copyleft engine by default. | This spec |
| D-29 | fast-xml-parser runs with `processEntities: false`; `src/xml/tree.ts` decodes the five XML entities and numeric character references itself in one pass. The guard rejects `<!DOCTYPE`/`<!ENTITY` anywhere outside comments and CDATA, and any `XMLParser` exception becomes `NOT_XML`. `isArray` is not used because `preserveOrder: true` already returns every child list as an array. | With `processEntities: true` numeric references (`&#231;`) are decoded only together with HTML entities; no library entity code runs at all; fast-xml-parser's DOCTYPE reader is not limited to the prolog. | Spec review (TRD §6.2, §6.3) |
| D-30 | Encrypted ZIP entries are detected by reading the central directory before streaming (`src/zip/encryption.ts`), not from fflate. | fflate's streaming `UnzipFile` exposes no header flags; the earlier "read the local header" instruction could not be implemented with its API. | Spec review (TRD §10.3), confirm at A-14 |
| D-31 | ZIP ratio estimate for entries without a known compressed size uses the bytes pushed *including* the current chunk; rejected entries keep adding their (discarded) output to `totalBytes`. | The previous formula gave a compressed size of 1 for any entry that starts and inflates within one chunk, flagging normal files above 1 MB; fflate's `terminate()` is a no-op for the synchronous inflater, so a rejected bomb would otherwise inflate unbounded. | Spec review (TRD §10.3) |
| D-32 | Fixtures carry a synthetic-data XML comment in every generated invoice file and a marker as the first `cbc:Note` (except S19); `fixtures:check` enforces both. New synthetic IDs follow the `99900000xx` / `5000000xxxx` patterns and live only in `fixtures/identities.ts`; the owner verifies the VKNs once (A-26). | No official reserved test range is known; the markers make every fixture recognisably fake wherever it is copied. | Spec review (privacy) |
| D-33 | `tolerance` accepts any decimal ≥ 0 (`'0'` = exact comparison) in the API and the CLI. | TRD §5.2 said > 0 while §9.1 and the CLI said ≥ 0. | Spec review |
| D-34 | CLI exit code 130 on SIGINT is part of FR-36. | The TRD defined it; the PRD did not. | Spec review |
| D-35 | Note patterns for the exchange rate and due date match `İ`/`ı` explicitly (`d[öo]v[iıİ]z`, `tar[iıİ]h[iıİ]`). | JavaScript `/iu` does not fold `İ` to `i`, so upper-case Turkish notes (`DÖVİZ KURU`, `VADE TARİHİ`) were not matched. | Spec review (TRD §7.4) |
| D-36 | Byte input without BOM or declaration is first decoded with a fatal UTF-8 decoder; failure triggers the windows-1254 fallback (EF035). String input is limited by `string.length`. | A legitimate U+FFFD must not trigger the fallback; string inputs skipped the size limit. | Spec review (TRD §6.1) |
| D-37 | The worker transfers an exact-length copy of retained XML bytes in `detail` replies; the archive re-read passes `name: file.name` to `iterateZip`; `entryFilter` is applied to extension-less ("sniff") entries only after the ZIP magic check. | Transferring would detach the retained buffer, a view may cover a larger buffer, the default name `archive.zip` broke path matching, and filtering sniff entries early skipped nested archives. | Spec review (TRD §10.3, §13.4) |
| D-38 | Production deploy from `workflow_run` additionally requires `event == 'push'` and the head repository to be this repository. | The `branches` filter matches the head branch name, so a fork PR from a branch named `main` could deploy with production secrets. | Spec review (TRD §18.3) |
| D-39 | Batch summary counting is normative (TRD §10.1): `files` counts every leaf item including failed and skipped ones; the CLI summary example was corrected to 14 files. | The example numbers did not add up and `duplicates`/`files` were undefined. | Spec review |
| D-40 | `tsconfig.json` checks only the core (`src` without `src/cli`) with no Node types; `tsconfig.node.json` checks `src`, `test`, `fixtures` and `scripts` with Node types. Vitest aliases use `fileURLToPath`. The CLI version comes from a tsup/Vitest `define` (`__EFATURA_VERSION__`). `dist/` is removed by the `build` script instead of tsup `clean`. | The old base config included Node-using folders without Node types (typecheck could not pass); `URL.pathname` breaks on Windows; parallel tsup configs could delete each other's output. | Spec review (TRD §2, §3, §16.2) |
| D-41 | Root `StandardBusinessDocument` sets `hint: 'envelope'` on `NOT_INVOICE` (namespace to verify against GİB documentation). | The hint was used by the PRD copy but never defined. | Spec review (TRD §1.3) |
| D-42 | Playground modules that need a DOM are tested as `*.browser.test.ts` in the Vitest browser project; browser tests may `fetch` same-origin fixture URLs. E2E-08/E2E-09 assert the render or the unsupported path per engine. | The `unit` project has no DOM and no DOM emulation dependency is allowed; `?raw` corrupts non-UTF-8 fixtures; Chromium loses XSLT (R-06). | Spec review (TRD §16) |
| D-43 | No XML, ZIP or XSLT file is committed outside `fixtures/generated/`, including CLI test inputs; special inputs are written to a temporary directory by the test itself from strings in `.ts` files. | `fixtures:check` check 3 would fail on `test/cli/fixtures/*.xml`. | Spec review (IMPLEMENTATION_PLAN T-30, T-32) |
| D-44 | The `VERSION`/`ZIP_VERSION` placeholder exports of T-02 are removed at T-16, when the real exports exist. | They are not in the normative export list (TRD §5.1). | Spec review |
| D-45 | Playground hosting moved from Cloudflare Pages to Vercel by owner decision on 2026-10-21; owner standard: every deployed site is on Vercel. | One host for all of the owner's sites. CI no longer deploys, so the `workflow_run` guard of D-38 has no workflow left to protect; Vercel's Git fork protection keeps fork PRs from deploying without the owner's approval. | Owner decision (2026-10-21) |

Append new decisions at the end. Record verified assumptions (TRD §20) as new rows.

## 16. Glossary (Türkçe ↔ English)

| Turkish | English | Meaning in efatura |
|---|---|---|
| GİB (Gelir İdaresi Başkanlığı) | Revenue Administration | The Turkish tax authority. Publishes UBL-TR, code lists and guides. efatura is not affiliated with it. |
| e-Fatura | e-Invoice | Invoice exchanged electronically between two taxpayers registered in the e-Fatura system, through GİB. |
| e-Arşiv Fatura | e-Archive invoice | Electronic invoice issued to anyone not registered in e-Fatura (including individuals); same UBL-TR format, profile `EARSIVFATURA`. |
| UBL-TR | UBL-TR | Turkish customisation of OASIS UBL 2.1 (`CustomizationID` `TR1.2`). |
| ETTN (Evrensel Tekil Tanımlama Numarası) | Universally unique identifier | The invoice UUID (`cbc:UUID`). |
| Fatura No | Invoice number | `cbc:ID`, 16 characters: 3-character prefix, 4-digit year, 9-digit sequence. |
| Senaryo / Profil | Scenario / profile | `cbc:ProfileID`: TEMELFATURA, TICARIFATURA, EARSIVFATURA, IHRACAT, … |
| Fatura tipi | Invoice type | `cbc:InvoiceTypeCode`: SATIS, IADE, TEVKIFAT, ISTISNA, … |
| Mükellef | Taxpayer | A person or company with tax obligations. "e-Fatura mükellefi" = registered in e-Fatura. |
| VKN (Vergi Kimlik Numarası) | Tax identification number | 10-digit number for companies (and some individuals), with a check digit (TRD §9.2). |
| TCKN (TC Kimlik Numarası) | Turkish national ID number | 11-digit number for individuals, used as tax ID; two check digits (TRD §9.2). |
| Vergi dairesi | Tax office | The office a taxpayer is registered with (`cac:PartyTaxScheme/cac:TaxScheme/cbc:Name`). |
| Satıcı / Alıcı | Supplier / Customer | `AccountingSupplierParty` / `AccountingCustomerParty`. |
| Asıl alıcı | Buyer | `BuyerCustomerParty`, used in export and tax-free (yolcu beraber) invoices. |
| Özel entegratör | Private integrator | A GİB-licensed company that issues and transmits e-invoices for taxpayers. |
| KDV (Katma Değer Vergisi) | Value-added tax (VAT) | Tax type code 0015. |
| ÖTV (Özel Tüketim Vergisi) | Special consumption tax | Excise tax on fuel, vehicles, alcohol, tobacco and others; several codes (0071–0077). |
| ÖİV (Özel İletişim Vergisi) | Special communication tax | Tax on telecom services (code 4080). |
| Damga vergisi | Stamp duty | Codes 1047, 1048. |
| Konaklama vergisi | Accommodation tax | Tax on hotel stays (code 0059). |
| Matrah | Tax base / taxable amount | `cbc:TaxableAmount`. |
| Tevkifat | Withholding (VAT withholding) | Part of the VAT the buyer pays directly to the tax office instead of the seller, for example 5/10. `cac:WithholdingTaxTotal`; type `TEVKIFAT`. |
| İstisna | Exemption | A transaction exempt from VAT with an exemption reason code (`cbc:TaxExemptionReasonCode`); type `ISTISNA`. |
| Özel matrah | Special tax base | VAT computed on a special base (for example second-hand goods); type `OZELMATRAH`. |
| İhraç kayıtlı | Export-registered sale | Domestic sale to an exporter with VAT suspended; type `IHRACKAYITLI`. |
| İhracat | Export | Profile `IHRACAT`; the customer is the customs administration and the foreign buyer is `BuyerCustomerParty`. |
| Yolcu beraber | Tax-free sale to a traveller | Profile `YOLCUBERABERFATURA`. |
| İade | Return | Type `IADE`; refers to the original invoice through `BillingReference`. |
| İskonto / Artırım | Allowance (discount) / Charge | `cac:AllowanceCharge` with `ChargeIndicator` false / true. |
| Ödenecek tutar | Payable amount | `cbc:PayableAmount`. |
| Yuvarlama | Rounding | `cbc:PayableRoundingAmount`. |
| Döviz kuru | Exchange rate | `cac:PricingExchangeRate/cbc:CalculationRate` (or a note). |
| Kur farkı | Exchange-rate difference | Difference between invoice-date and payment-date value of a foreign-currency invoice. Not computed by efatura; the model provides the inputs. |
| Vade tarihi | Due date | `cbc:PaymentDueDate`, or a "Vade Tarihi" note. |
| Mal/Hizmet | Goods/service (item) | `cac:Item`. |
| Birim | Unit of measure | `@unitCode` on quantities, UN/ECE Recommendation 20 codes. |
| GTİP | Customs tariff code (HS-based) | `cbc:RequiredCustomsID` in export invoices. |
| MERSİS no | Central registry number | A party identifier (`schemeID="MERSISNO"`). |
| Nihai tüketici | Final consumer | An individual buyer; in e-Arşiv may be identified by the placeholder TCKN `11111111111`. |
| Mali mühür | Financial seal | The electronic seal (XAdES signature in `ext:UBLExtensions`) on invoices; not verified by efatura. |
| İrsaliye / e-İrsaliye | Despatch advice | Delivery note; out of scope, but referenced from invoices (`DespatchDocumentReference`). |
| e-SMM / e-Müstahsil | e-Self-employment receipt / e-Producer receipt | Other e-documents; out of scope. |
| Uygulama yanıtı | Application response | Accept/reject response for TICARIFATURA; out of scope. |
| Zarf | Envelope | GİB transport wrapper (StandardBusinessDocument); out of scope, detected. |
| KVKK | Turkish Personal Data Protection Law | Reason the playground never uploads files and the repo holds no real invoices. |
