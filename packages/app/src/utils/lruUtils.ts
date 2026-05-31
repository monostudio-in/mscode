// src/utils/lruUtils.ts

/**
 * Access an item in the LRU cache. 
 * Moves the accessed item to the front (index 0).
 */
export function accessLRUItem<T>(items: T[], item: T): T[] {
  const filtered = items.filter((i) => i !== item);
  return [item, ...filtered]; // Newer is first
}

/**
 * Remove an item from the LRU cache.
 */
export function removeLRUItem<T>(items: T[], item: T): T[] {
  return items.filter((i) => i !== item);
}