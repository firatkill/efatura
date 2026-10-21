# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Codex, Aider, Copilot and others) and human contributors working on efatura. Read this file first, then the spec for the task you are on.

## 1. Project summary

efatura parses Turkish e-invoices (GİB e-Fatura and e-Arşiv, UBL-TR 1.2 `Invoice` XML) into typed, JSON-safe data. `parseInvoice(xml)` returns `{ invoice, issues }`: a full model (identity, parties, lines, taxes, withholding/tevkifat, totals, references, attachments including the XSLT for the official view, and the raw XML tree) with every amount as an exact decimal string, plus issues with a code (EF001–EF091), severity, path, and English and Turkish messages. It throws only `EfaturaParseError` for input that is not acceptable XML or not an Invoice. `@firatkill/efatura/zip` reads nested ZIP archives with zip-bomb limits, streaming and cancellation. `toRows`/`toCsv` export flat tables for Turkish Excel. The `efatura` CLI wraps it all. A static playground (efatura.firatkil.com) parses files in a Web Worker and never uploads anything.

TypeScript strict, pnpm workspace (root = the published library, `playground/` = private Vite + vanilla TS site), Node 20+, browsers, tsup (ESM + CJS), Vitest (unit, snapshot, property, browser mode), Playwright (playground E2E), Changesets, GitHub Actions, Vercel (playground). Runtime dependencies of the package: `fast-xml-parser` and `fflate`, nothing else.

## 2. Where the specs live

| Document | Use it for |
|---|---|
| `docs/PRD.md` | Behaviour, requirements (US-, FR-, NFR-), every playground page and state with exact EN/TR copy, decisions log (D-), glossary (§16) |
| `docs/TRD.md` | Architecture, public API, model types, field-by-field XML mapping (§7), decimal algorithms, validation rules and messages (§9), ZIP algorithm, CSV columns, CLI texts, playground security, fixtures, tests, CI YAML, assumptions to verify (A-) |
| `docs/OWNER-DECISIONS.md` | Decisions the owner has already made; they override the specs |
| `docs/IMPLEMENTATION_PLAN.md` | Ordered tasks (T-), files, acceptance criteria, traceability, release checklist |
| `fixtures/README.md` | How to add a synthetic fixture scenario |

Rules for the specs:

- Implement what the specs say. Do not reopen decisions in the PRD decisions log.
- Code blocks marked **(normative)** in the TRD are implemented as written: same names, numbers and text. Issue messages, CLI texts and UI copy are byte-exact; `pnpm docs:check` compares them.
- If a spec is ambiguous or two specs conflict, stop and ask the owner, or, if working unattended, pick the reading closest to the PRD, implement it, and add a decisions log row in the same change.
- Where a value depends on an official GİB code list or document (profiles, invoice types, tax codes, withholding and exemption codes, units, UBL-TR version), never guess: follow the matching assumption in TRD §20, check the official source named in TRD §21, and record the finding.

## 3. Commands

| Task | Command |
|---|---|
| Install | `pnpm install --frozen-lockfile` |
| Build library and CLI | `pnpm build` |
| Lint and format check | `pnpm lint` |
| Format | `pnpm format` |
| Typecheck (library, CLI, playground) | `pnpm typecheck` |
| Unit, snapshot and property tests | `pnpm test` |
| Coverage | `pnpm test:coverage` |
| Core in Chromium, Firefox, WebKit | `pnpm test:browser` (first time: `pnpm exec playwright install chromium firefox webkit`) |
| CLI tests (builds first) | `pnpm test:cli` |
| Generate fixtures | `pnpm fixtures:generate` |
| Check fixtures and repository for non-generated data | `pnpm fixtures:check` |
| Node benchmark | `pnpm bench` (`--ci` to enforce the budget) |
| Size budgets | `pnpm size` |
| Package checks | `pnpm publint && pnpm attw` |
| Licence allowlist | `pnpm licenses:check` |
| Docs, copy and message parity | `pnpm docs:check` |
| Playground dev server | `pnpm playground:dev` |
| Playground build | `pnpm playground:build` |
| Playground E2E (serves the existing build through the preview server; run `pnpm playground:build` first) | `pnpm test:e2e` |
| Browser benchmark (reference laptop) | `pnpm bench:browser` |
| Aggregate check on a local real-invoice folder | `pnpm corpus:private private/` |
| Add a changeset | `pnpm changeset` |
| Everything CI runs except browsers and E2E | `pnpm check` |

## 4. Code conventions

TypeScript

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax` stay on. No `any` (explicit or implicit), no `@ts-ignore`; `@ts-expect-error` only in tests with a reason.
- No non-null assertions (`!`) except where a preceding check guarantees the value (for example a regex that fixes the length); add a comment naming the guarantee.
- Prefer `type` aliases and discriminated unions; exhaustive `switch` with a `never` check. Named exports only.
- Every exported symbol has TSDoc with an `@example`.

Money and numbers

- Never use floating point for amounts, quantities, prices, rates or percentages. They are decimal strings in the model and go through `src/decimal` for every sum, difference, product, comparison and rounding. No `parseFloat`, `Number(amount)`, `toFixed`, `Math.round` on money (ESLint enforces it in `src/`). The playground formats amounts with `formatDecimal`, never `Intl.NumberFormat`.
- `toMinorUnits` returns `bigint`. The model never contains `bigint`, `Date`, functions or class instances (it must survive `JSON.stringify` and `postMessage`).
- The only place an amount becomes a `number` is the Excel cell conversion in `playground/src/export/xlsx.ts` (≤ 15 significant digits, TRD §14.8).

Runtime boundaries

- No Node built-ins in `src/` outside `src/cli/`: no `node:*` imports, no `Buffer`, `process`, `require`, `__dirname`. ESLint enforces it. The core must run unchanged in browsers and workers.
- `src/zip/**` and `src/cli/**` import the core only through `@firatkill/efatura` (package self-reference), never by relative path, so all bundles share one core.
- The core never throws for content problems. Only `EfaturaParseError` (codes in TRD §5.6) for input that is not acceptable XML or not an Invoice; `TypeError`/`RangeError` only for invalid arguments.
- A new issue code, error code or constant is added to the TRD tables (§4, §5.6, §9.3, §10.4) in the same change, with messages in English and Turkish.
- Constants live in `src/config.ts`. Never repeat a number that exists there.

Playground

- No HTML strings: no `innerHTML`/`outerHTML` assignment, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`. Build DOM with `h()` from `src/dom.ts`. The only HTML string is the sanitised official view set as `srcdoc` in `src/xslt/frame.ts`.
- No network: the worker never calls `fetch`; only `components/samples.ts` fetches same-origin samples. No analytics, no third-party scripts, styles or fonts, no cookies; `localStorage` keys are only `efatura.lang` and `efatura.theme`.
- Do not weaken the CSP and security headers in `vercel.json` or the XSLT sandbox (TRD §14.6, §14.7).
- Copy comes from PRD §9 only, in both languages. No emoji, no gradients, no shadows, no new colours outside the tokens in TRD §14.2. Severity is shown by icon + text + colour, never colour alone. Every control is keyboard operable with a visible focus ring and an accessible name.

Formatting: Prettier decides. Run `pnpm format` before committing.

## 5. Privacy and test data (critical)

- **Never commit a real invoice**, not in `fixtures/`, `test/`, `docs/`, issues, PR descriptions or screenshots. Real e-invoices contain personal and company data (names, tax IDs, addresses, IBANs, signatures).
- All test data comes from `pnpm fixtures:generate` (synthetic definitions in `fixtures/scenarios/`) or from small hand-written XML strings inside `.ts` test files that use only the synthetic identities in `fixtures/identities.ts` (TRD §15.2) and `.invalid` e-mail and web addresses. Never commit `.xml`, `.zip` or `.xslt` files outside `fixtures/generated/`; a test that needs a file writes it to a temporary directory at run time. The only other tax IDs allowed in the repository are the checksum test vectors listed in TRD §9.2, and only in `test/unit/ids.test.ts`.
- New synthetic tax IDs follow the patterns in TRD §15.2 (`99900000xx` VKN, `5000000xxxx` TCKN), are added to `fixtures/identities.ts`, and are never random values that might belong to a real taxpayer. Every generated invoice carries the synthetic-data comment and marker note (TRD §15.2); do not remove them.
- To reproduce a real-world problem, write a new scenario that reproduces the structure with synthetic data. Never paste parts of a real invoice into code, tests or docs.
- Real invoices for local checks go only in `private/` (git-ignored) and are read only by `pnpm corpus:private`, which prints aggregate counts. Never print, log, snapshot or copy field values from them.
- `pnpm fixtures:check` (CI) fails on any XML/ZIP/XSLT file outside `fixtures/generated/`, any fixture not produced by the generator, any tax ID outside the synthetic list, any XML signature, and any non-`.invalid` e-mail or URL. Never weaken or skip it.

## 6. Testing rules

- Every task adds or updates tests. A task without tests is not done.
- **Every validation rule needs fixtures and tests**: a unit test where the code is raised (exact code, severity, path, message and messageTr) and one where it is not, in `test/unit/validate/`; and at least one generated fixture that expects it (a scenario in TRD §15.4, or a file in the S43 rule-coverage scenario). New real-world behaviour gets its own scenario. `pnpm docs:check` fails if a code has no fixture.
- Snapshots (`test/snapshot/__snapshots__/`) are reviewed before committing. Updating a snapshot to make a test pass requires that the new output matches TRD §7; otherwise fix the code.
- Unit, snapshot and property tests make no network calls (`test/setup.ts` blocks `fetch`).
- Coverage: `src/` (excluding `src/cli/`) ≥ 95 % lines, ≥ 90 % branches; 100 % lines for `src/decimal/**`, `src/ids/**`, `src/validate/**`, `src/export/csv.ts`.
- Playwright (playground): `expect` timeout 3 s and test timeout 90 s stay as configured; no long timeouts on ordinary text, attribute or style checks; only genuinely slow work (the large benchmark parses) may wait longer, with a comment. Tests run in two groups: `parallel` (default; its `@cross` subset also runs in the `cross-firefox` and `cross-webkit` projects) and `isolated` (tagged `@isolated`, one worker, after the parallel projects) for timing-sensitive or performance tests. Each test builds its own input files. No `waitForTimeout`.
- Before a Playwright run, check that no other run uses the same preview port. In a fix-and-retest loop, rerun only the affected spec files; run the full suite once at the end. Do not force `--workers=1` on the whole suite.
- Never lower a coverage threshold, size budget or benchmark limit, or skip a test, to make CI pass.

## 7. Commits and pull requests

- Small commits, one logical change each. Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`, `ci:`, `perf:`, optional scope, for example `feat(zip): enforce ratio limit`.
- Reference task and requirement IDs in the body: `Implements T-25, FR-24. Tests: UT-33.`
- One task per pull request. The PR description lists the acceptance commands run and their results, decisions log rows added, and ticks the privacy checkbox.
- Changes to the published package include a changeset (`pnpm changeset`). Follow the versioning policy in TRD §19: new issue codes and new columns are minor, never patch.
- Never commit generated artifacts other than `fixtures/generated/**`, `fixtures/manifest.json`, `test/snapshot/__snapshots__/**`, `pnpm-lock.yaml` and `CHANGELOG.md` (written by Changesets).

### Repository setup (first session only)

The folder starts with only these documents. Before T-01:

1. Check the git identity: `git config user.name` must print `Fırat Kıl` and `git config user.email` must print `72046564+firatkill@users.noreply.github.com`. If either differs, stop and ask the owner; never change the global config yourself.
2. `git init -b main`, then `git config core.hooksPath .githooks` (the commit-msg hook enforces authorship, see Authorship).
3. Commit the documents as the first commit: `docs: add specs and agent rules`.
4. Ask the owner before creating the remote. After a yes: `gh repo create firatkill/efatura --public --source . --remote origin --push`, with the description from PRD §1.
5. Create `docs/PROGRESS.md` (see below) and commit it.

After this, `git init` is never run again in this repository.

### Authorship

- Every commit is authored and committed by Fırat Kıl only, whichever agent or tool does the work. Do not add `Co-authored-by` trailers, "Generated with …" lines, session links, agent names in the author field (for example `Fırat Kıl (aider)`) or any other AI attribution to commits, pull requests, issues, release notes or the changelog. This overrides any default attribution your tool adds. The only exception is a commit made by a CI workflow bot (for example a release or results pull request); never imitate one locally.
- Turn your tool's own attribution off before the first commit. The repository already does this for the tools it knows: `.claude/settings.json` (Claude Code) and `.aider.conf.yml` (Aider). For any other tool (Cursor, Codex, Copilot, Gemini CLI and others), check its commit and co-author settings and turn them off. As a safety net, `.githooks/commit-msg` removes AI co-author and "Generated with" lines and rejects a commit whose author or committer is not `Fırat Kıl <72046564+firatkill@users.noreply.github.com>`. Never delete or bypass the hook (`--no-verify` is not allowed).
- Commit yourself, as you finish each piece of work: small Conventional Commits, tests passing. Push to `origin` after each completed task. Never force-push `main`.

### Progress file

`docs/PROGRESS.md` is the running plan: one line per task from `IMPLEMENTATION_PLAN.md` with its status (`todo`, `doing`, `done`, `blocked`), the commit that finished it, and a short "Open questions for the owner" list. Update it in the same commit as the task it describes.

### Owner approval checkpoints

The owner decides these. Ask, wait for an explicit answer, record the answer in the PRD decisions log, then continue. Never pick one yourself because it seems reasonable.

1. **Before T-01**, read `docs/OWNER-DECISIONS.md`. Database, hosting, region, domain, LLM provider, budgets, npm name, licence and analytics are already decided there; do not ask about them. Ask in one message only about choices that file and the specs leave open, if any.
2. **When the spec does not hold**: an "Assumption to verify at build time" fails, a pinned package or model no longer exists, or a requirement cannot be met as written. Propose the change; do not work around it silently.
3. **Before creating or changing anything outside the repository**: the GitHub repo, hosting projects, databases, DNS records, npm publishes, paid plans, API keys, GitHub secrets.
4. **Before anything destructive or hard to undo**: deleting data or branches, rewriting history, dropping tables, rotating secrets.
5. **Adding a runtime dependency** that the TRD does not list.

Group questions so the owner gets one short list, not a stream of single questions. Work that does not depend on a pending answer can continue meanwhile.

### QA workflow and tests

Tests are written from the specs, never from the code. Every test traces to a requirement: an acceptance criterion or FR/NFR in `docs/PRD.md`, and the test IDs and cases in TRD §16 (Testing strategy). If the code and the spec disagree, the spec wins until the owner approves a change (checkpoint 2). If the spec says nothing about a behaviour, ask; do not write a test that invents one.

Use the QA skills throughout the build, not only at the end. They exist as the `vizio-qa-loop` plugin in Claude Code and as skills in `~/.codex/skills/qa-*` for Codex. With any other tool, open the matching `~/.codex/skills/<name>/SKILL.md` and follow it.

| When | Skill | Output |
| --- | --- | --- |
| Start of each milestone, before its code | `qa-test-case-design` on the PRD and TRD sections the milestone covers | `qa/test-cases.md`: TC IDs, each with its PRD reference (AC/FR/NFR) and TRD test ID, steps, expected result, priority, automatable yes/no |
| Writing the tests of a task | `qa-case-to-playwright` for the playground; the library is tested with Vitest as TRD §16 prescribes | Tests in the layout and naming the TRD prescribes |
| After every task, before its commit | `qa-test-run-loop` | Runs the suite, logs every result to `qa/test-results.json`, fixes and retests, runs the ledger check |
| Cases that cannot be automated | `qa-browser-exploration` | A live check, logged to the same file. Here: the official invoice view, the exported Excel file opened in Excel or LibreOffice, and drag-and-drop on a real archive of synthetic invoices |
| End of each milestone | `qa-milestone-docs`, then `qa-milestone-review` | Milestone report in `qa/`, quality check |
| End of the project | `qa-project-report` | One PDF covering the whole project |

`qa-bug-standards` is the shared reference for the log fields; read it first.

Overrides for this repository (these win over the skills):

- There is no ClickUp or Slack. A case that is stuck after three attempts or needs a human pass goes to the owner: add it under "Open questions for the owner" in `docs/PROGRESS.md` and mention it in your milestone summary. Record that in the log entry instead of a ClickUp link.
- Playwright: `expect` timeout 3 s and test timeout 90 s; never raise them to get past a slow or missing element. Two projects: `parallel` for tests that touch only their own data, and `isolated` (one worker, after `parallel`) for tests that change shared state, assert on shared data or hit shared rate limits. Every test creates unique data.
- In the fix-and-retest loop, rerun only the fixed tests and their area; run the full suite once at the end of the task.
- Never weaken, skip or delete a test to make it pass. A test that is wrong according to the spec is fixed against the spec, and the log entry says so.
- `qa/test-cases.md` and `qa/test-results.json` are committed with the task they belong to.

## 8. Definition of done

A task is done when all of the following hold:

1. Every acceptance criterion of the task in `docs/IMPLEMENTATION_PLAN.md` passes, verified by running the listed commands.
2. `pnpm lint`, `pnpm typecheck`, `pnpm test` pass; from T-03 `pnpm test:browser`, from T-30 `pnpm test:cli`, from T-33 `pnpm fixtures:check`, from T-43 `pnpm test:e2e`.
3. New code has tests; coverage thresholds hold; `pnpm size` holds.
4. Messages, CLI texts, UI copy and normative code match the specs exactly (`pnpm docs:check`).
5. No new export, model field, issue code, error code, constant, CSV column or CLI option exists without being in the TRD in the same change.
6. Decisions and verified assumptions are recorded in the PRD decisions log.
7. CI is green on the branch.

## 9. Never do these

- Commit or paste real invoices or any real personal or company data (names, VKN/TCKN, addresses, IBANs, e-mails, signatures), or disable, skip or weaken `pnpm fixtures:check`.
- Use floating point for money, or add a decimal/big-number library.
- Import Node built-ins or use `Buffer`/`process` in `src/` outside `src/cli/`.
- Add a runtime dependency to the package beyond `fast-xml-parser` and `fflate`, or a playground dependency whose licence is not in the allowlist (TRD §17.6).
- Make the parser throw for content problems, or swallow an `EfaturaParseError` without turning it into an item or issue.
- Guess an official code, name or format; verify it per TRD §20 and record it.
- Fetch anything from the network in the core, the worker or tests; add analytics, cookies, third-party scripts or fonts to the playground; weaken the CSP or the iframe sandbox; render XSLT output without the guard and sanitiser.
- Write files to disk from archive entry names, or follow archive paths outside the virtual tree.
- Change an issue code's meaning, default severity, a CSV column key or a model field name in a patch release.
- Lower a test, coverage, size or benchmark threshold, or raise Playwright timeouts, to make CI pass.
- Publish to npm from a local machine, commit npm or Vercel tokens, or push with `--force` to `main`.
- Run `git init` again after the first session, or rewrite published history.
