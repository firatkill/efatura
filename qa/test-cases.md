# QA test cases

## Repository setup (before M0)

Sources: AGENTS.md §7 Repository setup and Authorship. These are setup acceptance checks, not parser tests; TRD §16 has no test ID for repository initialization.

| TC ID        | AC reference | TRD test ID            | Title                                          | Priority | Automatable | Expected result                                                             |
| ------------ | ------------ | ---------------------- | ---------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------- |
| TC-SETUP-001 | AGENTS.md §7 | N/A (repository setup) | Initialize with owner identity and active hook | Critical | yes         | main branch; executable hook; owner is author and committer                 |
| TC-SETUP-002 | AGENTS.md §7 | N/A (repository setup) | Enforce authorship and remove attribution      | Critical | yes         | Owner accepted; invalid author and committer rejected; attribution stripped |

### TC-SETUP-001

Precondition: documents-only folder, matching git identity.

1. Check git user.name and user.email before initialization.
2. Initialize main once, configure core.hooksPath, and check hook executability.
3. Inspect git author and committer identities.

Expected: identities match the owner exactly and the hook is active.

### TC-SETUP-002

Precondition: configured repository with the supplied hook.

1. Create a temporary message under .git with a valid subject and attribution lines.
2. Invoke the hook with the owner identity and inspect the message.
3. Invoke it separately with an invalid author and invalid committer using process-local environment overrides.
4. Remove the temporary files.

Expected: the valid invocation succeeds and removes attribution; each invalid identity is rejected. No git identity configuration changes.

## M0 Setup

Sources: PRD requirements below; TRD §§2–3, §§16–18; IMPLEMENTATION_PLAN T-01–T-04. TRD §16 assigns CT-02 to CLI version; setup checks otherwise use their task acceptance criteria because no UT/BT ID is assigned. No test IDs are invented in the TRD catalogue.

Common preconditions: owner-approved repository, dependencies installed for the task under test, and preceding tasks complete. Temporary negative-test inputs are removed after the assertion; no real invoice data is used.

| TC ID     | AC reference   | TRD test / task          | Title                                            | Priority | Automatable | Expected result                                                                                       |
| --------- | -------------- | ------------------------ | ------------------------------------------------ | -------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| TC-M0-001 | NFR-14, NFR-17 | T-01                     | Pinned workspace installs and strict checks pass | High     | yes         | All commands exit 0; no caret or tilde ranges.                                                        |
| TC-M0-002 | NFR-14         | T-01                     | Core rejects Node built-ins                      | High     | yes         | Lint fails on the restricted import.                                                                  |
| TC-M0-003 | NFR-17         | T-01                     | Tooling CI is green                              | High     | yes         | Both jobs pass on GitHub.                                                                             |
| TC-M0-004 | NFR-15         | T-01 / A-22              | npm account and package name verified            | High     | yes         | Account is firatkill; package returns 404.                                                            |
| TC-M0-005 | NFR-05, NFR-11 | T-02                     | Build and package compatibility checks pass      | High     | yes         | ESM, CJS and declarations generated; all checks pass within budgets.                                  |
| TC-M0-006 | FR-60, NFR-14  | T-02                     | ZIP references the shared core                   | High     | yes         | ZIP_VERSION resolves to 0.0.0; output references @firatkill/efatura without copied core declarations. |
| TC-M0-007 | NFR-14         | CT-02 / T-02             | CLI is executable and reports version            | High     | yes         | Prints efatura 0.0.0; executable bit is set.                                                          |
| TC-M0-008 | NFR-13, NFR-14 | T-03                     | Unit smoke and coverage pass                     | High     | yes         | Smoke tests pass with configured coverage thresholds and autoUpdate false.                            |
| TC-M0-009 | NFR-14         | T-03 (browser smoke)     | Core smoke runs in three engines                 | High     | yes         | Chromium, Firefox and WebKit pass.                                                                    |
| TC-M0-010 | FR-38, NFR-14  | CT-02 / T-03             | Built CLI version test passes                    | High     | yes         | Spawned CLI version test passes.                                                                      |
| TC-M0-011 | NFR-09         | T-03 (network isolation) | Tests reject network access                      | High     | yes         | Fails with Network access is not allowed in tests.                                                    |
| TC-M0-012 | NFR-13, NFR-14 | T-03                     | Test CI matrices pass                            | High     | yes         | Every configured test job passes.                                                                     |
| TC-M0-013 | NFR-15         | T-04                     | Allowed production licences pass                 | High     | yes         | Exits 0; exactly the two approved library runtime dependencies.                                       |
| TC-M0-014 | NFR-15         | T-04                     | Disallowed production licence fails              | High     | yes         | Exits nonzero for GPL-3.0.                                                                            |
| TC-M0-015 | NFR-18         | T-04                     | Docs parity and export examples pass             | High     | yes         | Export TSDoc, README parity and applicable catalogue/copy checks pass.                                |
| TC-M0-016 | NFR-18         | T-04                     | Missing export example is rejected               | High     | yes         | Docs check fails for the undocumented export.                                                         |
| TC-M0-017 | FR-60          | T-04                     | Changesets status works                          | High     | yes         | Exits 0 with valid configuration.                                                                     |
| TC-M0-018 | FR-56          | T-04                     | Templates require synthetic reproductions        | High     | yes         | Exact privacy text is present and blank issues are disabled.                                          |

### TC-M0-001: Pinned workspace installs and strict checks pass

Preconditions: common preconditions above; T-01.

1. Run pnpm install --frozen-lockfile, pnpm lint and pnpm typecheck; inspect exact versions in both package manifests.

Expected: All commands exit 0; no caret or tilde ranges.

### TC-M0-002: Core rejects Node built-ins

Preconditions: common preconditions above; T-01.

1. Temporarily create src/x.ts importing node:fs; run lint; remove only the temporary file.

Expected: Lint fails on the restricted import.

### TC-M0-003: Tooling CI is green

Preconditions: common preconditions above; T-01.

1. Push T-01 and inspect lint and typecheck jobs.

Expected: Both jobs pass on GitHub.

### TC-M0-004: npm account and package name verified

Preconditions: common preconditions above; T-01 / A-22.

1. Run npm whoami and npm view @firatkill/efatura.

Expected: Account is firatkill; package returns 404.

### TC-M0-005: Build and package compatibility checks pass

Preconditions: common preconditions above; T-02.

1. Run pnpm build, pnpm publint, pnpm attw and pnpm size.

Expected: ESM, CJS and declarations generated; all checks pass within budgets.

### TC-M0-006: ZIP references the shared core

Preconditions: common preconditions above; T-02.

1. Import the ZIP entry from Node; inspect ESM, CJS and declaration output.

Expected: ZIP_VERSION resolves to 0.0.0; output references @firatkill/efatura without copied core declarations.

### TC-M0-007: CLI is executable and reports version

Preconditions: common preconditions above; CT-02 / T-02.

1. Run node dist/cli.js --version and inspect executable permission.

Expected: Prints efatura 0.0.0; executable bit is set.

### TC-M0-008: Unit smoke and coverage pass

Preconditions: common preconditions above; T-03.

1. Run pnpm test and pnpm test:coverage.

Expected: Smoke tests pass with configured coverage thresholds and autoUpdate false.

### TC-M0-009: Core smoke runs in three engines

Preconditions: common preconditions above; T-03 (browser smoke).

1. Run pnpm test:browser.

Expected: Chromium, Firefox and WebKit pass.

### TC-M0-010: Built CLI version test passes

Preconditions: common preconditions above; CT-02 / T-03.

1. Run pnpm test:cli.

Expected: Spawned CLI version test passes.

### TC-M0-011: Tests reject network access

Preconditions: common preconditions above; T-03 (network isolation).

1. Add a temporary test calling fetch; run that case; remove the temporary test.

Expected: Fails with Network access is not allowed in tests.

### TC-M0-012: Test CI matrices pass

Preconditions: common preconditions above; T-03.

1. Inspect unit 20/22/24, browser and CLI ubuntu/windows 20/24 jobs.

Expected: Every configured test job passes.

### TC-M0-013: Allowed production licences pass

Preconditions: common preconditions above; T-04.

1. Run pnpm licenses:check against installed workspace production dependencies.

Expected: Exits 0; exactly the two approved library runtime dependencies.

### TC-M0-014: Disallowed production licence fails

Preconditions: common preconditions above; T-04.

1. Temporarily add a local GPL-3.0 dependency to playground, run licence check, restore manifest and lockfile.

Expected: Exits nonzero for GPL-3.0.

### TC-M0-015: Docs parity and export examples pass

Preconditions: common preconditions above; T-04.

1. Run pnpm docs:check.

Expected: Export TSDoc, README parity and applicable catalogue/copy checks pass.

### TC-M0-016: Missing export example is rejected

Preconditions: common preconditions above; T-04.

1. Temporarily remove VERSION TSDoc, run docs:check, restore source.

Expected: Docs check fails for the undocumented export.

### TC-M0-017: Changesets status works

Preconditions: common preconditions above; T-04.

1. Run pnpm changeset status.

Expected: Exits 0 with valid configuration.

### TC-M0-018: Templates require synthetic reproductions

Preconditions: common preconditions above; T-04.

1. Compare PR and issue templates against TRD §17.8.

Expected: Exact privacy text is present and blank issues are disabled.

## M1 Model + core parser

Sources: PRD FR/NFR references below; TRD §§4–8, §16.3 and implementation tasks T-05–T-16. Preconditions: installed pinned workspace; synthetic test strings only. Each row is a distinct behavior group, expanded into vectors in Vitest. All cases are High priority and automatable. Official-source verification is a scripted/read-only research acceptance check.

| TC ID     | PRD reference          | TRD test / task     | Title                         | Priority | Automatable | Steps                                                                                                                                                      | Expected result                                                                                                                                        |
| --------- | ---------------------- | ------------------- | ----------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TC-M1-001 | FR-04                  | UT-38 / T-05        | Parse error contract          | High     | yes         | 1. Construct each of the five errors with the TRD sample details. 2. Assert the expected result.                                                           | Exact EN/TR messages, code, details, name and instanceof Error/EfaturaParseError.                                                                      |
| TC-M1-002 | FR-25, FR-26           | UT-39 / T-05        | Configuration is immutable    | High     | yes         | 1. Compare the public config with normative constants and attempt nested writes. 2. Assert the expected result.                                            | Exact constants and frozen public object, zip limits and playground values.                                                                            |
| TC-M1-003 | FR-25                  | T-05 / TRD §10.1    | Cooperative yield budget      | High     | yes         | 1. Use an injected clock below, at and after the budget; exercise scheduler and timer branches. 2. Assert the expected result.                             | Yield at the budget, reset the clock after yielding, use scheduler when available and a zero-delay timer otherwise.                                    |
| TC-M1-004 | FR-26                  | T-05 / TRD §10.1    | Abort propagates reason       | High     | yes         | 1. Abort before maybeYield and while an event-loop yield is pending. 2. Assert the expected result.                                                        | Reject with the exact signal.reason; non-aborted signals proceed.                                                                                      |
| TC-M1-005 | FR-15                  | UT-01 / T-06        | Exact decimal vectors         | High     | yes         | 1. Run every normative §8.2 vector including positive/negative ties and scale preservation. 2. Assert the expected result.                                 | Exact results from the table; no floating point arithmetic.                                                                                            |
| TC-M1-006 | FR-15                  | UT-02 / T-06        | Decimal argument failures     | High     | yes         | 1. Supply invalid decimal strings, zero divisors and invalid scale/places. 2. Assert the expected result.                                                  | TypeError for lexical/argument errors; RangeError for division by zero; unsigned zero.                                                                 |
| TC-M1-007 | FR-15                  | UT-03 / T-06        | Minor units                   | High     | yes         | 1. Run all §8.3 vectors, aliases and explicit precision overrides. 2. Assert the expected result.                                                          | Exact bigint results and prescribed errors; TRY/JPY/KWD/XAU/TL lookup behavior.                                                                        |
| TC-M1-008 | FR-02                  | UT-05 / T-07        | Encoding detection            | High     | yes         | 1. Encode synthetic text with each BOM, BOM-less UTF-16 and each declared supported encoding. 2. Assert the expected result.                               | Correct text and actual encoding; Turkish letters preserved.                                                                                           |
| TC-M1-009 | FR-02                  | UT-05 / T-07        | Encoding fallback             | High     | yes         | 1. Use unsupported labels and invalid UTF-8 without declaration, plus valid U+FFFD. 2. Assert the expected result.                                         | Exact EF035 variants only when required; correctly encoded replacement character does not trigger fallback.                                            |
| TC-M1-010 | FR-04                  | UT-05 / T-07        | Input bounds                  | High     | yes         | 1. Pass empty and whitespace input and values at/above maxBytes. 2. Assert the expected result.                                                            | EMPTY_INPUT and INPUT_TOO_LARGE with exact details; boundary allowed.                                                                                  |
| TC-M1-011 | FR-04, NFR-12          | UT-06 / T-07        | XML guard and entity security | High     | yes         | 1. Try malformed XML, prolog/mid-document DOCTYPE and ENTITY, comments, CDATA and nested billion-laughs declarations. 2. Assert the expected result.       | Exact errors; declarations rejected in under 10 ms; declaration-like comment/CDATA text allowed.                                                       |
| TC-M1-012 | FR-03                  | UT-07 / T-08        | Namespace scopes              | High     | yes         | 1. Parse canonical/renamed prefixes and redeclared default namespaces. 2. Assert the expected result.                                                      | Equivalent resolved trees except prefix; xmlns excluded from attrs.                                                                                    |
| TC-M1-013 | FR-03                  | UT-07 / T-08        | Tolerant matching             | High     | yes         | 1. Mix strict, absent, undeclared and foreign namespaces. 2. Assert the expected result.                                                                   | Strict matches win; fallback creates one EF009 per expected/actual pair at first path.                                                                 |
| TC-M1-014 | FR-03                  | UT-07 / T-08        | Text and entities             | High     | yes         | 1. Parse text, CDATA, predefined/numeric/unknown/invalid references. 2. Assert the expected result.                                                        | One-pass entity decoding; CDATA unchanged; direct text preserved and inter-element whitespace dropped.                                                 |
| TC-M1-015 | FR-03, NFR-10          | UT-07 / T-08        | Deep XML                      | High     | yes         | 1. Build a 10000-level document. 2. Assert the expected result.                                                                                            | No RangeError or recursive stack overflow.                                                                                                             |
| TC-M1-016 | FR-13                  | UT-08 / T-08        | Path selection                | High     | yes         | 1. Exercise all canonical prefixes, wildcard, indexes, absolute prefix, absent root and malformed paths. 2. Assert the expected result.                    | Expected nodes and trimmed text; invalid grammar throws TypeError.                                                                                     |
| TC-M1-017 | FR-05–FR-16            | UT-09 / T-09        | Scalar value conventions      | High     | yes         | 1. Supply text, booleans, safe/invalid integers and each decimalValue branch. 2. Assert the expected result.                                               | TRD §7.1 exact null/raw/value behavior and EF030/EF031.                                                                                                |
| TC-M1-018 | FR-07, FR-15           | UT-09 / T-09        | Amount and quantity values    | High     | yes         | 1. Read missing/present currency and unit attributes and decimal comma/invalid values. 2. Assert the expected result.                                      | Exact Amount/Quantity data and EF032 where prescribed.                                                                                                 |
| TC-M1-019 | FR-14                  | UT-13 / T-10        | Official code lists           | High     | yes         | 1. Compare every initial table against official sources and exercise lookup case handling and unknown codes. 2. Assert the expected result.                | EN/TR labels and verified source/version/date; no placeholders; unknown maps to OTHER.                                                                 |
| TC-M1-020 | FR-05                  | UT-14 / T-11        | Identity and references       | High     | yes         | 1. Build synthetic XML covering every identity/reference row in §7.3. 2. Assert the expected result.                                                       | Exact fields, repeated references, raw code and normalized lookup, notes and period.                                                                   |
| TC-M1-021 | FR-11                  | UT-15 / T-11        | Exchange rate precedence      | High     | yes         | 1. Supply each exchange-rate source and multiple sources in priority order. 2. Assert the expected result.                                                 | First nonempty CalculationRate wins; exact rate/raw/currencies/date/source and EF023 fallback.                                                         |
| TC-M1-022 | FR-11                  | UT-15 / T-11        | Exchange rate notes           | High     | yes         | 1. Exercise the four normative note variants and Kurum false match. 2. Assert the expected result.                                                         | Exact rate normalization without EF031; no false positive.                                                                                             |
| TC-M1-023 | FR-10                  | UT-15 / T-11        | Due date precedence           | High     | yes         | 1. Use PaymentMeans, PaymentTerms, both date-note formats and invalid calendar dates. 2. Assert the expected result.                                       | First valid prescribed source wins, normalized note date and correct source.                                                                           |
| TC-M1-024 | FR-06                  | UT-16 / T-12        | Party fields                  | High     | yes         | 1. Build synthetic organization/person parties with every address/contact/identifier field. 2. Assert the expected result.                                 | Every §7.5 field mapped, displayName fallback and identifier order retained; issue indices use the filtered array.                                     |
| TC-M1-025 | FR-06                  | UT-16 / T-12        | Tax identifier resolution     | High     | yes         | 1. Exercise all four §7.5.1 branches with approved synthetic identities, lowercase/missing scheme and multiple identifiers. 2. Assert the expected result. | Exact taxId selection, schemeRaw/inferred metadata and EF015 variants; checksum validation is deferred to T-18.                                        |
| TC-M1-026 | FR-07                  | UT-17 / T-13        | Line mapping                  | High     | yes         | 1. Build lines covering every §7.6 row, item IDs/classification, price/base quantity, allowances and deliveries. 2. Assert the expected result.            | Exact values and 1-based positions; no amount becomes number.                                                                                          |
| TC-M1-027 | FR-07                  | UT-17 / T-13        | Merge line taxes              | High     | yes         | 1. Supply multiple line TaxTotals and withholding totals. 2. Assert the expected result.                                                                   | Merged totals follow §7.6 and preserve prescribed subtotal order.                                                                                      |
| TC-M1-028 | FR-08                  | UT-18 / T-14        | Tax and withholding           | High     | yes         | 1. Map every tax row and rates 50,90,25,100,50.00. 2. Assert the expected result.                                                                          | Exact tax fields and withholding ratios per §7.7.                                                                                                      |
| TC-M1-029 | FR-09, FR-10           | UT-19 / T-14        | Totals allowances payments    | High     | yes         | 1. Populate all seven monetary totals, allowances and charges, payment means and terms. 2. Assert the expected result.                                     | Every field follows §7.8, including null/empty conventions.                                                                                            |
| TC-M1-030 | FR-08, FR-09           | UT-21 / T-14        | Computed totals               | High     | yes         | 1. Exercise every §7.8.6 derivation with TRY, TL, foreign currency with/without rate and missing amounts. 2. Assert the expected result.                   | Exact decimal calculations and payableTry/null behavior.                                                                                               |
| TC-M1-031 | FR-12                  | UT-04 / T-15        | Base64 decoding               | High     | yes         | 1. Test padding/missing padding, invalid characters and empty input. 2. Assert the expected result.                                                        | Exact bytes or specified TypeError position; no Node built-ins.                                                                                        |
| TC-M1-032 | FR-12                  | UT-20 / T-15        | Attachment metadata and XSLT  | High     | yes         | 1. Exercise §7.8.5 truth table, data/metadata modes and 100 generated byte arrays. 2. Assert the expected result.                                          | Correct metadata/isXslt/size; size equals decoded length.                                                                                              |
| TC-M1-033 | FR-12                  | UT-20 / T-15        | Attachment helpers            | High     | yes         | 1. Decode data, absent/invalid base64, character sets and find first XSLT. 2. Assert the expected result.                                                  | Exact helper results and specified TypeError/fallback behavior.                                                                                        |
| TC-M1-034 | FR-01, FR-04           | UT-22, UT-38 / T-16 | Parser orchestration          | High     | yes         | 1. Parse full synthetic string/bytes and each unacceptable input/root. 2. Assert the expected result.                                                      | Synchronous ParseResult or exact EfaturaParseError; self-reference instanceof preserved.                                                               |
| TC-M1-035 | FR-04, FR-13           | UT-22 / T-16        | Parser options and issues     | High     | yes         | 1. Exercise validate false, rule off/severity, tolerance, includeRaw, attachments, maxBytes and invalid options. 2. Assert the expected result.            | Mapping issues retained unless disabled, deterministic sorting/deduplication; invalid options throw TypeError. Validation rules remain deferred to M2. |
| TC-M1-036 | FR-16, NFR-09          | UT-23 / T-16        | JSON safety and determinism   | High     | yes         | 1. Repeat full-model parsing; JSON roundtrip and structuredClone. 2. Assert the expected result.                                                           | Deep-equal plain-data results without bigint, Date or class instances.                                                                                 |
| TC-M1-037 | NFR-05, NFR-11, NFR-18 | T-16                | Public package contract       | High     | yes         | 1. Build package and run size, publint, attw and docs checks against real exports. 2. Assert the expected result.                                          | Budgets unchanged; VERSION placeholders removed; 36 kB check imports parseInvoice; declarations and examples pass.                                     |
