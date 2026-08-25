import type { Corpus } from '../corpus.ts';
import { readIdCode } from '../corpus.ts';
import { integer } from '../format.ts';
import { HIT_LIMIT } from '../runState.ts';

interface HitsProps {
  corpus: Corpus;
  hits: number[];
  matched: number;
}

/**
 * The first matching idcodes, appended as the workers reach them.
 *
 * The list is capped: a benzene query matches 257,625 molecules, and rendering them would cost far
 * more than the scan it is meant to observe.
 * @param props - The list's inputs.
 * @param props.corpus - The packed corpus, read for the idcode of each hit.
 * @param props.hits - The matched indices, in order.
 * @param props.matched - How many matches there are in total.
 * @returns The hit list.
 */
export function Hits({ corpus, hits, matched }: HitsProps) {
  return (
    <section className="panel">
      <p className="label">
        first {integer(Math.min(hits.length, HIT_LIMIT))} of {integer(matched)}{' '}
        matches
      </p>
      <ol className="hits">
        {hits.map((index) => (
          <li key={index}>
            <span className="muted">{integer(index)}</span>
            <code>{readIdCode(corpus, index)}</code>
          </li>
        ))}
      </ol>
    </section>
  );
}
