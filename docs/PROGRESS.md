# Progress

## Repository setup

- Read AGENTS.md and all four specification documents from start to finish.
- Git identity verified; initialized main and enabled the executable authorship hook.
- Initial documents committed in baec5f6.
- Hook checks passed: owner accepted, other author/committer rejected, attribution removed.
- Codex configuration has no attribution override; commits use explicit messages through git and the repository hook.
- GitHub creation and the initial push await owner approval.
- No implementation task or milestone is complete.

## Tasks

The finishing commit is recorded when a task is completed. In its own completion commit, `HEAD` identifies that commit; later updates replace it with the hash.

| Task | Description | Status | Finishing commit |
| --- | --- | --- | --- |
| T-01 | Scaffold the repository and tooling | todo | — |
| T-02 | Build, exports map and package checks | todo | — |
| T-03 | Test runners and CI test jobs | todo | — |
| T-04 | Changesets, licence check, docs check, templates | todo | — |
| T-05 | Configuration, errors and internal helpers | todo | — |
| T-06 | Decimal module and minor units | todo | — |
| T-07 | Input decoding and guard | todo | — |
| T-08 | Namespace-resolved XML tree, query, select and paths | todo | — |
| T-09 | Public model types and value conventions | todo | — |
| T-10 | Code lists and their verification | todo | — |
| T-11 | Identity, references, exchange rate and due date mapping | todo | — |
| T-12 | Party mapping | todo | — |
| T-13 | Line, item, price, delivery and allowance mapping | todo | — |
| T-14 | Taxes, withholding, totals, payment and computed totals | todo | — |
| T-15 | Attachments and base64 | todo | — |
| T-16 | `parseInvoice` orchestration | todo | — |
| T-17 | Issue framework, catalogue and messages | todo | — |
| T-18 | Identifier algorithms | todo | — |
| T-19 | Identity and party rules (EF001–EF017) | todo | — |
| T-20 | Currency and amount rules (EF020–EF035) | todo | — |
| T-21 | Totals rules (EF040–EF049) | todo | — |
| T-22 | Line and tax rules (EF050–EF066) | todo | — |
| T-23 | Batch API: `iterateMany`, `parseMany`, duplicates, progress, abort | todo | — |
| T-24 | ZIP helpers: classification, junk, limits, errors | todo | — |
| T-25 | Streaming ZIP reader and `iterateAny` | todo | — |
| T-26 | Rows | todo | — |
| T-27 | CSV | todo | — |
| T-28 | CLI arguments, inputs and glob | todo | — |
| T-29 | CLI outputs, summary, progress, exit codes and texts | todo | — |
| T-30 | CLI tests | todo | — |
| T-31 | Fixture builder, identities and XSLT texts | todo | — |
| T-32 | Scenarios, generation and manifest | todo | — |
| T-33 | Fixture check in CI | todo | — |
| T-34 | Snapshot tests | todo | — |
| T-35 | Property and fuzz tests | todo | — |
| T-36 | Browser tests and benchmark | todo | — |
| T-37 | Playground scaffold, design tokens, fonts, theme, i18n, layout | todo | — |
| T-38 | Headers, CSP, build guards and samples | todo | — |
| T-39 | Worker, client, dropzone, processing and cancel | todo | — |
| T-40 | Results view: tables, cards, filters, sort, pagination, issues | todo | — |
| T-41 | Detail view and official view | todo | — |
| T-42 | Exports in the playground and third-party licences | todo | — |
| T-43 | Playground E2E, accessibility, responsiveness and privacy tests | todo | — |
| T-44 | READMEs, release workflow and playground deploy | todo | — |
| T-45 | Real-world check and release 0.1.0 | todo | — |

## Open questions for the owner

- Approve creation of the public GitHub repository `firatkill/efatura` and the initial push.

## Verification limits

- Application tests, formatting command and CI do not exist yet; T-01–T-04 establish them.
- External service setup and assumption checks remain assigned to their implementation tasks.
