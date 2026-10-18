import { useCallback, useEffect, useMemo, useState } from 'react';

import { Nav } from '../components/Nav.tsx';
import type { Corpus } from '../corpus.ts';
import { DatasetMissingError, loadCorpus } from '../corpus.ts';
import { integer } from '../format.ts';

import { CategoryNav, Filters } from './Filters.tsx';
import { KeyDetails } from './KeyDetails.tsx';
import { KeyRow } from './KeyRow.tsx';
import type { Dictionary, DictionarySummary } from './dictionary.ts';
import { loadDictionary } from './dictionary.ts';
import { ExamplesSearcher } from './examples.ts';
import type { Filter } from './filter.ts';
import {
  filterKeys,
  flagCounts,
  formatFilter,
  groupKeys,
  parseFilter,
} from './filter.ts';
import './functions.css';

const REVIEW_URL = '/function-keys.json';
const CORPUS_URL = '/idcodes.txt';

/**
 * The review page of the function keys of `openchemlib-search-wasm/function-keys`: every key by
 * category, its query drawn, its names, its definition, how it compares with RDKit and with the
 * other keys, and the molecules of the dev corpus it matches.
 * @returns The page.
 */
export function FunctionsPage() {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(() =>
    parseFilter(globalThis.location.search),
  );
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [corpusError, setCorpusError] = useState<string | null>(
    globalThis.crossOriginIsolated
      ? null
      : 'This page is not cross-origin isolated, so the corpus cannot be shared with workers.',
  );
  const [searcher, setSearcher] = useState<ExamplesSearcher | null>(null);

  useEffect(() => {
    loadDictionary(REVIEW_URL).then(setDictionary, (error_: unknown) => {
      setError(String(error_));
    });
    if (!globalThis.crossOriginIsolated) return;
    loadCorpus(CORPUS_URL).then(setCorpus, (error_: unknown) => {
      setCorpusError(
        error_ instanceof DatasetMissingError
          ? error_.message
          : `could not load ${CORPUS_URL}`,
      );
    });
  }, []);

  useEffect(() => {
    if (!corpus) return undefined;
    const created = new ExamplesSearcher(corpus);
    setSearcher(created);
    return () => {
      created.dispose();
    };
  }, [corpus]);

  useEffect(() => {
    const address = `/functions${formatFilter(filter)}`;
    if (
      address !== `${globalThis.location.pathname}${globalThis.location.search}`
    ) {
      globalThis.history.replaceState(null, '', address);
    }
  }, [filter]);

  const keys = useMemo(() => dictionary?.keys ?? [], [dictionary]);
  const byId = useMemo(() => new Map(keys.map((key) => [key.id, key])), [keys]);
  const kept = useMemo(() => filterKeys(keys, filter), [keys, filter]);
  const flags = useMemo(
    () => flagCounts(filterKeys(keys, { ...filter, flag: '', text: '' })),
    [keys, filter],
  );
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const key of kept) {
      result.set(key.category, (result.get(key.category) ?? 0) + 1);
    }
    return result;
  }, [kept]);
  const groups = useMemo(() => {
    const shown = filter.category
      ? kept.filter((key) => key.category === filter.category)
      : kept;
    return groupKeys(shown, dictionary?.taxonomy ?? {});
  }, [kept, filter.category, dictionary]);

  const toggle = useCallback((id: string) => {
    setFilter((current) => ({
      ...current,
      open: current.open === id ? '' : id,
    }));
  }, []);
  const openKey = useCallback((id: string) => {
    setFilter({ text: id, tier: 'all', flag: '', category: '', open: id });
  }, []);

  if (error !== null) {
    return (
      <Shell>
        <p className="error">{error}</p>
      </Shell>
    );
  }
  if (!dictionary) {
    return (
      <Shell>
        <p className="muted">Loading the dictionary…</p>
      </Shell>
    );
  }
  const { summary, molecules, generated } = dictionary;
  return (
    <Shell>
      <p className="muted">
        {integer(summary.stored)} stored · {integer(summary.existingPlane)}{' '}
        equal to an existing plane · {integer(summary.onDemand)} on demand —
        from openchemlib-search-wasm/function-keys, counted on{' '}
        {integer(molecules)} PubChem molecules
        {generated ? `, review data of ${generated}` : ', without review data'}
      </p>
      <Cleanup summary={summary} />
      <Filters
        dictionary={dictionary}
        filter={filter}
        flags={flags}
        onFilter={setFilter}
      />
      <div className="functions">
        <CategoryNav
          dictionary={dictionary}
          counts={counts}
          selected={filter.category}
          onSelect={(category) => {
            setFilter((current) => ({ ...current, category, open: '' }));
          }}
        />
        <div>
          {groups.length === 0 ? (
            <p className="muted">No key matches.</p>
          ) : null}
          {groups.map((group) => (
            <section key={group.category} className="category">
              <h2>
                {group.title}{' '}
                <span className="muted">{integer(group.count)}</span>
              </h2>
              {group.subcategories.map((subcategory) => (
                <div key={subcategory.name}>
                  <h3>{subcategory.name}</h3>
                  {subcategory.keys.map((key) => (
                    <div key={key.id}>
                      <KeyRow
                        functionKey={key}
                        molecules={molecules}
                        open={filter.open === key.id}
                        onToggle={toggle}
                      />
                      {filter.open === key.id ? (
                        <KeyDetails
                          functionKey={key}
                          byId={byId}
                          molecules={molecules}
                          corpus={corpus}
                          corpusError={corpusError}
                          searcher={searcher}
                          onOpen={openKey}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="wide">
      <h1>function keys</h1>
      <Nav current="functions" />
      {children}
    </main>
  );
}

function Cleanup({ summary }: { summary: DictionarySummary }) {
  const { pruned, onDemandNeverFound, onDemandMedianUs } = summary;
  if (!pruned) return null;
  return (
    <p className="muted">
      cleaned: {integer(pruned.merged)} keys merged into the key they repeat (
      {integer(pruned.namesKept)} names kept) ·{' '}
      {integer(pruned.droppedNeverMatched + pruned.rescued)} never matched by
      OpenChemLib dropped, {integer(pruned.rescued)} of them reproduced by our
      keys · {integer(pruned.droppedSlow)} slower than 20 µs dropped — on
      demand, {integer(onDemandNeverFound ?? 0)} found in no molecule, median{' '}
      {onDemandMedianUs} µs per molecule
    </p>
  );
}
