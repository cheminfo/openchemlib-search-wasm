import { checkQuery, scanRange } from './scan.ts';
import type { ResultBuffer, SearchMode, SearchStep } from './types.ts';

/**
 * How many entries one step covers when the caller asked to hear about the scan but did not say how
 * often. Sized from the measured cost of a molecule — ~22 µs to match a fragment, ~947 µs to build
 * a fingerprint — so a step lands near 100 ms either way.
 */
const DEFAULT_STEP = { substructure: 4096, similarity: 128 };

/** What a mode does with the entries a step just wrote. */
export interface StepTally {
  /** Matches counted so far. */
  matched: number;
  /** Idcodes that could not be parsed. */
  unparsable: number;
}

export interface RunSearchParams {
  mode: SearchMode;
  idCodeQuery: string;
  idCodes: string[];
  /** The buffer the scan fills, already reset to the mode's "not yet" value. */
  result: ResultBuffer;
  /** Updated as the scan goes, and read back into the returned counts. */
  tally: StepTally;
  /**
   * Tallies `result[from .. to)` into `tally`, collecting whatever the mode collects.
   * @returns True when the scan has everything it was asked for and should stop.
   */
  collectRange: (from: number, to: number) => boolean;
  stepSize: number | undefined;
  onStep: ((step: SearchStep) => boolean | void) | undefined;
  /** True when the mode can stop before the end, so the scan must be cut into steps. */
  stoppable: boolean;
}

/**
 * Drives a scan, one step at a time, and reports it.
 *
 * A step is a single call into WebAssembly over a range of the array. Cutting the scan up is free —
 * 800 chunked calls measure the same as one call over the whole corpus — so the only reason to do
 * it is to hear about the scan or to stop it, and a search that wants neither runs as one call.
 * @param params - The mode, the query, the buffer to fill and what to do with each step.
 * @returns How far the scan got, how long it took and whether it stopped early.
 */
export function runSearch(params: RunSearchParams): {
  processed: number;
  elapsed: number;
  stopped: boolean;
} {
  const {
    mode,
    idCodeQuery,
    idCodes,
    result,
    tally,
    collectRange,
    onStep,
    stepSize,
    stoppable,
  } = params;

  checkQuery(mode, idCodeQuery);

  const total = idCodes.length;
  const stepped = onStep !== undefined || stoppable;
  const step = Math.max(1, stepSize ?? (stepped ? DEFAULT_STEP[mode] : total));

  const started = performance.now();
  let processed = 0;
  let stopped = false;

  while (processed < total) {
    const to = Math.min(processed + step, total);
    scanRange(mode, idCodeQuery, idCodes, result, processed, to);
    const enough = collectRange(processed, to);
    processed = to;

    if (enough) {
      stopped = processed < total;
      break;
    }
    const goOn = onStep?.({
      result,
      processed,
      total,
      matched: tally.matched,
      unparsable: tally.unparsable,
      elapsed: performance.now() - started,
    });
    if (goOn === false) {
      stopped = processed < total;
      break;
    }
  }

  return { processed, elapsed: performance.now() - started, stopped };
}
