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
| T-11 | Identity, references, exchange rate and due date mapping           | doing  | —                |
| T-12 | Party mapping                                                      | done   | b2c6a5b          |
| T-13 | Line, item, price, delivery and allowance mapping                  | doing  | —                |
| T-14 | Taxes, withholding, totals, payment and computed totals            | todo   | —                |
| T-15 | Attachments and base64                                             | todo   | —                |
| T-16 | `parseInvoice` orchestration                                       | todo   | —                |
| T-17 | Issue framework, catalogue and messages                            | todo   | —                |
| T-18 | Identifier algorithms                                              | todo   | —                |
| T-19 | Identity and party rules (EF001–EF017)                             | todo   | —                |
| T-20 | Currency and amount rules (EF020–EF035)                            | todo   | —                |
| T-21 | Totals rules (EF040–EF049)                                         | todo   | —                |
| T-22 | Line and tax rules (EF050–EF066)                                   | todo   | —                |
| T-23 | Batch API: `iterateMany`, `parseMany`, duplicates, progress, abort | todo   | —                |
| T-24 | ZIP helpers: classification, junk, limits, errors                  | todo   | —                |
| T-25 | Streaming ZIP reader and `iterateAny`                              | todo   | —                |
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

### M1 current verification

T-05 local lint, typecheck, unit coverage, three-browser smoke tests, build, size and package/docs checks passed. CI run 39567971153 passed all jobs. M1 case design is recorded before implementation in qa/test-cases.md.

T-06 local acceptance checks passed, including 100% decimal line/branch coverage, all normative vectors, browser smoke, build/size and docs parity. CI run 39568717677 passed all jobs.

T-07 local lint, typecheck, 56 unit tests, coverage, build/size/docs checks and browser decoding tests passed. D-57 records approved parser depth; full tree depth verification is T-08. CI run 39569202744 passed, including Node 20/22/24 encoding checks.

T-08 local acceptance passed: 75 unit cases, strict lint/typecheck, 100% line and 96.82% branch coverage, browser suite, build/size/docs checks. Full 10,000-level tree test passed after D-57. CI run 39570029486 passed all jobs.

T-09 local acceptance passed: 89 unit tests, lint/typecheck, 100% line and 97.23% branch coverage, browser suite and build/size/docs checks. Public numeric fields inspected: only size, position, line count, details and limits use number. Unit lookup is injected until T-10 supplies verified lists. CI run 39570674656 passed all jobs.

T-10 membership reconciliation and abbreviation exceptions approved (D-59/D-60). Source verification and code lists implemented. Local checks passed: 94 unit tests, lint/typecheck, 100% line and 97.30% branch coverage, browser suite, build, size, docs parity, publint and attw. CI run 39573480868 passed all jobs.

T-11 local acceptance passed: 113 unit tests, lint/typecheck, 100% line and 97.36% branch coverage, browser suite, build/size and docs parity. CI run 39574280830 passed all jobs.

T-12 independent party/address/contact field mapping is implemented; targeted UT-16 field tests and full local checks pass: 115 unit tests, lint/typecheck, 100% lines and 97.47% branches, nine browser cases, build/size/docs. The prescribed synthetic identity subset is introduced now for these tests; T-31 completes the generator identities. EF015 combined details approved in D-69; completing tax-ID resolution.

T-12 tax-ID resolution and approved EF015 details are complete. Local checks passed: 118 unit tests, 100% line and 97.60% branch coverage, lint/typecheck, browser suite and build/size/docs. CI run 39578422078 passed all jobs.

T-13 local acceptance passed: 122 unit tests, 100% line and 96.26% branch coverage, lint/typecheck, browser suite and build/size/docs. Tax conversion is injected through the typed boundary until T-14. CI pending.
