'use client';

import dynamic from 'next/dynamic';
import { useLazyQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../lib/presistence';
import { gql } from '@apollo/client';
import clsx from 'clsx';

const Map = dynamic(() => import('./map/Map'), { ssr: false });

const SEARCH = gql`
  query Search($q: String!, $state: String) {
    searchLocations(q: $q, state: $state) {
      id
      location
      postcode
      state
      latitude
      longitude
      category
    }
  }
`;

type Item = {
  id: number;
  location: string;
  postcode: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
};

export default function Source() {
  const [query, setQuery] = useLocalStorage<string>('source-query', '');
  const [selectedCategory, setSelectedCategory] = useLocalStorage<string>('source-category', '');
  const [selected, setSelected] = useLocalStorage<Item | null>('source-selected', null);
  const [results, setResults] = useLocalStorage<Item[]>('source-results', []);
  const [hasSearched, setHasSearched] = useLocalStorage<boolean>('source-has-searched', false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [run, { loading, data }] = useLazyQuery<{ searchLocations: Item[] }>(SEARCH, {
    fetchPolicy: 'no-cache',
  });

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const categories = useMemo(() => {
    if (!results || results.length === 0) return [];
    const set = new Set(results.map((r) => r.category || ''));
    return Array.from(set).filter(Boolean).sort();
  }, [results]);

  const filtered = useMemo(() => {
    if (!results || results.length === 0) return [];
    return selectedCategory ? results.filter((r) => r.category === selectedCategory) : results;
  }, [results, selectedCategory]);

  useEffect(() => {
    if (data?.searchLocations) {
      // Only update if the data is actually different
      setResults(prev => {
        const newResults = data.searchLocations;
        // Deep comparison to prevent unnecessary updates
        if (JSON.stringify(prev) === JSON.stringify(newResults)) {
          return prev; // Return same reference if data is identical
        }
        return newResults;
      });
    }
  }, [data, setResults]);

  // Reset hasSearched when query is cleared
  useEffect(() => {
    if (!query.trim()) {
      setHasSearched(false);
    }
  }, [query, setHasSearched]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    run({ variables: { q: query.trim() } });
  };

  const hasCoords = (i: Item | null) => !!i && Number.isFinite(i.latitude) && Number.isFinite(i.longitude);

  useEffect(() => {
    // When a selection exists, log it once per selection change
    if (!selected) return;
    (async () => {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ kind: 'source', input: { query }, output: selected, at: new Date().toISOString() }),
        });
      } catch {}
    })();
  }, [selected, query]);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-sm opacity-70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Search suburb or postcode"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="bg-black text-white rounded-lg px-4 py-2" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {categories.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span>Category:</span>
          <select
            key={`categories-${categories.length}`}
            className="border rounded px-2 py-1"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="p-3 max-h-72 overflow-auto">
          {hasSearched && results.length === 0 && !loading ? (
            <div 
            className={clsx(
              "text-sm opacity-70 transition-opacity",
              hasSearched && results.length === 0 && !loading && "opacity-0"
            )}
            >No suburbs found for '{query}'.</div>
          ) : !query.trim() ? (
            <div 
            className={clsx(
              "text-sm opacity-70 transition-opacity",
              !query.trim() && !loading && "opacity-0"
            )}
            >Enter a suburb or postcode to search.</div>
          ) : (
            <ul className="divide-y" key={`results-${filtered.length}-${selectedCategory}`}>
              {filtered.map((i) => (
                <li key={i.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{i.location}</div>
                    <div className="text-xs opacity-70">{i.postcode} · {i.state} · {i.category}</div>
                  </div>
                  <button className="text-sm underline" onClick={() => setSelected(i)}>
                    Select
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          {hasCoords(selected) ? (
            <Map lat={selected!.latitude as number} lng={selected!.longitude as number} />
          ) : (
            <div className="text-sm opacity-70">Select a location to see it on the map.</div>
          )}
        </div>
      </div>
    </div>
  );
}


