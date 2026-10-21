# M1 QA milestone report

Scope: T-05–T-16, model and core parser. Implementation commit: `f983667`. Sources: [case design](test-cases.md#m1-model--core-parser), [append-only ledger](test-results.json), [PRD decisions](../docs/PRD.md), [TRD](../docs/TRD.md) and [source verification](../docs/CODE-LIST-VERIFICATION.md).

## Verification

- Final local `pnpm check` and `pnpm test:browser` passed: 184 unit cases, 12 browser cases across Chromium/Firefox/WebKit, CLI version baseline, package and tooling suites, lint/typecheck, build, publint, attw, licence allowlist and documentation parity.
- Coverage: 100% lines, 96.79% branches and 100% functions. Decimal line coverage remains 100%. These figures cover implemented M1 code, not future validation/export/ZIP modules.
- Size budgets unchanged: full core 39.95 kB / 40 kB; parser-only 35.70 kB / 36 kB. The empty ZIP entry is 10 B; that does not verify the future ZIP implementation.
- Data-preservation audit compared all 434 code-list records before and after compact storage; every value matched. Parser-only imports omit unused labels and currency data. Public exports retain full maps.
- CI: all jobs passed in [T-16 run 39583967695](https://github.com/firatkill/efatura/actions/runs/39583967695).

## Resolved

| Case      | Title                         | Requirement            | Evidence / current status                                                                                                                                                                             |
| --------- | ----------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-M1-001 | Parse error contract          | FR-04                  | Passed; [test/unit/errors.test.ts](../test/unit/errors.test.ts)                                                                                                                                       |
| TC-M1-002 | Configuration is immutable    | FR-25, FR-26           | Passed; [test/unit/config.test.ts](../test/unit/config.test.ts)                                                                                                                                       |
| TC-M1-003 | Cooperative yield budget      | FR-25                  | Passed; [test/unit/internal.test.ts](../test/unit/internal.test.ts)                                                                                                                                   |
| TC-M1-004 | Abort propagates reason       | FR-26                  | Passed; [test/unit/internal.test.ts](../test/unit/internal.test.ts)                                                                                                                                   |
| TC-M1-005 | Exact decimal vectors         | FR-15                  | Passed; [test/unit/decimal.test.ts](../test/unit/decimal.test.ts)                                                                                                                                     |
| TC-M1-006 | Decimal argument failures     | FR-15                  | Passed; [test/unit/decimal.test.ts](../test/unit/decimal.test.ts)                                                                                                                                     |
| TC-M1-007 | Minor units                   | FR-15                  | Passed; [test/unit/minor-units.test.ts](../test/unit/minor-units.test.ts)                                                                                                                             |
| TC-M1-008 | Encoding detection            | FR-02                  | Passed; [test/browser/decode.browser.test.ts](../test/browser/decode.browser.test.ts); [test/unit/decode.test.ts](../test/unit/decode.test.ts); [test/unit/guard.test.ts](../test/unit/guard.test.ts) |
| TC-M1-009 | Encoding fallback             | FR-02                  | Passed; [test/unit/decode.test.ts](../test/unit/decode.test.ts)                                                                                                                                       |
| TC-M1-010 | Input bounds                  | FR-04                  | Passed; [test/unit/decode.test.ts](../test/unit/decode.test.ts)                                                                                                                                       |
| TC-M1-011 | XML guard and entity security | FR-04, NFR-12          | Passed; [test/unit/guard.test.ts](../test/unit/guard.test.ts); [test/unit/tree.test.ts](../test/unit/tree.test.ts)                                                                                    |
| TC-M1-012 | Namespace scopes              | FR-03                  | Passed; [test/unit/tree.test.ts](../test/unit/tree.test.ts)                                                                                                                                           |
| TC-M1-013 | Tolerant matching             | FR-03                  | Passed; [test/unit/tree.test.ts](../test/unit/tree.test.ts)                                                                                                                                           |
| TC-M1-014 | Text and entities             | FR-03                  | Passed; [test/unit/tree.test.ts](../test/unit/tree.test.ts)                                                                                                                                           |
| TC-M1-015 | Deep XML                      | FR-03, NFR-10          | Passed; [test/unit/tree.test.ts](../test/unit/tree.test.ts)                                                                                                                                           |
| TC-M1-016 | Path selection                | FR-13                  | Passed; [test/unit/select.test.ts](../test/unit/select.test.ts)                                                                                                                                       |
| TC-M1-017 | Scalar value conventions      | FR-05–FR-16            | Passed; [test/unit/values.test.ts](../test/unit/values.test.ts)                                                                                                                                       |
| TC-M1-018 | Amount and quantity values    | FR-07, FR-15           | Passed; [test/unit/values.test.ts](../test/unit/values.test.ts)                                                                                                                                       |
| TC-M1-019 | Official code lists           | FR-14                  | Passed; [test/unit/codes.test.ts](../test/unit/codes.test.ts)                                                                                                                                         |
| TC-M1-020 | Identity and references       | FR-05                  | Passed; [test/unit/map-identity.test.ts](../test/unit/map-identity.test.ts)                                                                                                                           |
| TC-M1-021 | Exchange rate precedence      | FR-11                  | Passed; [test/unit/map-exchange-rate.test.ts](../test/unit/map-exchange-rate.test.ts)                                                                                                                 |
| TC-M1-022 | Exchange rate notes           | FR-11                  | Passed; [test/unit/map-exchange-rate.test.ts](../test/unit/map-exchange-rate.test.ts)                                                                                                                 |
| TC-M1-023 | Due date precedence           | FR-10                  | Passed; [test/unit/map-exchange-rate.test.ts](../test/unit/map-exchange-rate.test.ts)                                                                                                                 |
| TC-M1-024 | Party fields                  | FR-06                  | Passed; [test/unit/map-party.test.ts](../test/unit/map-party.test.ts)                                                                                                                                 |
| TC-M1-025 | Tax identifier resolution     | FR-06                  | Passed; [test/unit/map-party.test.ts](../test/unit/map-party.test.ts)                                                                                                                                 |
| TC-M1-026 | Line mapping                  | FR-07                  | Passed; [test/unit/map-line.test.ts](../test/unit/map-line.test.ts)                                                                                                                                   |
| TC-M1-027 | Merge line taxes              | FR-07                  | Passed; [test/unit/map-line.test.ts](../test/unit/map-line.test.ts); [test/unit/map-tax.test.ts](../test/unit/map-tax.test.ts)                                                                        |
| TC-M1-028 | Tax and withholding           | FR-08                  | Passed; [test/unit/map-tax.test.ts](../test/unit/map-tax.test.ts)                                                                                                                                     |
| TC-M1-029 | Totals allowances payments    | FR-09, FR-10           | Passed; [test/unit/map-totals.test.ts](../test/unit/map-totals.test.ts)                                                                                                                               |
| TC-M1-030 | Computed totals               | FR-08, FR-09           | Passed; [test/unit/computed.test.ts](../test/unit/computed.test.ts)                                                                                                                                   |
| TC-M1-031 | Base64 decoding               | FR-12                  | Passed; [test/unit/base64.test.ts](../test/unit/base64.test.ts)                                                                                                                                       |
| TC-M1-032 | Attachment metadata and XSLT  | FR-12                  | Passed; [test/unit/attachments.test.ts](../test/unit/attachments.test.ts); [test/unit/base64.test.ts](../test/unit/base64.test.ts)                                                                    |
| TC-M1-033 | Attachment helpers            | FR-12                  | Passed; [test/unit/attachments.test.ts](../test/unit/attachments.test.ts)                                                                                                                             |
| TC-M1-034 | Parser orchestration          | FR-01, FR-04           | Passed; [test/browser/smoke.browser.test.ts](../test/browser/smoke.browser.test.ts); [test/unit/parse.test.ts](../test/unit/parse.test.ts)                                                            |
| TC-M1-035 | Parser options and issues     | FR-04, FR-13           | Passed; [test/unit/parse.test.ts](../test/unit/parse.test.ts)                                                                                                                                         |
| TC-M1-036 | JSON safety and determinism   | FR-16, NFR-09          | Passed; [test/browser/smoke.browser.test.ts](../test/browser/smoke.browser.test.ts); [test/unit/parse.test.ts](../test/unit/parse.test.ts)                                                            |
| TC-M1-037 | Public package contract       | NFR-05, NFR-11, NFR-18 | Passed; [test/package/build.test.mjs](../test/package/build.test.mjs)                                                                                                                                 |

TC-M1-019 also includes the official-source research recorded in CODE-LIST-VERIFICATION.md. TC-M1-037 additionally runs the build, size, publint, attw and docs scripts; its package test alone is not the complete acceptance check.

## Pending Decision

None in the M1 case ledger. D-57, D-59/D-60, D-69, D-71 and D-72 record the relevant owner approvals. Historical owner-escalation references on TC-M1-025 and TC-M1-037 remain in the ledger for audit; neither is pending. The separate T-01 owner checklist to enable Dependabot alerts remains open.

## Manual Test Required

None of the 37 M1 cases requires a manual product pass. The official invoice view, exported Excel file and real drag-and-drop checks belong to later playground milestones and have not been verified.

## Regressions

No case has a classified regression reference. Deep-XML timeout failures were distinct from the previously resolved parser-default depth limit and remain visible in the history.

## Audit trail

No case is retracted or omitted. All attempts are preserved. TC-M1-015 has three historical failures: the pinned parser default depth limit (owner-approved D-57), then two stress-test timeouts under local load. Subsequent sequential coverage and CI passed with the original timeout. TC-M1-037 has five failed attempts covering bundle size and a final lint correction; owner approval D-72 permitted continued optimization after the three-failure check-in. Subsequent aggregate checks passed without changing budgets or thresholds.

## Root cause groups

No root-cause clusters are assigned in this milestone.

## Requirement coverage

All designed M1 cases have an actual passing result and a persistent automated test reference. The table above maps every case to its PRD FR/NFR and the case design maps it to a TRD test ID. FR-01–FR-16 are verified only for the mapping/parser scope defined by T-05–T-16. FR-25/FR-26 cases verify configuration, yielding and abort helpers, not the future archive pipeline. NFR claims cover the specific tested security, JSON-safety, compatibility, depth and size behavior; they do not establish all project-wide NFR acceptance.

## Verification limits

- Validation is intentionally a no-op until T-17; checksums and business rules are not implemented or verified.
- Generated scenarios, rule-coverage fixtures, snapshots, fuzz campaigns, benchmarks, private corpus acceptance, functional ZIP processing, CLI invoice processing and playground/release checks remain scheduled for later milestones.
- No real invoices were used or committed. No npm publish or deployment was performed.
- Unit code verification uses the documented GİB list and OASIS-hosted UN/ECE revision 8e; the inaccessible newer UNECE source is not claimed verified.
- The full-core budget has little remaining headroom. Later tasks must continue enforcing the existing limit.

M1 is ready to close: remote CI and the [milestone review](M1-review.md) passed. T-17 has not started.
