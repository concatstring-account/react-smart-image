import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { clearImageCache, getCache, prefetchImage } from '../cache';

// jsdom/happy-dom doesn't actually load images, so we replace Image with a
// controllable stub, same approach as SmartImage.test.tsx.
interface MockImageInstance {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
  srcset: string;
  sizes: string;
  attributes: Record<string, string>;
}

let imageInstances: MockImageInstance[] = [];

class MockImage implements MockImageInstance {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  srcset = '';
  sizes = '';
  attributes: Record<string, string> = {};
  constructor() {
    imageInstances.push(this);
  }
  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }
}

beforeAll(() => {
  vi.stubGlobal('Image', MockImage);
});

beforeEach(() => {
  imageInstances = [];
  clearImageCache();
});

describe('prefetchImage', () => {
  it('fetches the given src at low priority', () => {
    void prefetchImage('/next.jpg');
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0].src).toBe('/next.jpg');
    expect(imageInstances[0].attributes.fetchpriority).toBe('low');
  });

  it('passes through srcSet/sizes so the browser resolves the matching candidate', () => {
    void prefetchImage('/next.jpg', {
      srcSet: '/next.jpg?w=480 480w, /next.jpg?w=1200 1200w',
      sizes: '(max-width: 640px) 480px, 1200px',
    });
    expect(imageInstances[0].srcset).toBe('/next.jpg?w=480 480w, /next.jpg?w=1200 1200w');
    expect(imageInstances[0].sizes).toBe('(max-width: 640px) 480px, 1200px');
  });

  it('marks the src as loaded in the cache once the fetch succeeds', async () => {
    const done = prefetchImage('/next.jpg');
    expect(getCache('/next.jpg')).toBeUndefined();

    imageInstances[0].onload?.();
    await done;

    expect(getCache('/next.jpg')?.state).toBe('loaded');
  });

  it('resolves without throwing when the fetch fails', async () => {
    const done = prefetchImage('/broken.jpg');
    imageInstances[0].onerror?.();
    await expect(done).resolves.toBeUndefined();
    expect(getCache('/broken.jpg')).toBeUndefined();
  });

  it('is a no-op when the src is already cached as loaded', async () => {
    const first = prefetchImage('/next.jpg');
    imageInstances[0].onload?.();
    await first;

    await prefetchImage('/next.jpg');
    // No second Image() was created for the already-cached src.
    expect(imageInstances).toHaveLength(1);
  });
});
