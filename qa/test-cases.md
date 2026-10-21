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
