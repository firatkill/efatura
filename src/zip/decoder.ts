import { efaturaConfig } from '@firatkill/efatura';
import { UnzipInflate } from 'fflate';
import type { AsyncFlateStreamHandler, Unzip, UnzipFile } from 'fflate';
/** Bound synchronous output allocation and stop feeding rejected entries (D-85).
 * @example
 * unzip.register(BoundedInflate);
 */
export class BoundedInflate {
  static compression = 8;
  ondata: AsyncFlateStreamHandler = () => {
    /* Assigned by fflate before data arrives. */
  };
  private stopped = false;
  private readonly inner = new UnzipInflate();
  constructor() {
    this.inner.ondata = (error, data, final) => {
      this.ondata(error, data, final);
    };
  }
  push(chunk: Uint8Array, final: boolean): void {
    if (chunk.length === 0 && !this.stopped) this.inner.push(chunk, final);
    for (let start = 0; start < chunk.length && !this.stopped; start += efaturaConfig.zipInflateChunkBytes) {
      const end = Math.min(start + efaturaConfig.zipInflateChunkBytes, chunk.length);
      this.inner.push(chunk.subarray(start, end), final && end === chunk.length);
    }
  }
  terminate(): void {
    this.stopped = true;
  }
}
/** Drain an ignored entry through the public decoder API without retaining or inflating it.
 * @example
 * discardEntry(unzip,file);
 */
export function discardEntry(unzip: Unzip, file: UnzipFile): void {
  class Discard {
    static compression = file.compression;
    ondata: AsyncFlateStreamHandler = () => {
      /* Assigned by fflate before data arrives. */
    };
    push(): void {
      /* Intentionally discard compressed chunks. */
    }
  }
  unzip.register(Discard);
  file.ondata = () => {
    /* Assigned by fflate before data arrives. */
  };
  file.start();
}
