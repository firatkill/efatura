# M0 Setup QA report

Scope: repository setup and T-01–T-04 only. Sources: PRD, TRD §§2–3 and §§16–18, implementation acceptance lists, [case definitions](test-cases.md), and [results ledger](test-results.json). All 20 cases were executed and resolved. This is tooling verification, not verification of the future parser or playground.

## Resolved

| Case         | Title                                            | Result                              |
| ------------ | ------------------------------------------------ | ----------------------------------- |
| TC-SETUP-001 | Initialize with owner identity and active hook   | Passed; see ledger attempt history. |
| TC-SETUP-002 | Enforce authorship and remove attribution        | Passed; see ledger attempt history. |
| TC-M0-001    | Pinned workspace installs and strict checks pass | Passed; see ledger attempt history. |
| TC-M0-002    | Core rejects Node built-ins                      | Passed; see ledger attempt history. |
| TC-M0-004    | npm account and package name verified            | Passed; see ledger attempt history. |
| TC-M0-003    | Tooling CI is green                              | Passed; see ledger attempt history. |
| TC-M0-005    | Build and package compatibility checks pass      | Passed; see ledger attempt history. |
| TC-M0-006    | ZIP references the shared core                   | Passed; see ledger attempt history. |
| TC-M0-007    | CLI is executable and reports version            | Passed; see ledger attempt history. |
| TC-M0-008    | Unit smoke and coverage pass                     | Passed; see ledger attempt history. |
| TC-M0-010    | Built CLI version test passes                    | Passed; see ledger attempt history. |
| TC-M0-011    | Tests reject network access                      | Passed; see ledger attempt history. |
| TC-M0-009    | Core smoke runs in three engines                 | Passed; see ledger attempt history. |
| TC-M0-012    | Test CI matrices pass                            | Passed; see ledger attempt history. |
| TC-M0-013    | Allowed production licences pass                 | Passed; see ledger attempt history. |
| TC-M0-015    | Docs parity and export examples pass             | Passed; see ledger attempt history. |
| TC-M0-016    | Missing export example is rejected               | Passed; see ledger attempt history. |
| TC-M0-018    | Templates require synthetic reproductions        | Passed; see ledger attempt history. |
| TC-M0-017    | Changesets status works                          | Passed; see ledger attempt history. |
| TC-M0-014    | Disallowed production licence fails              | Passed; see ledger attempt history. |

## Pending decision

No implementation decisions remain pending. Owner approvals D-53–D-55 cover Windows build permissions, Zlib and workspace root membership. The separate owner checklist to enable GitHub Dependabot alerts remains open; the last API check reported disabled. Secret scanning and push protection were enabled.

## Manual test required

No M0 product cases require a live manual pass. Official invoice view, Excel opening and archive drag-and-drop are later-milestone work and have not been verified.

## Regressions and audit trail

No cases are marked as regressions or retracted. Failed attempts remain in the ledger, followed by successful retests. No tests, thresholds or budgets were weakened. No real invoices were used.

## Root causes

The failed Windows build used a shell-escaped path; the direct Node callback passed both Windows jobs. The specified Excel writer transitively requires Zlib, now owner-approved. Changesets required explicit root workspace membership. npm authentication and a local npm-cache permission issue were resolved by owner login and an isolated temporary cache, respectively. An offline negative-test installation failed; its online rerun and dependency rejection passed with manifests restored.

## Requirement coverage

M0 cases cover the setup portions of FR-38, FR-56, FR-60 and NFR-05, NFR-09, NFR-11, NFR-13–15, NFR-17–18. Each case maps to requirements and a TRD ID or task acceptance check in the case definitions. All designed M0 cases passed. These broader requirements remain partially verified until their parser, fixture, export, browser and release tasks are implemented. No claim is made about unimplemented acceptance criteria.

## Evidence and limitations

Local `pnpm check` passed (with a temporary npm cache for attw); three-browser smoke tests passed separately. This covers lint, typecheck, unit coverage, CLI, package tests, tooling tests, size, publint, attw, licences and docs parity. Changesets status recognizes the root package. Negative checks rejected network access, GPL and missing TSDoc. Coverage and bundle size currently measure placeholder exports. Catalogue/copy/fixture parity checks will be completed with their corresponding later implementation tasks.

[Windows correction CI](https://github.com/firatkill/efatura/actions/runs/39566277873) passed all 11 jobs. [Final T-04 CI](https://github.com/firatkill/efatura/actions/runs/39566500555) also passed, including docs, licences and tooling checks.
