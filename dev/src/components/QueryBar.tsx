import type { Preset, QueryKind } from '../queries.ts';
import { PRESETS } from '../queries.ts';

interface QueryBarProps {
  text: string;
  kind: QueryKind;
  idCode: string;
  error: string | null;
  disabled: boolean;
  onText: (text: string) => void;
  onKind: (kind: QueryKind) => void;
}

/**
 * The query field: SMILES or a raw idcode, the six benchmark presets, and the idcode that will
 * actually be sent to the workers.
 * @param props - The field's value, how to read it, and the change handlers.
 * @returns The query bar.
 */
export function QueryBar(props: QueryBarProps) {
  const { text, kind, idCode, error, disabled, onText, onKind } = props;
  return (
    <section className="panel">
      <div className="row">
        <label className="field">
          <span>query</span>
          <input
            value={text}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            size={34}
            placeholder={kind === 'smiles' ? 'c1ccccc1' : 'gFp@DiTt@@B'}
            onChange={(event) => {
              onText(event.target.value);
            }}
          />
        </label>
        <div className="segmented">
          {(['smiles', 'idcode'] as QueryKind[]).map((option) => (
            <button
              key={option}
              type="button"
              className={option === kind ? 'active' : ''}
              onClick={() => {
                onKind(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <span className="idcode" title="the idcode sent to every worker">
          {idCode || '—'}
        </span>
      </div>
      <div className="row presets">
        <span className="label">presets</span>
        {PRESETS.map((preset: Preset) => (
          <button
            key={preset.name}
            type="button"
            disabled={disabled}
            title={
              preset.hits ? `${preset.smiles} — ${preset.hits}` : preset.smiles
            }
            onClick={() => {
              onKind('smiles');
              onText(preset.smiles);
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>
      {error === null ? null : <p className="error">{error}</p>}
    </section>
  );
}
