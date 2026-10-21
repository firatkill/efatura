# T-17 bundle proposal

Status: owner approved (D-74); implemented and local acceptance checks passed.

The complete issue catalogue makes the unmodified pinned dependency bundle exceed the existing budgets: full core 42.27 kB / 40 kB; parser-only 38.01 kB / 36 kB. Catalogue and targeted mapping/framework tests pass; the size gate blocks completion.

## Cause and proposed change

`fast-xml-parser` 5.11.2 imports only the HTML and XML contexts from its `is-unsafe` 2.0.2 dependency. However, that dependency assigns labels to all nine context arrays in its root module and freezes an aggregate object there. These initialization side effects retain otherwise unused SQL, shell, log and other context data in consumer bundles.

Bundle the pinned XML parser and its transitive dependencies into the published core instead of leaving `fast-xml-parser` external. During that build only, move each context's label assignment to its defining module and annotate the aggregate `Object.freeze` as pure. Keep all context patterns, predicates, labels and public parser behavior intact. Retain the existing runtime dependency allowlist and licence accounting; add no dependency, do not downgrade anything, and do not change budgets or parser/security options.

This must affect the published bundle, not just locally patched node_modules: a repository-only pnpm patch would not fix the bundle consumers receive. The build transform will assert the pinned source shape and fail on an unexpected dependency update. Package ESM/CJS tests, encoding/security/depth tests, browsers, catalogue parity, coverage and size checks must pass before committing.

## Feasibility measurement

An isolated esbuild experiment against the current source, with the same minification and Brotli measurement, reduced parser-only output from 38,032 to 34,446 bytes and full-core output from 42,263 to 38,700 bytes. These are preliminary measurements, not the final `pnpm size` acceptance result. No dependency file or production bundler configuration was changed for the experiment.

## Approval required

AGENTS.md checkpoint 2: this changes the TRD's prescribed externalization of fast-xml-parser. The owner approved the bundled-parser build and its narrow tree-shaking transform on 2026-10-21. The existing API and security behavior remain the acceptance contract.

## Published-package verification

The actual tsup output measures 38.53 kB full core and 34.35 kB parser-only. Equivalence tests compare all nine original and transformed context arrays and predicates. ESM/CJS package tests exercise XML security guards, deep nesting and byte input. All bundled dependency notices are emitted as `dist/THIRD_PARTY_LICENSES.txt`. The @nodable/entities 3.1.0 npm archive omits its licence file; the unchanged MIT notice is retained at scripts/licenses/nodable-entities.txt from [upstream commit b89ecb0](https://github.com/nodable/val-parsers/blob/b89ecb0d419969e2989b74c5304bc9b66931727e/LICENSE). No network is needed during builds.
