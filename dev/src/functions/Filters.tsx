import { integer } from '../format.ts';

import type { Dictionary, Tier } from './dictionary.ts';
import type { Filter } from './filter.ts';

interface FiltersProps {
  dictionary: Dictionary;
  filter: Filter;
  /** The flags among the keys of the selected tier, with how many keys carry each. */
  flags: Array<[string, number]>;
  onFilter: (filter: Filter) => void;
}

const TIERS: Array<{ value: Tier | 'all'; label: string }> = [
  { value: 'stored', label: 'stored' },
  { value: 'existing plane', label: 'existing plane' },
  { value: 'on-demand', label: 'on demand' },
  { value: 'all', label: 'all' },
];

/**
 * The text search, the tier and the flag the list is narrowed to.
 * @param props - The dictionary, the filter in force and its change handler.
 * @returns The filter bar.
 */
export function Filters(props: FiltersProps) {
  const { dictionary, filter, flags, onFilter } = props;
  const { summary } = dictionary;
  const tierCount: Record<string, number> = {
    stored: summary.stored,
    'existing plane': summary.existingPlane,
    'on-demand': summary.onDemand,
    all: summary.stored + summary.existingPlane + summary.onDemand,
  };
  return (
    <section className="panel">
      <div className="row">
        <label className="field">
          <span>name, synonym, id or SMARTS</span>
          <input
            value={filter.text}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            size={30}
            placeholder="thioether"
            onChange={(event) => {
              onFilter({ ...filter, text: event.target.value, open: '' });
            }}
          />
        </label>
        <div className="segmented">
          {TIERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={value === filter.tier ? 'active' : ''}
              onClick={() => {
                onFilter({ ...filter, tier: value, flag: '', open: '' });
              }}
            >
              {label} {integer(tierCount[value] ?? 0)}
            </button>
          ))}
        </div>
        <label className="field">
          <span>flag</span>
          <select
            value={filter.flag}
            onChange={(event) => {
              onFilter({ ...filter, flag: event.target.value, open: '' });
            }}
          >
            <option value="">any key</option>
            <option value="any">with any flag</option>
            {flags.map(([flag, count]) => (
              <option key={flag} value={flag}>
                {flag} ({integer(count)})
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

interface CategoryNavProps {
  dictionary: Dictionary;
  /** How many of the filtered keys fall in each category. */
  counts: Map<string, number>;
  selected: string;
  onSelect: (category: string) => void;
}

/**
 * The 19 categories, with how many keys of the filtered list each holds.
 * @param props - The taxonomy, the counts and the selection.
 * @returns The category list.
 */
export function CategoryNav(props: CategoryNavProps) {
  const { dictionary, counts, selected, onSelect } = props;
  let total = 0;
  for (const count of counts.values()) total += count;
  return (
    <nav className="categories">
      <button
        type="button"
        className={selected === '' ? 'active' : ''}
        onClick={() => {
          onSelect('');
        }}
      >
        <span>all categories</span>
        <span className="muted">{integer(total)}</span>
      </button>
      {Object.entries(dictionary.taxonomy).map(([category, title]) => (
        <button
          key={category}
          type="button"
          className={selected === category ? 'active' : ''}
          disabled={!counts.get(category)}
          onClick={() => {
            onSelect(category);
          }}
        >
          <span>{title}</span>
          <span className="muted">{integer(counts.get(category) ?? 0)}</span>
        </button>
      ))}
    </nav>
  );
}
