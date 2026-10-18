import { integer, share } from '../format.ts';

import { QueryThumbnail } from './QueryThumbnail.tsx';
import type { FunctionKey } from './dictionary.ts';

interface KeyRowProps {
  functionKey: FunctionKey;
  molecules: number;
  open: boolean;
  onToggle: (id: string) => void;
}

const GOOD_VERDICTS = new Set(['same', 'close']);

/**
 * One key on one line: its query drawn, where it is stored, its name and synonyms, its sources and
 * flags, how often it matches, how much it costs and how it compares with RDKit. Clicking it opens
 * its details.
 * @param props - The key and whether its details are open.
 * @returns The row.
 */
export function KeyRow(props: KeyRowProps) {
  const { functionKey: key, molecules, open, onToggle } = props;
  const {
    id,
    name,
    synonyms,
    sources,
    fragments,
    plane,
    tier,
    count1m,
    review,
  } = key;
  return (
    <button
      type="button"
      className={open ? 'key open' : 'key'}
      aria-expanded={open}
      onClick={() => {
        onToggle(id);
      }}
    >
      <QueryThumbnail
        id={id}
        idCode={fragments[0] ?? ''}
        more={fragments.length - 1}
      />
      <span className="plane">{plane ?? tier}</span>
      <span className="name">
        <strong>{name}</strong>
        {synonyms.length > 0 ? (
          <span className="muted"> · {synonyms.join(' · ')}</span>
        ) : null}
        <span className="meta">
          <span className="muted">{sources.join(' ')}</span>
          {review?.flags?.map((flag) => (
            <span key={flag} className="flag">
              {flag}
            </span>
          ))}
        </span>
      </span>
      <span
        className="count"
        title={`${integer(count1m)} of ${integer(molecules)}`}
      >
        {share(count1m, molecules)}
      </span>
      <span className="cost muted" title="µs per molecule">
        {review ? `${review.costUs} µs` : ''}
      </span>
      <span
        className={
          review && GOOD_VERDICTS.has(review.verdict)
            ? 'verdict'
            : 'verdict warn'
        }
        title="against RDKit's matches of the source SMARTS, on 100k molecules"
      >
        {review ? agreement(review.verdict, review.jaccard) : ''}
      </span>
    </button>
  );
}

function agreement(verdict: string, jaccard: number | undefined): string {
  if (verdict === 'idcode' || jaccard === undefined) return verdict;
  return `${verdict} ${jaccard.toFixed(2)}`;
}
