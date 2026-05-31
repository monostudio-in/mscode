// src/features/extensions/store/selectors.ts

import type { Extension, ExtensionFilter, ExtensionRecord } from '../types';

/**
 * Transforms dense integer values into legible, short-hand human notation strings.
 * (e.g., 125000000 → '125M', 4500 → '5K')
 *
 * @param n Raw metric tally integer.
 */
export const formatDownloads = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
};

/**
 * Maps fractional rating scalars directly onto regular 5-star character blocks.
 * (e.g., 4.2 → '★★★★☆')
 *
 * @param r Floating-point precision rating metric.
 */
export const formatRating = (r: number): string => {
  const rounded = Math.round(r);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
};

/**
 * Iterates across the collection index to filter target records matching matching criteria
 * and sub-string intersections over names, descriptions, tags, and activation hooks.
 *
 * @param all Master list array of present extension configurations.
 * @param filter Structural filter parameters state snapshot.
 */
export function applyFilter(all: Extension[], filter: ExtensionFilter): Extension[] {
  const q = filter.query.toLowerCase().trim();
  
  return all.filter(ext => {
    if (filter.category !== 'All' && ext.category !== filter.category) {
      return false;
    }
    if (!q) {
      return true;
    }
    
    return (
      ext.name.toLowerCase().includes(q)         ||
      ext.publisher.toLowerCase().includes(q)    ||
      ext.description.toLowerCase().includes(q)  ||
      ext.tags.some(t => t.toLowerCase().includes(q)) ||
      ext.activates.some(a => a.toLowerCase().includes(q))
    );
  });
}

/**
 * Splits a unified filtered catalog view into two discrete operational groups 
 * based on whether or not a matching local storage record mapping exists.
 *
 * @param all Master list array of present extension configurations.
 * @param states State record dictionary of currently local extension metadata files.
 * @param filter Structural filter parameters state snapshot.
 */
export function getSections(
  all: Extension[],
  states: Record<string, ExtensionRecord>,
  filter: ExtensionFilter
) {
  const filtered = applyFilter(all, filter);
  
  return {
    marketplace: filtered.filter(e => !states[e.id]),
    installed:   filtered.filter(e => !!states[e.id])
  };
}
