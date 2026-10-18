import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { Corpus } from '../corpus.ts';
import { integer, share } from '../format.ts';

import { Examples } from './Examples.tsx';
import { depictFragment } from './depict.ts';
import type { FunctionKey, Neighbour, Review } from './dictionary.ts';
import type { ExamplesSearcher } from './examples.ts';

const FRAGMENTS_SHOWN = 6;

interface KeyDetailsProps {
  functionKey: FunctionKey;
  byId: Map<string, FunctionKey>;
  molecules: number;
  corpus: Corpus | null;
  corpusError: string | null;
  searcher: ExamplesSearcher | null;
  onOpen: (id: string) => void;
}

/**
 * Everything known about one key: its names, its definition, how it compares with RDKit and with
 * the other keys, what it absorbed, its fragments drawn, and the molecules of the dev corpus it
 * matches.
 * @param props - The key, the other keys, and the corpus to find examples in.
 * @returns The details panel.
 */
export function KeyDetails(props: KeyDetailsProps) {
  const {
    functionKey: key,
    byId,
    molecules,
    corpus,
    corpusError,
    searcher,
    onOpen,
  } = props;
  const { id, tier, plane, sources, count1m, synonyms, smarts, review } = key;
  return (
    <div className="details">
      <div className="facts">
        <Fact label="id">{id}</Fact>
        <Fact label="where">
          {tier}
          {plane ? ` · ${plane}` : ''}
        </Fact>
        <Fact label="source">
          {sources.join(', ')}
          {review?.sourceCategory ? ` · ${review.sourceCategory}` : ''}
          {review?.curated ? ' · picked by hand' : ''}
        </Fact>
        <Fact label="on 1M">
          {integer(count1m)} ({share(count1m, molecules)})
          {review ? ` · ${review.costUs} µs per molecule` : ''}
        </Fact>
        {review ? <Agreement review={review} /> : null}
        {synonyms.length > 0 ? (
          <Fact label="synonyms">{synonyms.join(' · ')}</Fact>
        ) : null}
        {review?.blockers?.length ? (
          <Fact label="not stored">{review.blockers.join(' · ')}</Fact>
        ) : null}
        {review?.note ? <Fact label="note">{review.note}</Fact> : null}
        {review?.replaces ? (
          <Fact label="replaces">
            <code>{review.replaces.smarts}</code> (
            {integer(review.replaces.count1m)} on 1M)
          </Fact>
        ) : null}
        {review?.merged?.length ? (
          <Fact label="absorbed">
            {review.merged.map((merged) => (
              <span key={merged.id} className="absorbed">
                {merged.id} ({merged.sources.join(', ')}, {merged.reason}
                {merged.names.length > 0
                  ? `; names kept: ${merged.names.join(', ')}`
                  : ''}
                )
              </span>
            ))}
          </Fact>
        ) : null}
      </div>
      {smarts ? (
        <pre className="smarts" title="compiled for OpenChemLib">
          {smarts}
        </pre>
      ) : null}
      {review?.rdkitSmarts && review.rdkitSmarts !== smarts ? (
        <pre className="smarts" title="checked with RDKit">
          RDKit: {review.rdkitSmarts}
        </pre>
      ) : null}
      {review ? (
        <Relations review={review} byId={byId} onOpen={onOpen} />
      ) : null}
      <Fragments functionKey={key} />
      <p className="label">in the dev corpus</p>
      <Examples
        functionKey={key}
        corpus={corpus}
        searcher={searcher}
        corpusError={corpusError}
        molecules={molecules}
      />
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="label">{label}</span>
      <span>{children}</span>
    </>
  );
}

function Agreement({ review }: { review: Review }) {
  const { verdict, ocl100k, rdkit100k, jaccard, jaccardSameAromaticity } =
    review;
  return (
    <Fact label="vs RDKit">
      {verdict} · OpenChemLib {integer(ocl100k)}, RDKit {integer(rdkit100k)} of
      100k
      {jaccard === undefined ? '' : ` · Jaccard ${jaccard}`}
      {jaccardSameAromaticity === undefined ||
      jaccardSameAromaticity === jaccard
        ? ''
        : ` · ${jaccardSameAromaticity} where both see the same aromaticity`}
    </Fact>
  );
}

interface RelationsProps {
  review: Review;
  byId: Map<string, FunctionKey>;
  onOpen: (id: string) => void;
}

function Relations({ review, byId, onOpen }: RelationsProps) {
  const rows: Array<[string, Neighbour[]]> = [];
  if (review.similarTo) rows.push(['95% the same as', [review.similarTo]]);
  if (review.coveredBy) {
    rows.push([
      'our key for it',
      [{ id: review.coveredBy, jaccard: Number.NaN }],
    ]);
  }
  if (review.nearDuplicates?.length) {
    rows.push(['near-duplicates', review.nearDuplicates]);
  }
  if (review.conceptGroup?.length) {
    rows.push([
      'same name elsewhere',
      review.conceptGroup.map((id) => ({ id, jaccard: Number.NaN })),
    ]);
  }
  if (rows.length === 0) return null;
  return (
    <div className="facts">
      {rows.map(([label, neighbours]) => (
        <Fact key={label} label={label}>
          {neighbours.map((neighbour) => {
            const other = byId.get(neighbour.id);
            return (
              <button
                key={neighbour.id}
                type="button"
                className="link"
                title={
                  other ? `${other.tier} · ${integer(other.count1m)} on 1M` : ''
                }
                onClick={() => {
                  onOpen(neighbour.id);
                }}
              >
                {other?.name ?? neighbour.id}
                {Number.isNaN(neighbour.jaccard)
                  ? ''
                  : ` (${neighbour.jaccard})`}
                {other?.tier === 'stored' ? ' ●' : ''}
              </button>
            );
          })}
        </Fact>
      ))}
    </div>
  );
}

function Fragments({ functionKey: key }: { functionKey: FunctionKey }) {
  const drawings = useMemo(() => {
    const safe = key.id.replaceAll(/[^\w-]/g, '_');
    return key.fragments.slice(0, FRAGMENTS_SHOWN).map((idCode, index) => ({
      idCode,
      svg: depictFragment(idCode, `fr-${safe}-${index}`),
    }));
  }, [key]);
  const more = key.fragments.length - drawings.length;
  return (
    <>
      <p className="label">
        {key.fragments.length === 1
          ? 'the fragment'
          : `the ${integer(key.fragments.length)} fragments it is the OR of`}
        {more > 0 ? ` — the first ${drawings.length}` : ''}
      </p>
      <div className="drawings">
        {drawings.map(({ idCode, svg }) => (
          <figure key={idCode} className="drawing fragment">
            {/* The SVG is generated by openchemlib-js from the key's own idcode. */}
            <div dangerouslySetInnerHTML={{ __html: svg }} />
            <figcaption className="muted">{idCode}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
