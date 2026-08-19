import { useEffect, useRef, useState } from 'react';
import { getCache, setCache } from '../cache';
import type { LoadInfo, LoadProgressInfo } from '../types';

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

interface UseImageLoaderOptions {
  src: string;
  avif: boolean;
  webp: boolean;
  thumbnail: string | undefined;
  fallback: string | undefined;
  retry: number;
  retryDelay: number;
  isVisible: boolean;
  onLoadInfo: ((info: LoadInfo) => void) | undefined;
  onLoadProgress: ((info: LoadProgressInfo) => void) | undefined;
  /** When set, the preloader selects/fetches the same candidate as the rendered <img>. */
  srcSet?: string | undefined;
  sizes?: string | undefined;
}

export interface UseImageLoaderResult {
  displaySrc: string | undefined;
  loadState: LoadState;
  isFromCache: boolean;
}

const CONVERTIBLE_EXT = /\.(jpe?g|png|gif|bmp|tiff?)(\?.*)?$/i;

function getAvifSrc(src: string): string {
  return src.replace(CONVERTIBLE_EXT, '.avif$2');
}

function getWebPSrc(src: string): string {
  return src.replace(CONVERTIBLE_EXT, '.webp$2');
}

function loadImageEl(
  src: string,
  srcSet?: string,
  sizes?: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    // Set sizes/srcset before src so the browser resolves the responsive
    // candidate — this fetches the same file the rendered <img> will use,
    // so the two share the HTTP cache instead of double-downloading.
    if (sizes) img.sizes = sizes;
    if (srcSet) img.srcset = srcSet;
    img.src = src;
  });
}

// Native <img> loading doesn't expose byte-level progress, so when a caller
// asks for it we fetch the bytes ourselves, report progress from the stream,
// then hand the assembled data to an <img> via an object URL. Throws (rather
// than silently degrading) on any failure — network, non-OK response, no
// readable body, or an unsupported browser — so the caller can fall back to
// a plain `loadImageEl` load with no progress reporting.
async function loadImageWithProgress(
  src: string,
  onProgress: (info: LoadProgressInfo) => void,
  signal: AbortSignal
): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  const response = await fetch(src, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch with progress: ${src}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? Number(contentLength) : undefined;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress({
      loaded,
      total,
      progress: total ? Math.min(100, Math.round((loaded / total) * 100)) : undefined,
    });
  }

  const objectUrl = URL.createObjectURL(new Blob(chunks as BlobPart[]));
  try {
    const img = await loadImageEl(objectUrl);
    return { img, objectUrl };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

export function useImageLoader({
  src,
  avif,
  webp,
  thumbnail,
  fallback,
  retry,
  retryDelay,
  isVisible,
  onLoadInfo,
  onLoadProgress,
  srcSet,
  sizes,
}: UseImageLoaderOptions): UseImageLoaderResult {
  const isCached = getCache(src)?.state === 'loaded';

  const [loadState, setLoadState] = useState<LoadState>(isCached ? 'loaded' : 'idle');
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(
    isCached ? src : thumbnail
  );
  const [isFromCache] = useState(isCached);

  // Keep callback refs stable so they never appear in effect deps
  const onLoadInfoRef = useRef(onLoadInfo);
  useEffect(() => {
    onLoadInfoRef.current = onLoadInfo;
  });
  const onLoadProgressRef = useRef(onLoadProgress);
  useEffect(() => {
    onLoadProgressRef.current = onLoadProgress;
  });

  const cancelRef = useRef(false);
  // Object URL backing a progress-tracked load's `displaySrc`. Revoked once
  // it's superseded by a new src or the component unmounts.
  const objectUrlRef = useRef<string | null>(null);

  // Revoke on unmount — a safety net for the case where the component goes
  // away without `src` changing first (the effect below handles that case).
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Reset when src changes
  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const cached = getCache(src)?.state === 'loaded';
    setLoadState(cached ? 'loaded' : 'idle');
    setDisplaySrc(cached ? src : thumbnail);
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isVisible) return;

    cancelRef.current = false;

    // Re-read state synchronously from cache in case it was warmed after this
    // hook's initial render — e.g. a `prefetch` on this same element resolving
    // while it was still out of view. Sync displaySrc/loadState now, since the
    // initial useState calls above only saw the cache as it was at mount.
    if (getCache(src)?.state === 'loaded') {
      setDisplaySrc(src);
      setLoadState('loaded');

      // Still report a (near-instant) onLoadInfo so callers relying on it for
      // analytics see every load, not just cache misses.
      if (onLoadInfoRef.current) {
        const startTime = Date.now();
        loadImageEl(src, srcSet, sizes)
          .then((img) => {
            if (cancelRef.current) return;
            onLoadInfoRef.current?.({
              loadTime: Date.now() - startTime,
              width: img.naturalWidth,
              height: img.naturalHeight,
              fromCache: true,
            });
          })
          .catch(() => {});
      }
      return () => {
        cancelRef.current = true;
      };
    }

    const startTime = Date.now();
    const abortController = new AbortController();

    const run = async () => {
      setLoadState('loading');

      // Resolve which src to actually load. When a srcSet is active the
      // candidate URLs already encode the format, so skip the next-gen
      // format probe (which would double-fetch the original). Otherwise try
      // each requested format in order — AVIF first, then WebP — falling
      // back to the original on failure.
      let finalSrc = src;
      if (!srcSet) {
        const candidates: string[] = [];
        if (avif) {
          const avifSrc = getAvifSrc(src);
          if (avifSrc !== src) candidates.push(avifSrc);
        }
        if (webp) {
          const webpSrc = getWebPSrc(src);
          if (webpSrc !== src) candidates.push(webpSrc);
        }

        for (const candidate of candidates) {
          if (cancelRef.current) break;
          try {
            await loadImageEl(candidate);
            if (!cancelRef.current) finalSrc = candidate;
            break;
          } catch {
            // This format isn't available — try the next candidate.
          }
        }
      }

      if (cancelRef.current) return;

      // Byte-level progress requires fetching the image ourselves — only
      // worth attempting when a caller asked for it, and only meaningful for
      // a single known URL (a `srcSet` leaves candidate selection to the
      // browser, so there's no one request to attribute progress to).
      const wantsProgress = !!onLoadProgressRef.current && !srcSet && typeof fetch === 'function';

      const tryLoad = async (attempt: number): Promise<void> => {
        if (cancelRef.current) return;

        try {
          let img: HTMLImageElement;
          let resolvedSrc = finalSrc;

          if (wantsProgress) {
            try {
              const result = await loadImageWithProgress(
                finalSrc,
                (info) => {
                  if (!cancelRef.current) onLoadProgressRef.current?.(info);
                },
                abortController.signal
              );
              img = result.img;
              resolvedSrc = result.objectUrl;
            } catch {
              if (cancelRef.current) return;
              // Progress fetch failed — CORS, network, or an unsupported
              // browser. Fall back to a normal load with no progress events
              // rather than treating this as a failed attempt.
              img = await loadImageEl(finalSrc, srcSet, sizes);
            }
          } else {
            img = await loadImageEl(finalSrc, srcSet, sizes);
          }

          if (cancelRef.current) {
            if (resolvedSrc !== finalSrc) URL.revokeObjectURL(resolvedSrc);
            return;
          }

          if (resolvedSrc !== finalSrc) {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = resolvedSrc;
          }

          setCache(src, 'loaded');
          setDisplaySrc(resolvedSrc);
          setLoadState('loaded');

          onLoadInfoRef.current?.({
            loadTime: Date.now() - startTime,
            width: img.naturalWidth,
            height: img.naturalHeight,
            fromCache: false,
          });
        } catch {
          if (cancelRef.current) return;

          if (attempt < retry) {
            const delay = retryDelay * Math.pow(2, attempt);
            await new Promise<void>((res) => setTimeout(res, delay));
            if (!cancelRef.current) await tryLoad(attempt + 1);
            return;
          }

          setCache(src, 'error');

          if (fallback) {
            setDisplaySrc(fallback);
            setLoadState('loaded');
          } else {
            setLoadState('error');
          }
        }
      };

      await tryLoad(0);
    };

    void run();

    return () => {
      cancelRef.current = true;
      abortController.abort();
    };
  }, [isVisible, src, avif, webp, fallback, retry, retryDelay, srcSet, sizes]);

  return { displaySrc, loadState, isFromCache };
}
