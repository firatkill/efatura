import { efaturaConfig } from '@firatkill/efatura';
/** Yield bounded views of an archive, streaming Blob content.
 * @example
 * for await (const chunk of archiveChunks(blob, signal)) consume(chunk);
 */
export async function* archiveChunks(
  input: Uint8Array | Blob,
  signal?: AbortSignal,
): AsyncGenerator<Uint8Array, void, undefined> {
  const split = function* (bytes: Uint8Array) {
    for (let i = 0; i < bytes.length; i += efaturaConfig.zipPushChunkBytes)
      yield bytes.subarray(i, i + efaturaConfig.zipPushChunkBytes);
  };
  if (input instanceof Uint8Array) {
    for (const chunk of split(input)) {
      signal?.throwIfAborted();
      yield chunk;
    }
    return;
  }
  const reader = input.stream().getReader();
  let done = false;
  try {
    while (!done) {
      signal?.throwIfAborted();
      const next = await reader.read();
      signal?.throwIfAborted();
      done = next.done;
      if (!next.done) yield* split(next.value);
    }
  } finally {
    try {
      if (!done) await reader.cancel();
    } finally {
      reader.releaseLock();
    }
  }
}
