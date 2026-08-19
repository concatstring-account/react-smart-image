export type CacheState = 'loaded' | 'error';

interface CacheEntry {
  state: CacheState;
  timestamp: number;
}

const imageCache = new Map<string, CacheEntry>();

export const getCache = (src: string): CacheEntry | undefined =>
  imageCache.get(src);

export const setCache = (src: string, state: CacheState): void => {
  imageCache.set(src, { state, timestamp: Date.now() });
};

/** Remove all entries from the image cache */
export const clearImageCache = (): void => imageCache.clear();

/** Remove a single entry from the image cache */
export const invalidateImageCache = (src: string): void => {
  imageCache.delete(src);
};

export interface PrefetchOptions {
  /** Responsive srcSet candidate to fetch instead of the bare `src`. */
  srcSet?: string;
  /** `sizes` attribute paired with `srcSet`, so the browser resolves the same candidate. */
  sizes?: string;
}

/**
 * Fetches an image in the background, ahead of it being rendered or
 * displayed, and marks it `loaded` in the shared cache. A `SmartImage` (or
 * another `prefetchImage` call) for the same `src` afterwards resolves
 * instantly from cache instead of hitting the network.
 *
 * Uses `fetchpriority="low"` so it never competes with images the user is
 * actually looking at. A no-op when `src` is already cached as loaded.
 */
export function prefetchImage(src: string, options: PrefetchOptions = {}): Promise<void> {
  if (typeof window === 'undefined' || getCache(src)?.state === 'loaded') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute('fetchpriority', 'low');
    if (options.sizes) img.sizes = options.sizes;
    if (options.srcSet) img.srcset = options.srcSet;
    img.onload = () => {
      setCache(src, 'loaded');
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}
