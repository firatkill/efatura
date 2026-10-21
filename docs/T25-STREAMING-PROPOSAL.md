# T-25 bounded streaming proposal

Status: owner approved D-85; implemented with passing unit, memory and browser checks. Final package gates and CI are tracked in docs/PROGRESS.md.

## Verified A-14 behavior

Read the installed fflate 0.8.3 README, declarations and implementation, and the pinned upstream [source](https://github.com/101arrowz/fflate/blob/v0.8.3/src/index.ts) and [README](https://github.com/101arrowz/fflate/blob/v0.8.3/README.md). Synchronous onfile/ondata, absent sizes for descriptor entries, no synchronous inflater termination, and absent exposed encryption flags agree with the TRD. Central-directory encryption detection remains necessary.

Two implementation assumptions do not hold:

1. On the required synthetic 20 MiB spaces archive, one UnzipInflate push expands the entire entry before the ratio callback can reject it. A fresh Node process with explicit GC before measurement observed 87,941,824 bytes of arrayBuffers growth, above the unchanged 30 MiB limit. The archive is only 20,592 bytes compressed. Post-output limits cannot prevent this allocation.
2. An entry left unstarted is buffered for deferred extraction, not discarded. An independent public-API spike successfully extracts a 4,096-byte entry by calling start only after the whole archive has been pushed. Thus the TRD comment “not started → skipped by fflate” does not preserve the intended streaming memory behavior.

## Proposed reconciliation

Keep the pinned fflate dependency and its public Unzip/register APIs, encryption pre-read, all limits, error codes and messages. Add no dependency and do not patch fflate internals.

- Register a private synchronous decoder that wraps UnzipInflate and feeds it at most 1,024 compressed bytes per inner push. Add ZIP_INFLATE_CHUNK_BYTES = 1024 in src/config.ts and expose zipInflateChunkBytes through efaturaConfig, preserving the package self-reference boundary. The outer ZIP_PUSH_CHUNK_BYTES remains 1 MiB, and the unknown-size ratio denominator still uses the full outer push bounds.
- Give this wrapper a real terminate flag. After rejection, stop feeding its remaining compressed bytes; totalBytes counts output actually produced, including the chunk that triggered rejection. Rejected bytes are discarded. No subsequent output is produced for that entry; later entries remain processable.
- For junk, filtered, unsupported, encrypted or pre-rejected entries, register/start a no-output discard decoder for that entry's compression method. This drains compressed bytes without retaining them and without decompression, using only the public decoder registration API. Restore the supported decoder for each accepted entry before start.

## Isolated prototype

The bounded synchronous decoder rejected the same 20 MiB bomb after producing 2,085,931 bytes. Measured arrayBuffers growth was 8,706,666 bytes, below the unchanged 30 MiB limit. This prototype is outside production source; it demonstrates feasibility, not completion of T-25.

Before commit, test stored/deflated and descriptor archives, both encryption headers, unsupported methods, every limit, nested archives, skipped-entry draining, one error per rejected entry, continuation after rejection, Blob streams, cancellation, progress, shared duplicates and the original 20 MiB memory acceptance. Retain the normal 3 MiB descriptor-entry case inside one outer push, checking that inner subdivision never shrinks its ratio denominator. Run all package, coverage, browser and size gates.

## Production verification

The independent fresh-process test loads the source through tsx (no pre-existing build required), measures arrayBuffers during inflater callbacks, and asserts growth below 30 MiB for the 20 MiB spaces archive. A separate 3 MiB valid XML descriptor entry is asserted to fit inside one outer 1 MiB push and parses without a ratio error. Tests also verify exactly one rejection, continuation to later entries, and preserving completed queue items before a count-limit stop.
