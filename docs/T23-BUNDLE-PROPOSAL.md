# T-23 parser path specialization proposal

Status: owner approved continuation (D-84); guarded production transform and local acceptance checks complete.

T-23's batch API raises the full core to 41.04 kB (40 kB limit); parser-only remains 35.91 kB (36 kB limit). Enabling build minification did not help and was reverted. No budget, dependency version, runtime API or security check is proposed to change.

## Proposed change

Extend D-79's fixed-option specialization for fast-xml-parser 5.11.2. The package does not configure stop-node expressions or custom path-aware callbacks. Replace the general path-expression matcher in OrderedObjParser with a private tag stack that preserves push/pop/reset, current-tag lookup and dot-separated paths. Remove the empty stop-expression setup and return false for stop-node matching. Attribute and namespace matching state is unused with these fixed options; XML namespace processing in the package remains unchanged.

Keep the existing HTML/XML entity safety checks, EntityDecoder, prototype-pollution guards, XML input guards and parser modes. Do not modify installed dependencies or expose this specialized parser to callers.

Before adoption, strengthen the build guards to require:

- The pinned parser version and exact OrderedObjParser.js, XMLParser.js and OptionsBuilder.js source hashes, including the default callbacks/options.
- No stop-node expressions, custom tag/attribute value processors, updateTag callback, custom entity decoder, or path-aware attribute-ignore callback.
- Existing fixed options plus ignoreAttributes false and processEntities false; reject drift before publishing.
- Exact expected transform replacement sites, with tests that source/option drift is rejected.

## Isolated experiment

With the T-23 implementation, the prototype measured 39.03 kB full core and 33.80 kB parser-only. Both unchanged budgets pass. ZIP is still the pre-T-25 placeholder and its 10 B result does not verify the future ZIP reader budget.

The experiment's two original-versus-specialized parser tests passed. Four of five actual built-package tests passed, including ESM/CJS parsing, security, depth and encoding. The fifth failed because its fixed expected licence list still includes path-expression-matcher, which the prototype no longer bundles; update that expectation against the actual bundle source map if this proposal is approved. These findings are recorded in the T-23 QA ledger. These existing equivalence vectors are preliminary, not a complete proof. Before the task can be committed, add explicit equivalence cases for deep nesting, repeated siblings, namespaces, attributes, self-closing tags, comments, CDATA, processing instructions, malformed inputs and dangerous property names; then run full coverage, browser, package and size gates.

The prototype was restored before requesting approval. Following D-84, the production transform includes source/default/option guards and expanded equivalence coverage; task completion depends on all required gates.

Production validation: full core 39.12 kB, parser-only 33.81 kB; all 267 unit tests, 15 browser tests, package/licence/source-map checks and required local gates pass. Both parsers retain 10000 levels in separate tests with the unchanged timeout.
