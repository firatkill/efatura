# T-20 parser build specialization proposal

Status: approved by the owner under AGENTS.md checkpoint 2 and recorded as D-79. Implementation extends D-74 with guarded fixed-option specialization.

T-20 currency validation exceeds the unchanged published budgets: full core 40.64 kB / 40 kB; parser-only 36.31 kB / 36 kB. Active-currency membership is already separated from display labels, with an equality test against the complete verified table.

The pinned XML parser retains three features that efatura's normative options disable: automatic numeric/boolean conversion (`parseTagValue: false`, `parseAttributeValue: false`), HTML named-entity tables (`htmlEntities: false`) and conversion of its ordered tree to its alternative object format (`preserveOrder: true`).

Proposed build-only transform of fast-xml-parser 5.11.2:

1. Preserve the existing false branch of its value conversion function, removing the unreachable coercion branch and its strnum/anynum imports.
2. Remove the unreachable HTML named-entity-table selection branch and its two table imports. Keep the XML entity table, EntityDecoder, all HTML/XML safety predicates and entity guards unchanged.
3. Return the ordered tree directly, removing the unreachable node2json conversion and import.
4. Fail the build if the pinned source shape/version or normative options change; retain runtime guards against unexpectedly enabling these disabled modes. No new dependency, version change, public API change or size-budget increase.

An isolated esbuild experiment with the current T-20 source measured parser-only 34,465 bytes and full core 38,871 bytes, compared with 36,458 and 40,758 bytes using only D-74. These are feasibility measurements, not final tsup/size-limit acceptance results. No node_modules or production build transform was modified by the experiment.

Before completion: compare original and transformed parser outputs under the normative options on synthetic text/attribute/number/entity/CDATA/namespace inputs, test build guards, and rerun unit coverage, browser tests, real ESM/CJS package security tests, licences, docs parity and actual published-package size checks. Preserve all thresholds and tests.
