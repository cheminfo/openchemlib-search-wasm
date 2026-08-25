import { integer } from '../format.ts';
import type { Mode, Split } from '../protocol.ts';

/** What the machine reports, for the "you left yourself no core" warning below. */
const cores = Math.max(1, globalThis.navigator?.hardwareConcurrency ?? 4);

/** Which engines a run compares. */
export type EngineChoice = 'wasm' | 'gwt' | 'ab';

interface ControlsProps {
  mode: Mode;
  choice: EngineChoice;
  workers: number;
  chunkSize: number;
  split: Split;
  limit: number;
  count: number;
  sizes: number[];
  running: boolean;
  canRun: boolean;
  onMode: (mode: Mode) => void;
  onChoice: (choice: EngineChoice) => void;
  onWorkers: (workers: number) => void;
  onChunkSize: (chunkSize: number) => void;
  onSplit: (split: Split) => void;
  onLimit: (limit: number) => void;
  onRun: () => void;
  onCancel: () => void;
}

const SPLITS: Array<{ value: Split; label: string }> = [
  { value: 'characters', label: 'characters (balanced)' },
  { value: 'rows', label: 'rows (naive)' },
  { value: 'stealing', label: 'shared cursor' },
];

const CHUNKS = [256, 1024, 4096, 16384];

const MIN_WORKERS = 1;
const MAX_WORKERS = 16;

// A number input reports '' while it is being cleared and enforces neither `min` nor `max`, so an
// unclamped value would start a run with no workers: every range would be empty, the pass would
// finish in microseconds and the page would report a scan that never happened.
function clampWorkers(value: number): number {
  if (!Number.isFinite(value)) return MIN_WORKERS;
  return Math.min(MAX_WORKERS, Math.max(MIN_WORKERS, Math.round(value)));
}

/**
 * Everything that decides what a run does: mode, engines, worker count, chunk size, split and how
 * much of the corpus to scan.
 * @param props - The current configuration and its change handlers.
 * @returns The control row.
 */
export function Controls(props: ControlsProps) {
  const {
    mode,
    choice,
    workers,
    chunkSize,
    split,
    limit,
    count,
    sizes,
    running,
    canRun,
    onMode,
    onChoice,
    onWorkers,
    onChunkSize,
    onSplit,
    onLimit,
    onRun,
    onCancel,
  } = props;
  return (
    <section className="panel">
      <div className="row">
        <Select
          label="mode"
          value={mode}
          options={[
            { value: 'substructure', label: 'substructure' },
            { value: 'similarity', label: 'similarity' },
          ]}
          onChange={(value) => {
            onMode(value as Mode);
          }}
        />
        <Select
          label="engine"
          value={choice}
          options={[
            { value: 'wasm', label: 'openchemlib-wasm' },
            { value: 'gwt', label: 'openchemlib-js' },
            { value: 'ab', label: 'A/B — both, in turn' },
          ]}
          onChange={(value) => {
            onChoice(value as EngineChoice);
          }}
        />
        <label className="field">
          <span>workers</span>
          <input
            type="number"
            min={MIN_WORKERS}
            max={MAX_WORKERS}
            value={workers}
            onChange={(event) => {
              onWorkers(clampWorkers(Number(event.target.value)));
            }}
          />
        </label>
        <Select
          label="chunk"
          value={String(chunkSize)}
          options={CHUNKS.map((size) => ({
            value: String(size),
            label: integer(size),
          }))}
          onChange={(value) => {
            onChunkSize(Number(value));
          }}
        />
        <Select
          label="split"
          value={split}
          options={SPLITS}
          onChange={(value) => {
            onSplit(value as Split);
          }}
        />
        <Select
          label="corpus"
          value={String(limit)}
          options={sizes.map((size) => ({
            value: String(size),
            label: size === count ? `all (${integer(size)})` : integer(size),
          }))}
          onChange={(value) => {
            onLimit(Number(value));
          }}
        />
        <button
          type="button"
          className="primary"
          disabled={running || !canRun}
          onClick={onRun}
        >
          run
        </button>
        <button type="button" disabled={!running} onClick={onCancel}>
          cancel
        </button>
      </div>
      {mode === 'similarity' ? (
        <p className="warning">
          Similarity builds a 512-bit FragFp for every molecule: about 0.95 ms
          each, so the whole corpus is roughly 6.5 minutes of CPU per core. Scan
          a slice.
        </p>
      ) : null}
      {workers >= cores ? (
        <p className="warning">
          {workers} workers on {cores} cores leaves none for this page. The
          progress display stops updating, and a browser already under load can
          kill the tab. Use {Math.max(1, cores - 1)} or fewer.
        </p>
      ) : null}
    </section>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
