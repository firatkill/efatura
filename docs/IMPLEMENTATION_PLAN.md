# efatura: Implementation Plan

Ordered tasks to build efatura from an empty folder to a published 0.1.0 and a deployed playground. Read `AGENTS.md` first, then `docs/PRD.md` (what) and `docs/TRD.md` (how). This plan says in what order and how to know each step is done.

## How to use this plan

- Do tasks in ID order unless the "Depends on" line allows otherwise. One task is one branch and one pull request (or a short series of small commits on `main` before the first release, if working alone).
- Each task lists the requirements it implements, the files it touches, steps, and acceptance criteria. A task is done only when every acceptance command passes and the Definition of Done in AGENTS.md holds.
- "TRD §n" means section n of `docs/TRD.md`; "PRD §n" means `docs/PRD.md`. Test IDs (UT-, ST-, PT-, BT-, CT-, E2E-) are defined in TRD §16.3.
- Every acceptance list implicitly includes `pnpm lint && pnpm typecheck && pnpm test`. From T-03 on it also includes `pnpm test:browser`; from T-30 on `pnpm test:cli`; from T-33 on `pnpm fixtures:check`; from T-43 on `pnpm test:e2e`.
- When a task verifies an assumption (TRD §20, A-xx), record the result as a new row in the PRD decisions log (PRD §15) in the same pull request.
- Never add a real invoice to the repository, not even temporarily. Use hand-written synthetic XML in tests until the fixture generator exists (T-31), then use generated fixtures.

## Milestone overview

| Milestone                     | Tasks       | Exit criteria                                                                        |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| M0 Setup                      | T-01 – T-04 | Tooling, build, package checks, test runners and CI skeleton green                   |
| M1 Model + core parser        | T-05 – T-16 | `parseInvoice` maps every field in TRD §7 on hand-written XML                        |
| M2 Validation                 | T-17 – T-22 | Every issue code has positive and negative tests                                     |
| M3 ZIP + batch + exports      | T-23 – T-27 | Batch, ZIP limits, rows and CSV done; size budgets met                               |
| M4 CLI                        | T-28 – T-30 | CLI tests pass on Linux and Windows                                                  |
| M5 Fixtures + full test suite | T-31 – T-36 | 43 scenarios, manifest check, snapshots, property, browser and benchmark tests in CI |
| M6 Playground                 | T-37 – T-43 | Static site complete; E2E, axe and privacy tests pass; preview deploy                |
| M7 Docs + release + deploy    | T-44 – T-45 | 0.1.0 on npm with provenance; playground live at efatura.firatkil.com                |

---

## M0 Setup

### T-01 Scaffold the repository and tooling

- **Goal**: An empty but correctly configured pnpm workspace whose root is the library package, with strict TypeScript, ESLint, Prettier and a CI workflow running lint and typecheck.
- **Implements**: D-02, D-03, D-14, NFR-14, NFR-17; A-14 (tsup), A-21, A-22
- **Files**: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc`, `.gitignore`, `.gitattributes`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `tsconfig.json`, `tsconfig.node.json`, `LICENSE`, `src/index.ts` (empty export `export {}`), `src/zip.ts` (empty), `src/cli/main.ts` (prints nothing yet), `playground/package.json` (private, no code yet), `.github/workflows/ci.yml` (jobs `lint`, `typecheck` only), `README.md` and `README.tr.md` (one-paragraph stubs).
- **Steps**:
  1. Do not run `git init` if the folder is already a repository. Create the files in TRD §3. Do not copy anything from other projects except configuration patterns.
  2. For every package in TRD §2, run `pnpm view <pkg> version`, pin the exact latest stable of the expected major in `package.json` (TRD §3.1) and `playground/package.json`. Set `packageManager` to the installed pnpm version. Record any major that differs from TRD §2 (A-14) in the decisions log.
  3. Write `tsconfig.json` and `tsconfig.node.json` exactly as TRD §2.
  4. Write `eslint.config.js` with every rule in TRD §17.3 (some globs match no files yet; that is fine).
  5. Write `.gitignore` and `.gitattributes` per TRD §3 (`fixtures/generated/** -text`).
  6. `LICENSE`: MIT, "Copyright (c) 2026 Fırat Kıl".
  7. CI: `lint` and `typecheck` jobs from TRD §17.1. Check each action's current major (A-21).
  8. Run `npm whoami` and `npm view @firatkill/efatura` (expect 404) to confirm the scope and name (A-22); if the name is taken or the scope unavailable, stop and ask the owner.
  9. On GitHub (owner, manual): enable secret scanning, push protection and Dependabot alerts.
- **Acceptance**:
  - `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck` exits 0.
  - `grep -E '"[\^~][0-9]' package.json playground/package.json` prints nothing.
  - A file `src/x.ts` containing `import fs from 'node:fs'` makes `pnpm lint` fail (create, check, delete).
  - CI is green on GitHub.
- **Depends on**: —

### T-02 Build, exports map and package checks

- **Goal**: `pnpm build` produces ESM + CJS + types for `.` and `./zip`, and an executable ESM CLI; publint, attw and size-limit run in CI.
- **Implements**: D-04, FR-60 (preparation), NFR-05, NFR-11; R-12
- **Files**: `tsup.config.ts`, `.size-limit.json`, `package.json` (scripts `build`, `size`, `publint`, `attw`), `src/index.ts` (`export const VERSION = '0.0.0'` placeholder with TSDoc; removed at T-16, D-44), `src/zip.ts` (imports `VERSION` from `@firatkill/efatura` and re-exports it as `ZIP_VERSION`; removed at T-16), `src/cli/version.ts` (`declare const __EFATURA_VERSION__: string`), `src/cli/main.ts` (prints `efatura <version>` for `--version`), `.github/workflows/ci.yml` (job `package` without `licenses:check` and `docs:check` yet).
- **Steps**:
  1. Write `tsup.config.ts` exactly as TRD §3.2 (it already inlines the package version into the CLI with `define`).
  2. Confirm the self-reference works: `node -e "import('@firatkill/efatura/zip').then(m => console.log(m.ZIP_VERSION))"` from the repository root after building.
  3. Confirm `dist/zip.js` contains `from "@firatkill/efatura"` and no copy of core code (`grep`).
  4. Add `.size-limit.json` from TRD §17.4.
  5. Run `pnpm publint` and `pnpm attw`; fix the exports map until both pass for all resolution modes.
- **Acceptance**:
  - `pnpm build && pnpm publint && pnpm attw && pnpm size` exits 0.
  - `node dist/cli.js --version` prints `efatura 0.0.0`; on Linux `test -x dist/cli.js` succeeds.
  - `grep -c '@firatkill/efatura' dist/zip.js` ≥ 1 and `dist/zip.cjs` uses `require("@firatkill/efatura")`.
  - `dist/zip.d.ts` and `dist/zip.d.cts` import from `'@firatkill/efatura'` instead of containing copies of core declarations (TRD §3.2).
- **Depends on**: T-01

### T-03 Test runners and CI test jobs

- **Goal**: Vitest projects `unit`, `browser` and `cli` work; coverage thresholds configured; CI runs unit tests on Node 20/22/24 and browser tests in three engines.
- **Implements**: NFR-13, NFR-14, D-16; A-14 (Vitest)
- **Files**: `vitest.config.ts` (TRD §16.2), `test/setup.ts` (blocks `fetch`), `test/unit/smoke.test.ts`, `test/browser/smoke.browser.test.ts`, `test/cli/version.test.ts` (spawns `node dist/cli.js --version`), `test/helpers/spawn.ts`, `.github/workflows/ci.yml` (jobs `unit`, `browser`, `cli`).
- **Steps**:
  1. Verify the Vitest 4 browser provider import and `projects` syntax on the pinned version (A-14); adjust TRD §16.2 snippet in the code only, record differences.
  2. Coverage thresholds from TRD §16.2; until code exists, the smoke tests keep coverage meaningful only for `src/index.ts`. Set `coverage.thresholds.autoUpdate: false`.
  3. `test/setup.ts`: replace `globalThis.fetch` with a function that throws `Error('Network access is not allowed in tests')`.
  4. CI jobs `unit` (matrix 20, 22, 24; coverage on 22), `browser` (installs Chromium, Firefox, WebKit), `cli` (ubuntu + windows, Node 20 and 24) as in TRD §17.1.
- **Acceptance**:
  - `pnpm test && pnpm test:browser && pnpm test:cli` exit 0 locally.
  - A test calling `fetch('https://example.com')` fails with the network error message (create, check, delete).
  - CI jobs `unit`, `browser`, `cli` are green.
- **Depends on**: T-02

### T-04 Changesets, licence check, docs check, templates

- **Goal**: Release tooling and repository hygiene in place.
- **Implements**: FR-56, FR-60, NFR-15, NFR-18
- **Files**: `.changeset/config.json` (TRD §18.1), `.changeset/README.md`, `scripts/check-licenses.mjs` (TRD §17.6), `scripts/check-docs.ts` (TRD §17.7; checks that apply to code not yet written pass trivially when their inputs are empty), `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `config.yml` (TRD §17.8), `.github/dependabot.yml`, `fixtures/README.md` (rules section only), `package.json` scripts, CI `package` job (add `licenses:check`, `docs:check`).
- **Steps**:
  1. Implement the SPDX evaluation in `check-licenses.mjs` with a small recursive-descent parser for `OR`, `AND` and parentheses.
  2. `check-docs.ts`: implement checks 1 and 5 now; checks 2–4 read their inputs and pass when the lists are empty.
  3. Write the PR and issue templates with the exact privacy wording from TRD §17.8.
- **Acceptance**:
  - `pnpm licenses:check` exits 0; adding a dependency with licence `GPL-3.0` to `playground` makes it fail (check, revert).
  - `pnpm docs:check` exits 0; removing the TSDoc from `VERSION` makes it fail (check, revert).
  - `pnpm changeset status` runs without error.
- **Depends on**: T-02

---

## M1 Model + core parser

### T-05 Configuration, errors and internal helpers

- **Goal**: Constants, the error class and the yield/abort helpers every later module uses.
- **Implements**: FR-04, FR-25, FR-26
- **Files**: `src/config.ts` (TRD §4), `src/config-public.ts`, `src/errors.ts` (TRD §5.6), `src/internal/yield.ts`, `src/internal/abort.ts`, `src/internal/clock.ts` (injectable `now()` for tests), `test/unit/errors.test.ts` (UT-38 partial), `test/unit/config.test.ts` (UT-39), `test/unit/internal.test.ts`.
- **Steps**:
  1. Copy `src/config.ts` exactly from TRD §4.
  2. `EfaturaParseError` with the five codes, English and Turkish messages from TRD §5.6, `details`, `name`, and `Object.setPrototypeOf(this, new.target.prototype)`.
  3. `yieldToEventLoop()` and `createYielder(budgetMs, now)` returning `maybeYield(signal?)`.
- **Acceptance**:
  - `pnpm test -- errors config internal` passes; every error code's `message` and `messageTr` equal TRD §5.6 with sample details.
  - `efaturaConfig` is deep-frozen (`Object.isFrozen` on nested objects).
- **Depends on**: T-03

### T-06 Decimal module and minor units

- **Goal**: Exact decimal arithmetic and `toMinorUnits`.
- **Implements**: FR-15, D-05, G-02
- **Files**: `src/decimal/decimal.ts`, `src/decimal/minor-units.ts`, `src/codes/currencies.ts` (initial: TRY, USD, EUR, GBP, CHF, JPY, KWD, XAU; completed in T-10), `test/unit/decimal.test.ts` (UT-01, UT-02), `test/unit/minor-units.test.ts` (UT-03), `test/helpers/reference-decimal.ts`.
- **Steps**:
  1. Implement TRD §8.2 exactly, including `div` and `movePoint`.
  2. Implement `toMinorUnits` and `minorUnitsOf` (TRD §8.3).
  3. Every vector in the TRD §8.2 and §8.3 tables is a test case.
- **Acceptance**:
  - `pnpm test -- decimal minor-units` passes with every table vector.
  - `pnpm test:coverage` shows 100 % lines for `src/decimal/**`.
  - `grep -rnE 'parseFloat|toFixed\(|Math\.round' src/decimal` prints nothing.
- **Depends on**: T-05

### T-07 Input decoding and guard

- **Goal**: Bytes and strings become text safely; non-XML, DOCTYPE, empty and oversized inputs throw the right error.
- **Implements**: FR-02, FR-04, NFR-12; D-13; A-14 (fast-xml-parser), A-24
- **Files**: `src/xml/decode.ts` (TRD §6.1), `src/xml/guard.ts` (TRD §6.2), `src/xml/fxp.ts` (TRD §6.3), `test/unit/decode.test.ts` (UT-05), `test/unit/guard.test.ts` (UT-06), `test/helpers/xml.ts` (tiny builders for test XML strings and encoders for UTF-16 and windows-1254 test bytes).
- **Steps**:
  1. Spike: confirm `XMLValidator.validate` return shape and the `XMLParser` options of TRD §6.3 on the pinned fast-xml-parser (A-14). Record differences.
  2. Implement decoding steps 1–8; EF035 issues are created through a temporary local issue factory that T-17 replaces with the catalogue.
  3. Confirm `new TextDecoder('windows-1254')` and `'iso-8859-9'` decode `ğ` and `ş` correctly in Node 20 (A-24).
  4. Implement the guard; the DOCTYPE scan must skip comments and PIs.
- **Acceptance**:
  - `pnpm test -- decode guard` passes all UT-05 and UT-06 cases.
  - A 1,000-level nested "billion laughs" input with DOCTYPE throws `DOCTYPE_FORBIDDEN` in < 10 ms (timed in the test).
- **Depends on**: T-05

### T-08 Namespace-resolved XML tree, query, select and paths

- **Goal**: A prefix-independent element tree and the helpers mappers and users read it with.
- **Implements**: FR-03, FR-13, D-26
- **Files**: `src/xml/tree.ts`, `src/xml/namespaces.ts`, `src/xml/query.ts`, `src/xml/select.ts`, `src/xml/path.ts`, `test/unit/tree.test.ts` (UT-07), `test/unit/select.test.ts` (UT-08).
- **Steps**:
  1. Build the tree with an explicit stack (TRD §6.4); never recurse over input depth.
  2. Implement strict-then-tolerant matching and namespace events; fold events into EF009 data (issue creation via the temporary factory).
  3. Implement `select`, `selectAll`, `selectText` (TRD §5.7 grammar) and the path builders used by validation.
- **Acceptance**:
  - `pnpm test -- tree select` passes; a 10,000-level nested document builds without `RangeError`.
  - The same invoice written with `cbc:`/`cac:`, with `b:`/`a:`, and with redeclared default namespaces produces deep-equal trees except `prefix` (asserted in UT-07).
- **Depends on**: T-07

### T-09 Public model types and value conventions

- **Goal**: `src/types.ts` exactly as TRD §7.2, and the shared value builders.
- **Implements**: FR-05 – FR-16 (types), D-10, D-11, D-12
- **Files**: `src/types.ts`, `src/model/values.ts` (`text`, `code`, `bool`, `integer`, `decimalValue`, `amount`, `quantity`), `src/model/context.ts` (mapping context: issue sink, path stack, options), `test/unit/values.test.ts` (UT-09).
- **Steps**:
  1. Copy the types from TRD §7.2. `IssueCode` temporarily is a string union of all codes in TRD §9.3; T-17 replaces it with `typeof ISSUE_CODES[number]`.
  2. Implement `decimalValue` (four branches) and the Amount/Quantity builders with EF030/EF031/EF032 through the context.
- **Acceptance**:
  - `pnpm test -- values` passes; `pnpm typecheck` passes with `exactOptionalPropertyTypes`.
  - `grep -n 'number' src/types.ts` shows `number` only for positions, `lineCountNumeric`, sizes, byte counts, `depth`, counters, limits and options, `RowValue` (integer columns) and `details` records; never for an amount, quantity, price, rate or percentage (those are `Decimal`).
- **Depends on**: T-06, T-08

### T-10 Code lists and their verification

- **Goal**: All code lists with EN/TR labels, verified against the official sources.
- **Implements**: FR-14; R-02; A-01, A-02, A-03, A-04, A-05, A-06, A-07, A-11
- **Files**: `src/codes/profiles.ts`, `invoice-types.ts`, `tax-types.ts`, `withholding.ts`, `exemptions.ts`, `units.ts`, `currencies.ts`, `verified.ts`, `src/codes/index.ts`, `test/unit/codes.test.ts` (UT-13), `docs/PRD.md` (decision rows).
- **Steps**:
  1. Enter the initial tables from TRD §7.9.
  2. Find the official documents listed in TRD §21 (GİB e-Belge technical documents: "UBL-TR Kod Listeleri", "UBL-TR Fatura" guide; SIX ISO 4217 List One). Record the URL, document version and date.
  3. Compare each table with the official list: add missing codes, correct names to the official spelling, remove codes that do not exist (also from the TypeScript unions in `types.ts`), keep English labels short and literal.
  4. Fill `CODE_LISTS_VERIFIED` with source, version and `checkedOn` (today's date).
  5. Confirm `UBLVersionID`/`CustomizationID` values and the Invoice element order (A-01).
  6. Add one PRD decisions log row per assumption A-01 – A-07 and A-11 with the finding.
- **Acceptance**:
  - `pnpm test -- codes` passes, including the check that `CODE_LISTS_VERIFIED` contains no `…` placeholders.
  - Every entry has non-empty `en` and `tr` labels (test).
  - PRD §15 has new rows for A-01 – A-07 and A-11.
- **Depends on**: T-09

### T-11 Identity, references, exchange rate and due date mapping

- **Goal**: Map TRD §7.3 (except parties, lines, taxes, totals, attachments), §7.3.1, §7.4 and §7.4.2.
- **Implements**: FR-05, FR-10, FR-11
- **Files**: `src/model/identity.ts`, `src/model/references.ts`, `src/model/exchange-rate.ts`, `src/model/payment.ts` (due date part), `test/unit/map-identity.test.ts` (UT-14), `test/unit/map-exchange-rate.test.ts` (UT-15).
- **Steps**:
  1. Implement each table row; `RATE_NOTE_PATTERN` exactly as TRD §7.4.
  2. EF023 through the context.
- **Acceptance**:
  - `pnpm test -- map-identity map-exchange-rate` passes, covering every row of TRD §7.3 (identity rows) and all note variants in UT-15.
- **Depends on**: T-10

### T-12 Party mapping

- **Goal**: Map TRD §7.5 and the tax ID resolution §7.5.1.
- **Implements**: FR-06
- **Files**: `src/model/party.ts`, `test/unit/map-party.test.ts` (UT-16).
- **Steps**: Implement fields, address, contact, `displayName`, `identifiers`, and the four tax ID branches with EF015 variants.
- **Acceptance**: `pnpm test -- map-party` passes, including lower-case `schemeID`, missing `schemeID`, several identifiers, Person-only and PartyName+Person parties.
- **Depends on**: T-10

### T-13 Line, item, price, delivery and allowance mapping

- **Goal**: Map TRD §7.6 and §7.8.2.
- **Implements**: FR-07, FR-09 (allowances)
- **Files**: `src/model/line.ts`, `src/model/item.ts`, `src/model/allowance.ts`, `test/unit/map-line.test.ts` (UT-17).
- **Steps**: Implement every row; merge multiple line TaxTotals as specified; `position` is 1-based.
- **Acceptance**: `pnpm test -- map-line` passes, including the multiple-TaxTotal merge and delivery fields.
- **Depends on**: T-10

### T-14 Taxes, withholding, totals, payment and computed totals

- **Goal**: Map TRD §7.7, §7.8.1, §7.8.3, §7.8.4 and compute §7.8.6.
- **Implements**: FR-08, FR-09, FR-10
- **Files**: `src/model/tax.ts`, `src/model/totals.ts`, `src/model/payment.ts`, `src/model/computed.ts`, `test/unit/map-tax.test.ts` (UT-18), `test/unit/map-totals.test.ts` (UT-19), `test/unit/computed.test.ts` (UT-21).
- **Steps**: Implement tables; `withholdingRatio` rule; computed totals with `decimal` only.
- **Acceptance**: `pnpm test -- map-tax map-totals computed` passes; `payableTry` for TRY, `TL`, USD with rate and USD without rate.
- **Depends on**: T-12, T-13

### T-15 Attachments and base64

- **Goal**: Attachment metadata, XSLT detection, lazy decoding.
- **Implements**: FR-12
- **Files**: `src/attachments/base64.ts`, `src/attachments/attachments.ts`, `src/model/attachments.ts`, `test/unit/base64.test.ts` (UT-04), `test/unit/attachments.test.ts` (UT-20).
- **Steps**: Implement TRD §7.8.5 and §8.4; `decodeAttachment`, `attachmentText`, `findXslt`.
- **Acceptance**: `pnpm test -- base64 attachments` passes; `size` equals the decoded length for 100 random byte arrays (property-style loop in the unit test).
- **Depends on**: T-09

### T-16 `parseInvoice` orchestration

- **Goal**: The public `parseInvoice` with all options, issue merging and sorting.
- **Implements**: FR-01, FR-04, FR-13, FR-16, D-22
- **Files**: `src/parse.ts`, `src/model/invoice.ts`, `src/index.ts` (exports so far, each with TSDoc and `@example`), `test/unit/parse.test.ts` (UT-22, UT-23), `test/unit/errors.test.ts` (UT-38 completed).
- **Steps**:
  1. Implement TRD §1.3 steps 1–8 (validation is a no-op until T-17). Restore the 36 kB size check to `parseInvoice` (D-50). Remove the T-02 placeholders `VERSION` and `ZIP_VERSION` (D-44) and point the T-04 docs-check test at a real export.
  2. Option validation (`TypeError` for bad `tolerance`, unknown rule codes, non-positive `maxBytes`).
  3. JSON-safety test (UT-23) on a full hand-written invoice covering every model section.
- **Acceptance**:
  - `pnpm test -- parse` passes.
  - `pnpm build && pnpm size` passes (core ≤ 40 kB).
  - `pnpm docs:check` passes for the new exports.
- **Depends on**: T-11, T-14, T-15

---

## M2 Validation

### T-17 Issue framework, catalogue and messages

- **Goal**: `ISSUE_CATALOGUE`, `ISSUE_CODES`, message rendering, rule runner, `validateInvoice`, severity overrides.
- **Implements**: FR-17, FR-18, FR-19, FR-20, D-07
- **Files**: `src/validate/catalogue.ts`, `src/validate/messages.ts`, `src/validate/issue.ts`, `src/validate/options.ts`, `src/validate/index.ts`, `src/validate/rules/amounts.ts` (`walkAmounts`), updates in `src/model/context.ts` and `src/xml/*` to use the catalogue for mapping issues, `test/unit/validate/framework.test.ts`, `test/unit/validate/amounts.test.ts` (UT-27).
- **Steps**:
  1. Enter every code, default severity, kind and message (all variants) from TRD §9.3 byte-exactly.
  2. Replace the temporary issue factory from T-07–T-09.
  3. Implement Label params, sorting, de-duplication, `rules` overrides and `'off'`.
  4. Extend `scripts/check-docs.ts` checks 2 and 3 to use the catalogue.
- **Acceptance**:
  - `pnpm test -- validate/framework validate/amounts` passes.
  - `pnpm docs:check` passes and fails if one Turkish message character is changed in the catalogue (check, revert).
- **Depends on**: T-16

### T-18 Identifier algorithms

- **Goal**: `isValidVkn`, `isValidTckn`, `isValidUuid`, `classifyTaxId`.
- **Implements**: FR-21; A-12, A-13
- **Files**: `src/ids/vkn.ts`, `src/ids/tckn.ts`, `src/ids/uuid.ts`, `src/ids/tax-id.ts`, `src/ids/index.ts`, `test/unit/ids.test.ts` (UT-10, UT-11, UT-12).
- **Steps**:
  1. Implement TRD §9.2 exactly.
  2. Verify both algorithms against two independent open-source implementations (read their code; do not add them as dependencies) and confirm `1460415308` validates (A-12, A-13). Record the sources in the decisions log.
- **Acceptance**: `pnpm test -- ids` passes with every vector in TRD §9.2; 100 % line coverage for `src/ids/**`.
- **Depends on**: T-05

### T-19 Identity and party rules (EF001–EF017)

- **Goal**: Validation rules for identity and parties.
- **Implements**: FR-17; D-24; A-08, A-10
- **Files**: `src/validate/rules/identity.ts`, `src/validate/rules/parties.ts`, `test/unit/validate/identity.test.ts` (UT-24), `test/unit/validate/parties.test.ts` (UT-25).
- **Steps**:
  1. Implement each rule from TRD §9.3.1 in code order.
  2. Verify the anonymous TCKN placeholder (A-08) and the invoice number format (A-10) in the official guides; record.
- **Acceptance**: `pnpm test -- validate/identity validate/parties` passes with a positive and a negative test for every code EF001–EF008 and EF010–EF017 (EF009 and EF015 are tested in T-08/T-12 and re-asserted here through `parseInvoice`).
- **Depends on**: T-17, T-18

### T-20 Currency and amount rules (EF020–EF035)

- **Goal**: Currency, exchange-rate and amount-format rules.
- **Implements**: FR-17; D-25
- **Files**: `src/validate/rules/currency.ts`, `test/unit/validate/currency.test.ts` (UT-26), `test/unit/validate/amounts.test.ts` (extended).
- **Steps**: Implement EF020–EF026; complete `src/codes/currencies.ts` usage for "active ISO 4217".
- **Acceptance**: `pnpm test -- validate/currency validate/amounts` passes with positive and negative tests per code, including `TL` (EF020 alias, no EF022).
- **Depends on**: T-17

### T-21 Totals rules (EF040–EF049)

- **Goal**: Totals consistency rules with tolerance.
- **Implements**: FR-17, FR-19; R-01
- **Files**: `src/validate/rules/totals.ts`, `test/unit/validate/totals.test.ts` (UT-28).
- **Steps**:
  1. Implement each formula exactly as TRD §9.3.1, including both EF041 formulas, the EF043/EF044 split, the EF045 four TaxTotal kinds, the EF046 per-unit skip, the EF047 base-quantity division, and the EF048 tolerance and allowance skip.
  2. Test boundary values: difference exactly 0.01 passes, 0.011 fails; custom tolerance `0` and `0.05`.
- **Acceptance**: `pnpm test -- validate/totals` passes; 100 % line coverage for `src/validate/rules/totals.ts`.
- **Depends on**: T-17

### T-22 Line and tax rules (EF050–EF066)

- **Goal**: Line and tax rules.
- **Implements**: FR-17
- **Files**: `src/validate/rules/lines.ts`, `src/validate/rules/taxes.ts`, `test/unit/validate/lines.test.ts` (UT-29), `test/unit/validate/taxes.test.ts` (UT-30).
- **Steps**: Implement EF050–EF055 and EF060–EF066.
- **Acceptance**:
  - `pnpm test -- validate/lines validate/taxes` passes.
  - `pnpm test:coverage` shows 100 % lines for `src/validate/**`.
  - `pnpm docs:check` passes (every code present in TRD and tests).
- **Depends on**: T-17

---

## M3 ZIP + batch + exports

### T-23 Batch API: `iterateMany`, `parseMany`, duplicates, progress, abort

- **Goal**: Many XML inputs with duplicate detection, progress, yielding and cancellation.
- **Implements**: FR-22, FR-23, FR-25, FR-26, FR-28, D-22
- **Files**: `src/batch/input.ts`, `src/batch/iterate-many.ts`, `src/batch/parse-many.ts`, `src/batch/duplicates.ts`, `src/batch/source.ts`, `src/batch/summary.ts`, `src/batch/progress.ts`, `src/index.ts` (exports), `test/unit/batch.test.ts` (UT-32), `test/unit/validate/batch.test.ts` (UT-31).
- **Steps**: Implement TRD §10.1 and §10.2; `File`/`Blob` inputs read with `arrayBuffer()`; inject the clock for progress tests.
- **Acceptance**:
  - `pnpm test -- batch` passes, including abort before the first and during the third input, `duplicates: 'skip'`, a tracker shared across two calls, and progress at most every 100 ms with fake timers.
  - With 200 small inputs, `setTimeout(…, 0)` (or `scheduler.yield`) is called at least once per 50 ms of simulated work (spy).
- **Depends on**: T-22

### T-24 ZIP helpers: classification, junk, limits, errors

- **Goal**: Pure helpers used by the ZIP walker.
- **Implements**: FR-24, FR-27
- **Files**: `src/zip/classify.ts`, `src/zip/limits.ts`, `src/zip/errors.ts`, `test/unit/zip-helpers.test.ts`.
- **Steps**: Implement `classifyByName`, `isJunk`, `isZip`, limit merging and validation (`TypeError` for non-positive limits), ZIP error item factory with TRD §10.4 messages.
- **Acceptance**: `pnpm test -- zip-helpers` passes, including every junk name and every message.
- **Depends on**: T-23

### T-25 Streaming ZIP reader and `iterateAny`

- **Goal**: `iterateZip`, `parseZip`, `iterateAny`, `parseAny` with nested archives and all limits.
- **Implements**: FR-24, FR-25, FR-26, FR-29, NFR-04, NFR-12; D-08; A-14 (fflate)
- **Files**: `src/zip/iterate-zip.ts`, `src/zip/encryption.ts` (central-directory pre-read, TRD §10.3), `src/zip/iterate-any.ts`, `src/zip.ts` (exports with TSDoc), `test/unit/zip.test.ts` (UT-33), `test/unit/any.test.ts` (UT-34), `test/helpers/zip.ts` (builds test archives with fflate `zipSync`, plus hand-crafted entries for method 12, the encryption flag in both the local and the central-directory header, and a data-descriptor entry without sizes).
- **Steps**:
  1. Spike the fflate `Unzip` API on the pinned version (fields and callbacks in TRD §10.3; synchronous `ondata`; whether `terminate()` stops `UnzipInflate`; encrypted entries) (A-14). Record findings.
  2. Implement the walk exactly as TRD §10.3, importing core only through `@firatkill/efatura`.
  3. Blob inputs via `blob.stream()`.
  4. Test each limit with small custom limits (for example `maxEntries: 3`, `maxTotalBytes: 10_000`, `maxEntryBytes: 2_000`, `maxRatio: 10, ratioMinBytes: 1_000`).
  5. Test that a normal 3 MB XML entry with a data descriptor (unknown sizes) inside one push chunk is not flagged by the ratio check, that a rejected entry yields exactly one error item, and that a nested archive without an extension is descended when `entryFilter` is set.
- **Acceptance**:
  - `pnpm test -- zip any` passes.
  - A 20 MiB-of-spaces entry compressed in a test archive yields `ZIP_RATIO_EXCEEDED` and peak `process.memoryUsage().arrayBuffers` growth stays below 30 MB during the test.
  - `pnpm build && pnpm size` passes (zip ≤ 50 kB including core).
- **Depends on**: T-24

### T-26 Rows

- **Goal**: `toRows` with both column sets.
- **Implements**: FR-30, FR-31, FR-32
- **Files**: `src/export/columns.ts` (`INVOICE_COLUMNS`, `LINE_COLUMNS` exactly as TRD §11.1, §11.2), `src/export/rows.ts`, `test/unit/rows.test.ts` (UT-35, UT-36).
- **Steps**: Implement value rules; accept `Invoice`, `RowInput` and `BatchItem`.
- **Acceptance**: `pnpm test -- rows` passes; `INVOICE_COLUMNS.length === 44`, `LINE_COLUMNS.length === 36`, keys, labels and types equal the TRD tables (the test parses the tables from `docs/TRD.md`).
- **Depends on**: T-23

### T-27 CSV

- **Goal**: `toCsv` per TRD §11.3.
- **Implements**: FR-33, D-09
- **Files**: `src/export/csv.ts`, `test/unit/csv.test.ts` (UT-37), `test/helpers/csv-reference-parser.ts`.
- **Steps**: Implement steps 1–5; write a small RFC 4180 reference parser for tests only.
- **Acceptance**: `pnpm test -- csv` passes; 100 % line coverage for `src/export/csv.ts`.
- **Depends on**: T-26

---

## M4 CLI

### T-28 CLI arguments, inputs and glob

- **Goal**: Parse arguments, expand inputs deterministically.
- **Implements**: FR-34, D-23
- **Files**: `src/cli/args.ts`, `src/cli/glob.ts`, `src/cli/inputs.ts`, `test/unit/cli-args.test.ts`, `test/unit/cli-glob.test.ts` (these are unit tests of CLI modules, run in the `unit` project with Node types).
- **Steps**: `parseArgs` configuration from TRD §12.1; glob matcher (`*`, `?`, `**`); directory walk rules; sorting and POSIX paths.
- **Acceptance**: `pnpm test -- cli-args cli-glob` passes, including Windows-style input paths converted to POSIX output paths.
- **Depends on**: T-25, T-27

### T-29 CLI outputs, summary, progress, exit codes and texts

- **Goal**: The complete `efatura parse` behaviour.
- **Implements**: FR-35, FR-36, FR-37, FR-38
- **Files**: `src/cli/main.ts`, `src/cli/output.ts`, `src/cli/summary.ts`, `src/cli/progress.ts`, `src/cli/texts.ts` (English texts from TRD §12.3–12.5 and their Turkish versions).
- **Steps**:
  1. Help and error texts byte-exact from TRD §12.3.
  2. JSON, rows JSON, CSV and summary output (TRD §12.5); atomic `--out`.
  3. Progress (TRD §12.4); SIGINT handling (exit 130).
  4. Write the Turkish versions of every CLI text in `texts.ts`.
- **Acceptance**: `pnpm build && node dist/cli.js parse --help` prints the exact help; `node dist/cli.js parse nonexistent.xml; echo $?` prints the missing-path message and `2`.
- **Depends on**: T-28

### T-30 CLI tests

- **Goal**: CT-01 – CT-13 against the built bin, on Linux and Windows.
- **Implements**: FR-34 – FR-38, NFR-16
- **Files**: `test/cli/*.test.ts`, `test/helpers/spawn.ts`, `test/helpers/cli-inputs.ts` (synthetic XML as strings, using only the synthetic identities of TRD §15.2, imported from `fixtures/identities.ts` once T-31 creates it, written to a fresh `os.tmpdir()` directory per test; no `.xml` or `.zip` file is committed under `test/`, D-43).
- **Steps**: Spawn `process.execPath dist/cli.js` with `node:child_process`; compare stdout, stderr and exit codes; Windows path cases.
- **Acceptance**: `pnpm test:cli` passes locally and in the CI `cli` matrix (ubuntu and windows, Node 20 and 24).
- **Depends on**: T-29

---

## M5 Fixtures + full test suite

### T-31 Fixture builder, identities and XSLT texts

- **Goal**: Deterministic UBL-TR writer and computation.
- **Implements**: FR-53; A-09, A-26 (documented test range)
- **Files**: `fixtures/identities.ts` (TRD §15.2), `fixtures/xslt.ts`, `fixtures/builder/xml-writer.ts`, `fixtures/builder/invoice.ts`, `fixtures/builder/compute.ts`, `fixtures/builder/style.ts`, `fixtures/builder/zip.ts`, `test/unit/fixture-builder.test.ts`.
- **Steps**:
  1. Implement the types and computation in TRD §15.3 with the core `decimal` module.
  2. Writer: UBL 2.1 Invoice sequence (A-01 result from T-10), escaping, all `XmlStyle` options, windows-1254 encoder table, the synthetic-fixture comment and the marker note (TRD §15.2).
  3. Confirm the IHRACAT customer convention and copy the official party name (A-09); record.
  4. Search the UBL-TR and e-Arşiv guides for a documented test VKN/TCKN range (A-26, first half) and record the finding; the owner's manual VKN lookup is a T-45 checklist item.
  5. Test that a builder invoice parses with `parseInvoice` without issues.
- **Acceptance**: `pnpm test -- fixture-builder` passes; building the same definition twice gives identical bytes.
- **Depends on**: T-27

### T-32 Scenarios, generation and manifest

- **Goal**: All 43 scenarios in TRD §15.4, generated into `fixtures/generated/` with the manifest.
- **Implements**: FR-53, FR-54
- **Files**: `fixtures/scenarios/index.ts`, `fixtures/scenarios/s01-plain-sale-try.ts` … `s43-rule-coverage.ts`, `fixtures/generate.ts`, `fixtures/generated/**`, `fixtures/manifest.json`, `fixtures/README.md` (completed).
- **Steps**:
  1. One file per scenario with the definitions and `expect` from TRD §15.4.
  2. `generate.ts` deletes and rewrites `fixtures/generated/`, writes the manifest sorted by path with SHA-256 (`node:crypto`).
  3. Switch CLI tests to generated fixtures where a scenario matches; inputs that no scenario covers stay as strings in `test/helpers/cli-inputs.ts` written to a temporary directory at test time (never committed as files, D-43).
- **Acceptance**:
  - `pnpm fixtures:generate && git status --porcelain fixtures/` shows no change on a second run.
  - `fixtures/manifest.json` lists files for all 43 scenario directories.
  - `pnpm docs:check` passes: every issue code is expected by at least one generated fixture.
- **Depends on**: T-31

### T-33 Fixture check in CI

- **Goal**: Enforce that only generated, synthetic fixtures exist.
- **Implements**: FR-55, FR-56; R-03, R-11
- **Files**: `fixtures/check.ts` (TRD §15.5 checks 1–7), `.github/workflows/ci.yml` (job `fixtures`), `test/unit/fixture-check.test.ts`.
- **Steps**: Implement each check; each failure prints the file and reason.
- **Acceptance**:
  - `pnpm fixtures:check` exits 0.
  - Each of these makes it exit 1 (check, revert): editing one byte of a generated file; adding `test/x.xml`; adding a file to `fixtures/generated/` that is not in the manifest; a scenario using VKN `1234567890`; a fixture containing `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`; an e-mail `a@example.com`; a generated invoice without the synthetic marker note or comment.
- **Depends on**: T-32

### T-34 Snapshot tests

- **Goal**: ST-01 – ST-03 over every generated file.
- **Implements**: FR-54, NFR-09, SM-01
- **Files**: `test/snapshot/fixtures.test.ts`, `test/snapshot/__snapshots__/**`, `test/helpers/load-fixture.ts`.
- **Steps**:
  1. Iterate the manifest; serialise results per TRD §16.3 ST-01; `toMatchFileSnapshot`.
  2. Assert expected issues, throws and items exactly (ST-02).
  3. Review every new snapshot by reading it before committing; a snapshot that contradicts TRD §7 is a bug, not an update.
- **Acceptance**: `pnpm test -- snapshot` passes; a deliberate one-character model change (for example a renamed field) makes it fail (check, revert).
- **Depends on**: T-32

### T-35 Property and fuzz tests

- **Goal**: PT-01 – PT-07.
- **Implements**: NFR-10, G-02, G-03
- **Files**: `test/property/decimal.property.test.ts`, `test/property/minor-units.property.test.ts`, `test/property/csv.property.test.ts`, `test/property/fuzz.property.test.ts`.
- **Steps**: fast-check arbitraries for decimals (sign, 0–20 integer digits, 0–12 fraction digits), byte mutations of fixtures, string tables; `numRuns` 1,000 locally, 10,000 for PT-05 when `CI=true`.
- **Acceptance**: `CI=true pnpm test -- property` passes in under 120 s on a CI runner.
- **Depends on**: T-34

### T-36 Browser tests and benchmark

- **Goal**: BT-01 – BT-06 in three engines; the Node benchmark gate.
- **Implements**: NFR-03, NFR-14, D-16
- **Files**: `test/browser/*.browser.test.ts`, `fixtures/bench.ts`, `scripts/bench.ts`, `.github/workflows/ci.yml` (job `bench`).
- **Steps**:
  1. Browser tests import generated fixtures with Vite `?url` imports and read their bytes with same-origin `fetch` (allowed by `test/setup.ts` in the browser project; never `?raw`, which corrupts UTF-16 and windows-1254 files), and compare with Node snapshots.
  2. Benchmark per TRD §15.6.
- **Acceptance**:
  - `pnpm test:browser` passes in Chromium, Firefox and WebKit.
  - `pnpm bench --ci` passes in CI; the printed median is recorded in the PR description.
- **Depends on**: T-34

---

## M6 Playground

### T-37 Playground scaffold, design tokens, fonts, theme, i18n, layout

- **Goal**: The static shell: header, privacy banner, footer, home empty state, privacy view, not-found view, language and theme toggles.
- **Implements**: FR-49, FR-50, FR-51, NFR-07, NFR-08, D-15, D-19, D-20; A-20
- **Files**: `playground/index.html`, `playground/vite.config.ts` (alias to `../src`, `modulePreload.polyfill: false`, `worker.format: 'es'`), `playground/tsconfig.json`, `playground/public/theme-init.js`, `playground/public/favicon.svg`, `playground/public/robots.txt`, `playground/src/main.ts`, `router.ts`, `store.ts`, `dom.ts`, `format.ts`, `i18n/index.ts`, `i18n/en.ts`, `i18n/tr.ts` (all keys from PRD §9), `views/home.ts`, `views/privacy.ts`, `views/not-found.ts`, `components/header.ts`, `footer.ts`, `privacy-banner.ts`, `icons.ts`, `styles/*.css` (TRD §14.2).
- **Steps**:
  1. Confirm the Fontsource packages and licences (A-20); import only latin and latin-ext subsets.
  2. Tokens exactly as TRD §14.2; measure contrast ratios of each text/background pair in both themes and record them as a comment in `tokens.css`.
  3. All copy from PRD §9 into `en.ts`/`tr.ts`; extend `scripts/check-docs.ts` check 4 to compare them with the PRD.
  4. `formatDecimal` exactly as TRD §14.9, with unit tests in `playground/src/format.test.ts` run by the root `unit` project (add the glob).
- **Acceptance**:
  - `pnpm playground:build` exits 0; `pnpm docs:check` passes (copy matches PRD).
  - `pnpm --filter playground preview` serves a page whose language toggle and theme menu work (manual check noted in PR).
- **Depends on**: T-27

### T-38 Headers, CSP, build guards and samples

- **Goal**: Production headers applied in preview; no inline scripts; samples copied from fixtures only.
- **Implements**: FR-39 (samples), FR-49, NFR-06, NFR-12; D-21; A-16
- **Files**: `vercel.json` (TRD §14.7), `playground/vite.config.ts` (headers from `vercel.json` to `preview.headers`, `closeBundle` inline-script check), `playground/scripts/copy-samples.mjs` (TRD §14.10), `playground/src/components/samples.ts`.
- **Steps**:
  1. Write `vercel.json` exactly; check Vercel limits (A-16).
  2. `copy-samples.mjs` verifies the manifest hash of each copied file.
- **Acceptance**:
  - `pnpm playground:build && curl -sI http://localhost:4173/` (after `pnpm --filter playground preview`) shows the CSP header.
  - Adding `<script>console.log(1)</script>` to `index.html` makes the build fail (check, revert).
  - Changing a byte of a fixture without regenerating makes `copy-samples.mjs` fail (check, revert).
- **Depends on**: T-37, T-33

### T-39 Worker, client, dropzone, processing and cancel

- **Goal**: Files and samples are parsed in the worker with progress and cancellation; phase transitions as specified.
- **Implements**: FR-39, FR-40, FR-52 (duplicates across jobs), NFR-02
- **Files**: `playground/src/worker/protocol.ts`, `parse.worker.ts`, `client.ts`, `retain.ts`, `components/dropzone.ts`, `components/progress.ts`, `components/dialog.ts`, `views/processing.ts`, `views/crash.ts` (cancelled, none, crash, unsupported states).
- **Steps**: Implement TRD §13.4 exactly; large-selection dialog (PRD §9.5); live region updates at most once per second.
- **Acceptance**:
  - Loading the `nestedZip` sample in preview shows the processing state, then results data in the store (temporary debug list allowed until T-40, removed there).
  - `grep -rnE 'fetch\(|importScripts' playground/src/worker` prints nothing.
- **Depends on**: T-38

### T-40 Results view: tables, cards, filters, sort, pagination, issues

- **Goal**: The full results view.
- **Implements**: FR-41, FR-42, FR-43, FR-44, FR-52
- **Files**: `playground/src/views/results.ts`, `components/filter-bar.ts`, `tabs.ts`, `table.ts`, `cards.ts`, `pager.ts`, `severity.ts`, `issues-table.ts`, `file-lists.ts`, `filters.ts`, `sort.ts`, unit tests `playground/src/filters.test.ts`, `sort.test.ts`.
- **Steps**: Implement TRD §13.2 filtering and sorting, PRD §9.9–9.10 copy and layouts, accessibility patterns from TRD §14.5.
- **Acceptance**: unit tests for filters and sort pass; manual keyboard pass of tabs and sorting noted in the PR (automated in T-43).
- **Depends on**: T-39

### T-41 Detail view and official view

- **Goal**: Invoice detail with all sections and the secure XSLT rendering.
- **Implements**: FR-45, FR-46, NFR-12; R-04, R-05, R-06, D-28; A-17, A-18
- **Files**: `playground/src/views/detail.ts`, `components/official-view.ts`, `xslt/render.ts`, `xslt/guard.ts`, `xslt/sanitize.ts`, `xslt/frame.ts`, `xslt/fallback.ts`, `download.ts`, `playground/src/xslt/guard.browser.test.ts`, `playground/src/xslt/sanitize.browser.test.ts` (run in the Vitest browser project; they need a DOM but not `XSLTProcessor`).
- **Steps**:
  1. Implement TRD §14.6 steps 1–10 exactly.
  2. Check the current Chrome XSLT removal status (Chrome Platform Status) and evaluate the fallback engine (A-17) against the criteria and candidates in TRD §14.6.1; record the decision (including "none for 0.1.0", which the owner must accept explicitly because Chrome users will see `official.unsupported`).
  3. Verify `srcdoc` CSP inheritance and `frame-src` behaviour in Chromium, Firefox and WebKit (A-18) with S25 and S41, in every engine that still has XSLT or with the fallback.
- **Acceptance**: in preview, in a browser with XSLT (or with the fallback): S25 renders; S40 shows the blocked message; S41's frame `srcdoc` contains none of `<script`, ` on`, `javascript:`, `https://`, `@import` (checked in devtools, automated in T-43). In a browser without XSLT and without the fallback, S25 shows `official.unsupported` with working XML and XSLT downloads. `pnpm test:browser` passes the guard and sanitiser tests, including the S40 and S41 stylesheets.
- **Depends on**: T-40

### T-42 Exports in the playground and third-party licences

- **Goal**: CSV (Turkish and comma), JSON and lazy Excel exports; licence file in the build.
- **Implements**: FR-47, FR-48, NFR-15; D-17; A-19
- **Files**: `playground/src/export/csv.ts`, `json.ts`, `xlsx.ts`, `components/export-menu.ts`, `playground/scripts/third-party-licenses.mjs`, `playground/size-limit.json`.
- **Steps**:
  1. Verify `write-excel-file` licence, browser API and size (A-19); switch to the fallback if needed and record.
  2. Confirm the Excel chunk is a separate file that is not requested until the first Excel export.
- **Acceptance**:
  - `pnpm --filter playground size` passes (initial ≤ 90 kB, worker ≤ 60 kB, Excel ≤ 120 kB).
  - `pnpm licenses:check` passes; `playground/dist/third-party-licenses.txt` lists `dompurify`, `write-excel-file`, both fonts, `fast-xml-parser` and `fflate`.
- **Depends on**: T-40

### T-43 Playground E2E, accessibility, responsiveness and privacy tests

- **Goal**: E2E-01 – E2E-20 in CI.
- **Implements**: NFR-02, NFR-06, NFR-07, NFR-08, NFR-12; A-21 (Playwright project workers)
- **Files**: `playground/playwright.config.ts` (TRD §16.4), `playground/e2e/*.spec.ts`, `playground/e2e/helpers.ts` (fixture loading via `page.route` for S32–S34, S36, S38, S40–S42; file building for `setInputFiles`), `.github/workflows/ci.yml` (job `e2e`).
- **Steps**:
  1. Check that no other Playwright run uses the same preview port before running (AGENTS.md).
  2. Write the specs; tag E2E-14 and E2E-20 `@isolated` and the cross-engine subset `@cross`.
  3. Confirm project-level `workers` support (A-21) or apply the two-invocation fallback.
  4. In a fix-and-retest loop, rerun only the affected spec files; run the full suite once at the end.
- **Acceptance**: `pnpm test:e2e` passes locally and in CI; axe reports 0 violations; E2E-12 records only same-origin requests.
- **Depends on**: T-41, T-42

---

## M7 Docs + release 0.1.0 + deploy

### T-44 READMEs, release workflow and playground deploy

- **Goal**: Documentation for users in both languages; automated npm release with provenance; automated Vercel deploy through the Git integration.
- **Implements**: FR-58, FR-59, FR-60, FR-61, NFR-18; D-18, D-27; A-15, A-16
- **Files**: `README.md`, `README.tr.md` (TRD §22), `.github/workflows/release.yml` (TRD §18.1), Vercel project settings (TRD §18.3), `.changeset/*.md` (initial changeset "Initial release"), TSDoc review across `src/`.
- **Steps**:
  1. Write both READMEs with identical structure and code blocks; include the disclaimer and privacy statement; link the glossary (PRD §16).
  2. Owner (manual): create the Vercel project `efatura` from the GitHub repository with the settings in TRD §18.3 (Web Analytics, Speed Insights and the Vercel Toolbar off); add the custom domain `efatura.firatkil.com` and the CNAME to `cname.vercel-dns.com` (A-16). No token goes into GitHub. Agent: open a PR to get a preview deploy and test it.
  3. Owner (manual): create the 7-day granular npm token as `NPM_TOKEN` (D-27).
  4. Read npm's trusted-publishing documentation for pnpm support (A-15) and note the plan for 0.1.1.
- **Acceptance**:
  - `pnpm docs:check` passes (README parity).
  - The PR preview URL serves the playground with the CSP header (`curl -sI`).
  - `pnpm changeset status` shows a pending minor for `@firatkill/efatura` (0.0.0 → 0.1.0).
- **Depends on**: T-43

### T-45 Real-world check and release 0.1.0

- **Goal**: Verify tolerance on real data without committing it, meet the performance target, release and deploy.
- **Implements**: FR-57, NFR-01, SM-04, SM-06, SM-07; A-23, A-25, A-26 (owner's VKN lookup)
- **Files**: `scripts/private-corpus.ts`, decisions log rows, `CHANGELOG.md` (generated).
- **Steps**:
  1. Implement `pnpm corpus:private <dir>`: refuses directories inside the repository except `private/`; prints only counts per issue code and severity and the number of files and invoices; never prints values, names or paths below the given directory.
  2. Owner runs it on a local corpus (A-23, A-25). Each false-positive pattern becomes a decision row and, if needed, a rule fix with a new synthetic scenario (S43+) reproducing it.
  3. Run `pnpm bench:browser` on the reference laptop (PRD NFR-01); record the time.
  4. Complete the release checklist below; merge the "Version Packages" PR; confirm publication with provenance; switch to trusted publishing (TRD §18.2 step 2).
- **Acceptance**: every checklist item is ticked in the release PR description.
- **Depends on**: T-44

---

## Traceability

| Requirement                       | Tasks                    |
| --------------------------------- | ------------------------ |
| FR-01 – FR-04                     | T-07, T-08, T-16         |
| FR-05                             | T-09, T-11               |
| FR-06                             | T-12                     |
| FR-07                             | T-13                     |
| FR-08                             | T-14                     |
| FR-09                             | T-13, T-14               |
| FR-10, FR-11                      | T-11, T-14               |
| FR-12                             | T-15                     |
| FR-13                             | T-08, T-16               |
| FR-14                             | T-10                     |
| FR-15                             | T-06                     |
| FR-16                             | T-16                     |
| FR-17 – FR-20                     | T-17 – T-22              |
| FR-21                             | T-18                     |
| FR-22, FR-23, FR-25, FR-26, FR-28 | T-23                     |
| FR-24, FR-27, FR-29               | T-24, T-25               |
| FR-30 – FR-32                     | T-26                     |
| FR-33                             | T-27                     |
| FR-34 – FR-38                     | T-28 – T-30              |
| FR-39 – FR-52                     | T-37 – T-43              |
| FR-53 – FR-56                     | T-31 – T-33, T-04        |
| FR-57                             | T-45                     |
| FR-58 – FR-61                     | T-44, T-45               |
| NFR-01, NFR-02                    | T-39, T-43, T-45         |
| NFR-03                            | T-36                     |
| NFR-04                            | T-25                     |
| NFR-05                            | T-02, T-16, T-25, T-42   |
| NFR-06, NFR-12                    | T-38, T-41, T-43         |
| NFR-07, NFR-08                    | T-37, T-40, T-43         |
| NFR-09, NFR-10                    | T-32, T-34, T-35         |
| NFR-11                            | T-02                     |
| NFR-13                            | T-03 and every code task |
| NFR-14                            | T-01, T-03, T-36         |
| NFR-15                            | T-04, T-42               |
| NFR-16                            | T-30                     |
| NFR-17                            | T-01                     |
| NFR-18                            | T-04, T-44               |

## Release checklist (0.1.0)

Tick each item in the release PR description.

- [ ] All CI jobs green on `main`: lint, typecheck, unit (20, 22, 24), fixtures, browser, package, cli (ubuntu, windows), bench, e2e.
- [ ] `pnpm check` passes locally from a clean clone (`git clean -xfd && pnpm install --frozen-lockfile`).
- [ ] Coverage thresholds met (NFR-13); the coverage summary is pasted in the PR.
- [ ] 43/43 scenarios pass snapshot and expected-issue tests (SM-01).
- [ ] `pnpm fixtures:check` passes; `git ls-files | grep -iE '\.(xml|zip|xslt?)$' | grep -v '^fixtures/generated/'` prints nothing.
- [ ] Size budgets met (NFR-05); numbers pasted in the PR.
- [ ] `publint --strict` and `attw --pack .` clean.
- [ ] `pnpm licenses:check` passes; `third-party-licenses.txt` present in the playground build.
- [ ] Every assumption A-01 – A-26 has a decisions log row (verified, changed or deferred with reason).
- [ ] Owner checked the six synthetic VKNs in GİB's public taxpayer lookup; none is registered (A-26); result recorded.
- [ ] Private corpus run done (A-23): error false positives ≤ 1 % (SM-07); counts recorded without data.
- [ ] Browser benchmark on the reference laptop ≤ 8 s for 1,000 typical invoices (NFR-01); time recorded.
- [ ] Manual screen-reader pass (VoiceOver on Safari or NVDA on Firefox): load a sample, filter, open detail, export; notes recorded.
- [ ] Lighthouse mobile on the preview URL: Accessibility 100, Best Practices 100, Performance ≥ 90 (SM-06).
- [ ] Network panel on the preview: only same-origin requests while loading files and rendering the official view.
- [ ] README.md and README.tr.md reviewed by the owner; disclaimer and privacy statement present.
- [ ] Changeset for 0.1.0 describes the public API; CHANGELOG generated.
- [ ] Release job published `@firatkill/efatura@0.1.0`; `npm view @firatkill/efatura@0.1.0 dist.attestations` shows provenance.
- [ ] `npx @firatkill/efatura@0.1.0 parse <a generated fixture>` works from an empty directory on Linux and Windows.
- [ ] Trusted publishing configured on npm; `NPM_TOKEN` secret and token deleted; `NODE_AUTH_TOKEN` line removed (D-27).
- [ ] Playground deployed from `main`; https://efatura.firatkil.com serves the CSP and HSTS headers (`curl -sI`).
- [ ] Vercel Web Analytics, Speed Insights and the Vercel Toolbar are off for the `efatura` project (D-19).
- [ ] Git tag `@firatkill/efatura@0.1.0` and GitHub release created by Changesets.
