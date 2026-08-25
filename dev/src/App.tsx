import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EngineChoice } from './components/Controls.tsx';
import { Controls } from './components/Controls.tsx';
import { Hits } from './components/Hits.tsx';
import { QueryBar } from './components/QueryBar.tsx';
import { Stats } from './components/Stats.tsx';
import type { Corpus } from './corpus.ts';
import { DatasetMissingError, loadCorpus } from './corpus.ts';
import { integer } from './format.ts';
import type { Engine, Mode, Split } from './protocol.ts';
import type { QueryKind } from './queries.ts';
import { toIdCode } from './queries.ts';
import type { RunState } from './runState.ts';
import { emptyRunState } from './runState.ts';
import { ScanRunner } from './runner.ts';
import { corpusSizes, defaultLimit, defaultWorkers } from './settings.ts';

const CORPUS_URL = '/idcodes.txt';

/**
 * The whole page: load the corpus once, configure a run, start it, and render what the workers
 * write into the shared buffers.
 * @returns The dev app.
 */
export function App() {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<RunState>(emptyRunState);
  const runner = useRef<ScanRunner | null>(null);

  const [text, setText] = useState('c1ccccc1');
  const [kind, setKind] = useState<QueryKind>('smiles');
  const [mode, setMode] = useState<Mode>('substructure');
  const [choice, setChoice] = useState<EngineChoice>('wasm');
  const [workers, setWorkers] = useState(defaultWorkers);
  const [chunkSize, setChunkSize] = useState(1024);
  const [split, setSplit] = useState<Split>('characters');
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    if (!globalThis.crossOriginIsolated) return;
    loadCorpus(CORPUS_URL).then(
      (loaded) => {
        setCorpus(loaded);
        setLimit(defaultLimit(loaded.count, 'substructure'));
      },
      (error: unknown) => {
        setLoadError(
          error instanceof DatasetMissingError
            ? error.message
            : `could not load ${CORPUS_URL}: ${String(error)}`,
        );
      },
    );
  }, []);

  useEffect(() => {
    if (!corpus) return undefined;
    const created = new ScanRunner(corpus, setState);
    runner.current = created;
    return () => {
      created.cancel();
      runner.current = null;
    };
  }, [corpus]);

  const query = useMemo(() => toIdCode(text, kind), [text, kind]);

  const onMode = useCallback(
    (next: Mode) => {
      setMode(next);
      if (corpus) setLimit(defaultLimit(corpus.count, next));
    },
    [corpus],
  );

  const run = useCallback(() => {
    const engines: Engine[] = choice === 'ab' ? ['wasm', 'gwt'] : [choice];
    void runner.current?.run({
      mode,
      query: query.idCode,
      engines,
      workers,
      chunkSize,
      split,
      limit,
    });
  }, [choice, mode, query.idCode, workers, chunkSize, split, limit]);

  const cancel = useCallback(() => {
    runner.current?.cancel();
  }, []);

  if (!globalThis.crossOriginIsolated) {
    return (
      <Shell>
        <p className="error">
          This page is not cross-origin isolated, so SharedArrayBuffer is
          unavailable. The dev server must send Cross-Origin-Opener-Policy:
          same-origin and Cross-Origin-Embedder-Policy: require-corp.
        </p>
      </Shell>
    );
  }

  if (loadError !== null) {
    return (
      <Shell>
        <p className="error">{loadError}</p>
      </Shell>
    );
  }

  if (!corpus) {
    return (
      <Shell>
        <p className="muted">Loading the corpus…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="muted">
        {integer(corpus.count)} idcodes · {integer(corpus.characters)}{' '}
        characters · shared with every worker, zero copies
      </p>
      <QueryBar
        text={text}
        kind={kind}
        idCode={query.idCode}
        error={query.error}
        disabled={state.running}
        onText={setText}
        onKind={setKind}
      />
      <Controls
        mode={mode}
        choice={choice}
        workers={workers}
        chunkSize={chunkSize}
        split={split}
        limit={limit}
        count={corpus.count}
        sizes={corpusSizes(corpus.count)}
        running={state.running}
        canRun={query.idCode.length > 0}
        onMode={onMode}
        onChoice={setChoice}
        onWorkers={setWorkers}
        onChunkSize={setChunkSize}
        onSplit={setSplit}
        onLimit={setLimit}
        onRun={run}
        onCancel={cancel}
      />
      <Stats
        engines={state.engines}
        config={state.config}
        agreement={state.agreement}
        error={state.error}
      />
      <Hits
        corpus={corpus}
        hits={state.hits}
        matched={state.engines[0]?.matched ?? 0}
      />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main>
      <h1>openchemlib-search-wasm</h1>
      {children}
    </main>
  );
}
