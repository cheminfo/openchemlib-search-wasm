import type { Agreement } from '../agreement.ts';
import { duration, integer, percent, rate, ratio } from '../format.ts';
import type { Engine } from '../protocol.ts';
import type { EngineState, RunConfig } from '../runState.ts';
import { SIMILARITY_HIT_THRESHOLD } from '../runState.ts';

const NAMES: Record<Engine, string> = {
  wasm: 'openchemlib-search-wasm',
  gwt: 'openchemlib-js',
};

interface StatsProps {
  engines: EngineState[];
  config: RunConfig | null;
  agreement: Agreement | null;
  error: string | null;
}

/**
 * The live figures: one column per engine, the speedup between them, and whether they agreed on
 * every molecule.
 * @param props - The run's state.
 * @param props.engines - One entry per engine in the run.
 * @param props.config - What the run was asked to do.
 * @param props.agreement - Whether the two engines computed the same answer, once both are done.
 * @param props.error - What stopped the run, if anything did.
 * @returns The stats table.
 */
export function Stats({ engines, config, agreement, error }: StatsProps) {
  if (engines.length === 0) {
    return (
      <section className="panel">
        <p className="muted">No run yet.</p>
      </section>
    );
  }
  const limit = config?.limit ?? 0;
  const hitLabel =
    config?.mode === 'similarity'
      ? `≥ ${SIMILARITY_HIT_THRESHOLD.toFixed(2)}`
      : 'matches';

  return (
    <section className="panel">
      <table className="stats">
        <thead>
          <tr>
            <th />
            {engines.map((engine) => (
              <th key={engine.engine}>
                {NAMES[engine.engine]}{' '}
                <span className="muted">{engine.status}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row
            label="processed"
            engines={engines}
            read={(engine) =>
              `${integer(engine.processed)} / ${integer(limit)}`
            }
          />
          <Row
            label={hitLabel}
            engines={engines}
            read={(engine) => integer(engine.matched)}
          />
          <Row
            label="unparsable"
            engines={engines}
            read={(engine) => integer(engine.unparsable)}
          />
          <Row
            label="elapsed"
            engines={engines}
            read={(engine) => duration(engine.elapsedMs)}
          />
          <Row
            label="throughput"
            engines={engines}
            read={(engine) => rate(engine.processed, engine.elapsedMs)}
          />
          <Row
            label="startup (spawn + load)"
            engines={engines}
            read={(engine) => duration(engine.startupMs)}
          />
          <Row
            label="worker imbalance"
            engines={engines}
            read={(engine) => ratio(engine.imbalance)}
          />
          <Row
            label="decode / scan per worker"
            engines={engines}
            read={(engine) =>
              `${duration(engine.decodeMs)} / ${duration(engine.scanMs)}`
            }
          />
        </tbody>
      </table>
      <Speedup engines={engines} />
      <div className="bars">
        {engines.map((engine) => (
          <div key={engine.engine} className="bar">
            <span className="label">{NAMES[engine.engine]}</span>
            <progress value={engine.processed} max={Math.max(limit, 1)} />
            <span className="muted">{percent(engine.processed, limit)}</span>
          </div>
        ))}
      </div>
      <AgreementLine agreement={agreement} engines={engines} />
      {error === null ? null : <p className="error">{error}</p>}
      {engines.map((engine) =>
        engine.error === null ? null : (
          <p key={engine.engine} className="error">
            {NAMES[engine.engine]}: {engine.error}
          </p>
        ),
      )}
    </section>
  );
}

function Speedup({ engines }: { engines: EngineState[] }) {
  const wasm = engines.find((engine) => engine.engine === 'wasm');
  const gwt = engines.find((engine) => engine.engine === 'gwt');
  if (!wasm || !gwt || wasm.status !== 'done' || gwt.status !== 'done') {
    return null;
  }
  return (
    <p className="speedup">
      openchemlib-search-wasm scanned{' '}
      <strong>{ratio(gwt.elapsedMs / wasm.elapsedMs)}</strong> faster — same
      corpus, same worker count, same split.
    </p>
  );
}

function AgreementLine({
  agreement,
  engines,
}: {
  agreement: Agreement | null;
  engines: EngineState[];
}) {
  if (!agreement || engines.length < 2) return null;
  if (agreement.disagreements === 0) {
    return (
      <p className="agree">
        Both engines agreed on all {integer(agreement.compared)} molecules
        {agreement.maxDelta > 0
          ? ` (largest difference ${agreement.maxDelta.toExponential(2)})`
          : ''}
        .
      </p>
    );
  }
  return (
    <div className="error">
      <p>
        {integer(agreement.disagreements)} of {integer(agreement.compared)}{' '}
        molecules disagree. First few:
      </p>
      <ul>
        {agreement.samples.map((sample) => (
          <li key={sample.index}>
            #{integer(sample.index)}: wasm {sample.wasm}, js {sample.gwt}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RowProps {
  label: string;
  engines: EngineState[];
  read: (engine: EngineState) => string;
}

function Row({ label, engines, read }: RowProps) {
  return (
    <tr>
      <th>{label}</th>
      {engines.map((engine) => (
        <td key={engine.engine}>{read(engine)}</td>
      ))}
    </tr>
  );
}
