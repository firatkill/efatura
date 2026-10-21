# Progress

## Repository setup

- Read AGENTS.md and all four specification documents from start to finish.
- Git identity verified; initialized main and enabled the executable authorship hook.
- Initial documents committed in baec5f6.
- Hook checks passed: owner accepted, other author/committer rejected, attribution removed.
- Codex configuration has no attribution override; commits use explicit messages through git and the repository hook.
- GitHub repository created and initial commits pushed after explicit owner approval (D-46).
- T-01–T-04 implementation and local/CI acceptance checks passed. M0 is complete; owner approved continuing into M1. The separate Dependabot alerts owner checklist remains open.

## Tasks

The finishing commit is recorded when a task is completed. In its own completion commit, `HEAD` identifies that commit; later updates replace it with the hash.

| Task | Description                                                        | Status | Finishing commit |
| ---- | ------------------------------------------------------------------ | ------ | ---------------- |
| T-01 | Scaffold the repository and tooling                                | done   | 5c060ad          |
| T-02 | Build, exports map and package checks                              | done   | ce74eee          |
| T-03 | Test runners and CI test jobs                                      | done   | 9f7ddf7          |
| T-04 | Changesets, licence check, docs check, templates                   | done   | e5b5c4d          |
| T-05 | Configuration, errors and internal helpers                         | done   | 7fd18e8          |
| T-06 | Decimal module and minor units                                     | done   | 7a413ed          |
| T-07 | Input decoding and guard                                           | done   | 6032094          |
| T-08 | Namespace-resolved XML tree, query, select and paths               | done   | fbf42af          |
| T-09 | Public model types and value conventions                           | done   | 748533d          |
| T-10 | Code lists and their verification                                  | done   | 1a582d0          |
| T-11 | Identity, references, exchange rate and due date mapping           | done   | 8fb44f9          |
| T-12 | Party mapping                                                      | done   | b2c6a5b          |
| T-13 | Line, item, price, delivery and allowance mapping                  | done   | 3c150f0          |
| T-14 | Taxes, withholding, totals, payment and computed totals            | done   | 76beb06          |
| T-15 | Attachments and base64                                             | done   | 1b40f4a          |
| T-16 | `parseInvoice` orchestration                                       | done   | f983667          |
| T-17 | Issue framework, catalogue and messages                            | done   | 940a803          |
| T-18 | Identifier algorithms                                              | done   | ee82cde          |
| T-19 | Identity and party rules (EF001–EF017)                             | done   | 29e3607          |
| T-20 | Currency and amount rules (EF020–EF035)                            | done   | 6f32db8          |
| T-21 | Totals rules (EF040–EF049)                                         | done   | f65f3b4          |
| T-22 | Line and tax rules (EF050–EF066)                                   | done   | b3d7697          |
| T-23 | Batch API: `iterateMany`, `parseMany`, duplicates, progress, abort | done   | 730d9bb          |
| T-24 | ZIP helpers: classification, junk, limits, errors                  | done   | 0baee55          |
| T-25 | Streaming ZIP reader and `iterateAny`                              | done   | HEAD             |
| T-26 | Rows                                                               | todo   | —                |
| T-27 | CSV                                                                | todo   | —                |
| T-28 | CLI arguments, inputs and glob                                     | todo   | —                |
| T-29 | CLI outputs, summary, progress, exit codes and texts               | todo   | —                |
| T-30 | CLI tests                                                          | todo   | —                |
| T-31 | Fixture builder, identities and XSLT texts                         | todo   | —                |
| T-32 | Scenarios, generation and manifest                                 | todo   | —                |
| T-33 | Fixture check in CI                                                | todo   | —                |
| T-34 | Snapshot tests                                                     | todo   | —                |
| T-35 | Property and fuzz tests                                            | todo   | —                |
| T-36 | Browser tests and benchmark                                        | todo   | —                |
| T-37 | Playground scaffold, design tokens, fonts, theme, i18n, layout     | todo   | —                |
| T-38 | Headers, CSP, build guards and samples                             | todo   | —                |
| T-39 | Worker, client, dropzone, processing and cancel                    | todo   | —                |
| T-40 | Results view: tables, cards, filters, sort, pagination, issues     | todo   | —                |
| T-41 | Detail view and official view                                      | todo   | —                |
| T-42 | Exports in the playground and third-party licences                 | todo   | —                |
| T-43 | Playground E2E, accessibility, responsiveness and privacy tests    | todo   | —                |
| T-44 | READMEs, release workflow and playground deploy                    | todo   | —                |
| T-45 | Real-world check and release 0.1.0                                 | todo   | —                |

## Open questions for the owner

- T-01 owner checklist: enable Dependabot alerts in GitHub settings. Secret scanning and push protection were verified enabled; vulnerability alerts returned disabled.

## Verification limits

- M0 is complete. D-53–D-55 record all three approved corrections. CI runs 39566277873 and 39566500555 passed; the QA ledger, milestone report and review are in qa/. Owner approved continuing into M1.
- Local aggregate checks passed: lint, typecheck, unit coverage, CLI, package compatibility, six tooling tests, size budgets, publint, attw, licences and docs parity. Chromium, Firefox and WebKit smoke tests passed separately.
- Windows CLI Node 20 and 24 passed after the direct Node chmod callback correction.
- Negative checks rejected network access, a temporary GPL dependency and missing export TSDoc. Temporary files and manifest changes were restored.
- A-22 was verified after owner login; npm identity is firatkill and the package lookup returned 404. No publish was attempted.
- Parser, validation, generated fixtures, playground and release checks belong to later milestones. M0 coverage measures the current placeholder exports only.

### M1 completed verification

T-05 local lint, typecheck, unit coverage, three-browser smoke tests, build, size and package/docs checks passed. CI run 39567971153 passed all jobs. M1 case design is recorded before implementation in qa/test-cases.md.

T-06 local acceptance checks passed, including 100% decimal line/branch coverage, all normative vectors, browser smoke, build/size and docs parity. CI run 39568717677 passed all jobs.

T-07 local lint, typecheck, 56 unit tests, coverage, build/size/docs checks and browser decoding tests passed. D-57 records approved parser depth; full tree depth verification is T-08. CI run 39569202744 passed, including Node 20/22/24 encoding checks.

T-08 local acceptance passed: 75 unit cases, strict lint/typecheck, 100% line and 96.82% branch coverage, browser suite, build/size/docs checks. Full 10,000-level tree test passed after D-57. CI run 39570029486 passed all jobs.

T-09 local acceptance passed: 89 unit tests, lint/typecheck, 100% line and 97.23% branch coverage, browser suite and build/size/docs checks. Public numeric fields inspected: only size, position, line count, details and limits use number. Unit lookup is injected until T-10 supplies verified lists. CI run 39570674656 passed all jobs.

T-10 membership reconciliation and abbreviation exceptions approved (D-59/D-60). Source verification and code lists implemented. Local checks passed: 94 unit tests, lint/typecheck, 100% line and 97.30% branch coverage, browser suite, build, size, docs parity, publint and attw. CI run 39573480868 passed all jobs.

T-11 local acceptance passed: 113 unit tests, lint/typecheck, 100% line and 97.36% branch coverage, browser suite, build/size and docs parity. CI run 39574280830 passed all jobs.

T-12 tax-ID resolution and approved EF015 details are complete. Local checks passed: 118 unit tests, 100% line and 97.60% branch coverage, lint/typecheck, browser suite and build/size/docs. CI run 39578422078 passed all jobs.

T-13 local acceptance passed: 122 unit tests, 100% line and 96.26% branch coverage, lint/typecheck, browser suite and build/size/docs. Tax conversion is injected through the typed boundary until T-14. CI run 39578874259 passed all jobs.

T-14 local acceptance passed: 142 unit tests, 100% lines and 96.67% branches, lint/typecheck, browser suite, build/size/docs. CI run 39579431743 passed all jobs.

T-15 local acceptance passed: 172 unit tests, 100% lines and 96.75% branches, lint/typecheck, browser suite and build/size/docs. CI run 39580087237 passed all jobs.

T-16 completed in f983667. Final `pnpm check` and three-browser suite passed: 184 unit cases, 12 browser cases, 100% lines / 96.79% branches; decimal line coverage 100%. Full core 39.95 kB / 40 kB; parser-only 35.70 kB / 36 kB. All 434 verified code-list records remain unchanged after internal storage/tree-shaking optimization. CI run 39583967695 passed every job. D-70–D-72 record the verified envelope namespace, approved namespace descriptors and authorization to continue size optimization.

M1 is complete: all 37 cases resolved, ledger integrity passed, and qa/M1-report.md and qa/M1-review.md document coverage, historical failures and verification limits. Validation, functional ZIP/CLI processing, generated fixtures, snapshots/fuzzing, benchmarks, private-corpus acceptance, playground manual checks and release remain later work. The ZIP entry is intentionally empty until T-25; its functional behavior and shared-core identity are not yet verified. No publish/deployment occurred. Stopped at the milestone boundary; T-17 has not started.

## M2 completed verification

Owner authorized continuing after M1. M2 case design is recorded in qa/test-cases.md before implementation. D-73 records the approved staged coverage gates and shared issue-infrastructure imports. T-17 is being implemented with catalogue parity enforced immediately.

D-74 approves bundling the pinned XML parser with guarded, unchanged safety-context metadata relocation. The actual published bundle is being verified against the original security predicates and unchanged size budgets.

T-17 local acceptance passed: 199 unit tests, 100% lines / 96.92% branches (validation lines 100%), 12 browser tests across Chromium/Firefox/WebKit, one CLI test, four package tests, six tooling tests, lint/typecheck/build, size, publint/attw, licences and docs parity. Two deep-tree timeout failures under host CPU contention are retained in the ledger; affected retest and full coverage with two workers passed without changing timeouts or thresholds. Full core 38.53 kB and parser-only 34.35 kB; ZIP remains a placeholder until T-25. Rules are registered in T-19–T-22, generated-fixture coverage activates in T-32 under D-73. Remote CI verification follows the push.

T-17 completed in 940a803; CI run 39588599085 passed every job. T-18 identifier algorithms now follow TRD §9.2 exactly; independent source verification is recorded in D-75.

T-18 local acceptance passed: 202 unit tests, 100% lines / 97% branches and identifier lines 100%; 12 browser cases; five package cases; lint, typecheck, build, size, docs parity, publint and attw. Full core 38.87 kB and parser-only 34.37 kB. D-75 records independent checksum verification. CI verification follows the push. T-19 is waiting on the EF001 aggregate-presence interpretation above; M2 is not complete.

Owner approved the EF001 model-based interpretation (D-76). T-18 CI 39589212977 passed all jobs. T-19 is in progress; A-08/A-10 findings are recorded in D-77.

T-19 local acceptance passed: 217 unit tests, 100% lines / 97.23% branches, validation lines 100%; 12 browser cases and five package cases; lint/typecheck/docs/build/size. Full core 39.8 kB; parser-only 35.41 kB. D-76 records the approved EF001 interpretation and D-77 verifies A-08/A-10. Earlier M1 mapping-only test assumptions were updated to explicitly isolate mapping; failure/retest history retained. CI verification follows push.

T-19 completed in 29e3607; CI 39592462877 passed all jobs. T-20 targeted currency/amount tests are in progress. Owner approved missing diagnostic parameters (D-78) and fixed-option parser specialization (D-79); implementation and acceptance checks are in progress.

T-20 local acceptance passed: 227 unit tests, 100% lines / 97.40% branches, validation lines 100%; 12 browser and five package cases; lint/typecheck, docs, licences, publint and attw. D-78 records missing message parameters; D-79 records approved parser specialization with equivalence/source/version/option guards. Full core 38.77 kB / 40 kB, parser 34.41 kB / 36 kB. CI verification follows push.

Final T-20 coverage passed all 227 tests with one local worker after a host-contention deep-tree timeout; isolated retest also passed. Timeout and coverage thresholds are unchanged, and failure/retest history is retained.

T-20 CI run 39594788959 passed all jobs. T-21 totals rules are in progress.

T-21 local acceptance passed: 237 unit tests, 100% lines / 97.55% branches, all validation lines 100%; 12 browser and five package cases; lint/typecheck/build/size/docs parity. Both EF041 formulas, EF043/EF044 split, four tax locations, per-unit skips, base-quantity precision and custom/default tolerance boundaries pass. Full core 39.59 kB, parser 35.38 kB. CI verification follows push.

T-21 CI run 39595268059 passed all jobs. T-22 line and tax validation is in progress.

T-22 implementation and functional verification pass: 250 unit tests, 100% lines / 97.72% branches, validation lines 100%; 12 browser and five package cases; lint/typecheck/build/docs parity. Namespace-only assertion now selects EF009 explicitly while retaining new EF050 root errors. Full core remains 40.02 kB (18 bytes over 40 kB); parser-only passes at 35.83 kB. After three size failures, the QA skill-required owner check-in is pending. T-22 is not committed or complete; no budgets or parser transforms were changed. M2 closure review awaits resolution; T-23 has not started.

Owner approved continuing size optimization (D-80). Currency membership now has one stored code sequence shared with its metadata, with all 178 prior verified records protected by a byte-for-byte digest regression test. Acceptance checks are in progress.

T-22 final local acceptance passed: 251 unit tests, 100% lines / 97.61% branches, validation/decimal/identifier lines 100%; 12 browser tests, CLI baseline, five package and six tooling tests; lint/typecheck/build/size/publint/attw/licences/docs parity. D-80 authorizes continued internal optimization; shared currency membership preserves every prior record. Full core 39.56 kB and parser 35.84 kB meet unchanged limits. All M2 cases are resolved; T-22 CI and milestone review follow the push.

M2 is complete. T-22 finished in b3d7697; CI run 39616305268 reports success and all acceptance steps passed (lint/typecheck job headers temporarily lagged their successful completed steps). All 63 designed M2 cases are resolved; qa/M2-report.md and qa/M2-review.md record the evidence, retained failures and deferred verification. TC-M2-011 is correctly marked as completed source research, with automated checksum vectors retained. Generated fixtures, batch/ZIP/exports/CLI processing, broad fuzzing, benchmarks, private-corpus and playground/manual acceptance remain later tasks. Stopped at the milestone boundary; T-23 has not started.

M3 started. Owner approved D-81–D-83; milestone cases designed before code. T-23 implementation in progress.

T-23: batch implementation and targeted tests pass. Full core size 41.04 kB exceeds 40 kB; guarded path-specialization prototype meets limits (39.03 / 33.80 kB), production transform restored. Open owner question: approve docs/T23-BUNDLE-PROPOSAL.md before adoption. No task completion commit/push yet.

T-23 QA before size decision: 265 unit tests pass; coverage 100% lines / 97.81% branches, 100% functions. All 15 browser tests pass across Chromium, Firefox and WebKit. Lint, typecheck and docs parity pass. Final progress fix counts unreadable Blob bytes as zero consumed. T-23 remains doing pending size proposal approval; T-24 not started, CI and completion commit/push not yet applicable.

D-84 approved: implementing guarded path specialization and completing T-23 acceptance.

T-23 complete locally: D-81–D-84 recorded; batch API, duplicates, sources, summaries, progress and cancellation implemented. 267 unit tests and 15 browser tests pass; coverage 100% lines / 97.81% branches. Full core 39.12 kB, parser 33.81 kB. Build/package/tooling/lint/types/docs/publint/attw/licences pass; ledger passes. Finishing commit is HEAD; push and CI verification follow.

T-23 CI 39630107500: all 11 jobs green at 730d9bb. T-24 started.

T-24 local acceptance complete: classification/junk detection, positive finite ZIP limits, bilingual error factory and normative ZipLimits type; 270 tests pass, 100% lines / 97.76% branches, 15 browser tests and all required local gates. Two unchanged depth tests initially timed out under local load, then passed targeted/full retests. Finishing commit HEAD; push and CI verification follow.

T-24 CI 39631324289: all 11 jobs green at 0baee55. T-25 A-14 spike confirms synchronous callbacks, unknown descriptor sizes, no UnzipInflate termination and no encryption flags. The normative 20 MiB bomb test exposes 87,941,824 bytes of arrayBuffers growth before the first rejection callback, exceeding 30 MiB; preparing a bounded-decoder proposal before ZIP implementation.

T-25 D-85 approved and implemented in draft: bounded terminating inflater, discard decoders, nested ZIP/mixed input APIs, encryption pre-read, limits, progress and cancellation. All 18 targeted ZIP/any tests pass, including the independent 20 MiB bomb memory check below 30 MiB. Full acceptance, commit, push and CI remain pending.

Open owner check-in for T-25: qa-test-run-loop requires a check-in after three consecutive tooling failures (coverage command selection, then draft lint issues). Continue fixing/retesting the remaining callback-flag inference lint issue, or pause that case? Asked through the input tool; other behavior tests continued and pass. No thresholds were changed.

Owner approved continuing T-25 tooling fixes and retests (D-86). The callback error state now uses an object so TypeScript recognizes mutations inside the synchronous ZIP callback. Acceptance checks resumed.

T-25 local acceptance complete: 290 unit tests, 99.02% lines / 96.24% branches, 15 browser tests; lint/typecheck/build/docs, five package tests, six tooling tests, publint/attw/licences pass. Core 39.10 kB, parser 33.81 kB, ZIP 49.12 kB. D-85 records bounded inflation/discard decoders; D-86 records resumed QA tooling work. Earlier failures and retests retained. Task finishing commit is HEAD; push and CI verification follow.
