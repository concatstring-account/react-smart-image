import { createRef } from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { SmartImage } from '../SmartImage';
import { clearImageCache, invalidateImageCache } from '../index';

// ── Image mock ─────────────────────────────────────────────────────────────
// jsdom doesn't load images, so we replace Image with a controllable stub.

interface MockImageInstance {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
  srcset: string;
  sizes: string;
  naturalWidth: number;
  naturalHeight: number;
  attributes: Record<string, string>;
}

let imageInstances: MockImageInstance[] = [];

class MockImage implements MockImageInstance {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  srcset = '';
  sizes = '';
  naturalWidth = 800;
  naturalHeight = 600;
  attributes: Record<string, string> = {};
  constructor() {
    imageInstances.push(this);
  }
  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }
}

// ── Observer mock ──────────────────────────────────────────────────────────
// Controllable IntersectionObserver so tests can simulate an element entering
// the viewport (used by lazy loading and the onVisible callback).
let observerCallbacks: Array<(entries: unknown[]) => void> = [];

class MockIntersectionObserver {
  constructor(cb: (entries: unknown[]) => void) {
    observerCallbacks.push(cb);
  }
  observe() {}
  disconnect() {}
}

// ── fetch mock (for onLoadProgress) ─────────────────────────────────────────
// A minimal streaming Response whose reader yields the given chunks one at a
// time, so tests can assert progress is reported incrementally.
function makeStreamResponse(chunks: Uint8Array[], contentLength?: number) {
  let index = 0;
  return {
    ok: true,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-length' && contentLength != null
          ? String(contentLength)
          : null,
    },
    body: {
      getReader: () => ({
        read: async () => {
          if (index < chunks.length) {
            return { done: false, value: chunks[index++] };
          }
          return { done: true, value: undefined };
        },
      }),
    },
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeAll(() => {
  vi.stubGlobal('Image', MockImage);
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

beforeEach(() => {
  imageInstances = [];
  observerCallbacks = [];
  clearImageCache();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

async function triggerIntersection() {
  await act(async () => {
    observerCallbacks.forEach((cb) => cb([{ isIntersecting: true }]));
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────
async function triggerLoad(index = 0) {
  await act(async () => {
    imageInstances[index]?.onload?.();
  });
}

async function triggerError(index = 0) {
  await act(async () => {
    imageInstances[index]?.onerror?.();
  });
}

// Lets pending promise chains (fetch → reader.read() → ...) settle before
// the next assertion, since they resolve across several microtask ticks.
async function flushAsync(ticks = 8) {
  await act(async () => {
    for (let i = 0; i < ticks; i++) {
      await Promise.resolve();
    }
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('SmartImage', () => {
  it('renders an img element with the provided alt text', () => {
    const { getByAltText } = render(<SmartImage src="/photo.jpg" alt="A photo" />);
    expect(getByAltText('A photo')).toBeInTheDocument();
  });

  it('forwards width, height, and className to the img element', () => {
    const { getByAltText } = render(
      <SmartImage
        src="/photo.jpg"
        alt="Styled image"
        width={400}
        height={300}
        className="hero-img"
      />
    );
    const img = getByAltText('Styled image');
    expect(img).toHaveAttribute('width', '400');
    expect(img).toHaveAttribute('height', '300');
    expect(img).toHaveClass('hero-img');
  });

  it('forwards ref to the underlying img element', () => {
    const ref = createRef<HTMLImageElement>();
    const { container } = render(<SmartImage src="/photo.jpg" alt="Ref test" ref={ref} />);
    expect(ref.current).toBe(container.querySelector('img'));
  });

  it('renders a span wrapper when skeleton is true', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Skeleton test" width={200} height={200} skeleton />
    );
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('autoBlur derives a tiny blur source from src (no manual blurDataURL)', () => {
    const { container } = render(
      <SmartImage
        src="/landscape.jpg"
        alt="Auto blur"
        width={400}
        height={300}
        placeholder="blur"
        autoBlur
        blurWidth={20}
      />
    );
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay?.getAttribute('style')).toContain('/landscape.jpg?w=20');
    expect(overlay?.getAttribute('style')).toContain('blur(20px)');
  });

  it('renders a span wrapper when placeholder="blur" is set', () => {
    const { container } = render(
      <SmartImage
        src="/photo.jpg"
        alt="Blur test"
        width={200}
        height={200}
        placeholder="blur"
        blurDataURL="data:image/png;base64,abc"
      />
    );
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('shows the shimmer overlay while the image is loading', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Loading state" width={200} height={200} skeleton />
    );
    const shimmer = container.querySelector('[style*="__si_shimmer"]');
    expect(shimmer).toBeInTheDocument();
  });

  it('removes the skeleton overlay after the image loads', async () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="After load" width={200} height={200} skeleton />
    );
    expect(container.querySelector('[style*="__si_shimmer"]')).toBeInTheDocument();

    await triggerLoad();

    expect(container.querySelector('[style*="__si_shimmer"]')).not.toBeInTheDocument();
  });

  it('displays the fallback src when the image fails to load', async () => {
    const { container } = render(
      <SmartImage src="/broken.jpg" alt="Error state" fallback="/placeholder.png" />
    );

    await triggerError();

    const img = container.querySelector('img');
    expect(img?.src).toContain('placeholder.png');
  });

  it('calls onLoadInfo with timing and dimension data after a successful load', async () => {
    const onLoadInfo = vi.fn();
    render(<SmartImage src="/photo.jpg" alt="Info callback" onLoadInfo={onLoadInfo} />);

    await triggerLoad();

    expect(onLoadInfo).toHaveBeenCalledOnce();
    const [info] = onLoadInfo.mock.calls[0];
    expect(info.width).toBe(800);
    expect(info.height).toBe(600);
    expect(typeof info.loadTime).toBe('number');
    expect(info.fromCache).toBe(false);
  });

  // ── onLoadProgress ───────────────────────────────────────────────────────
  it('onLoadProgress reports incremental byte progress, then displays via an object URL', async () => {
    const chunk1 = new Uint8Array(300);
    const chunk2 = new Uint8Array(700);
    fetchMock.mockResolvedValue(makeStreamResponse([chunk1, chunk2], 1000));

    const onLoadProgress = vi.fn();
    const { container } = render(
      <SmartImage src="/large.jpg" alt="Large" onLoadProgress={onLoadProgress} />
    );

    await flushAsync();

    expect(fetchMock).toHaveBeenCalledWith(
      '/large.jpg',
      expect.objectContaining({ signal: expect.anything() })
    );
    expect(onLoadProgress).toHaveBeenNthCalledWith(1, { loaded: 300, total: 1000, progress: 30 });
    expect(onLoadProgress).toHaveBeenNthCalledWith(2, { loaded: 1000, total: 1000, progress: 100 });

    // Stream done — an Image() is created from the resulting blob URL and must "load".
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0].src).toMatch(/^blob:/);

    await triggerLoad(0);
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/^blob:/);
  });

  it('reports undefined total/progress when Content-Length is missing', async () => {
    fetchMock.mockResolvedValue(makeStreamResponse([new Uint8Array(500)]));
    const onLoadProgress = vi.fn();
    render(<SmartImage src="/large.jpg" alt="Large" onLoadProgress={onLoadProgress} />);

    await flushAsync();

    expect(onLoadProgress).toHaveBeenCalledWith({ loaded: 500, total: undefined, progress: undefined });
  });

  it('falls back to a normal load with no progress events when the progress fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('CORS blocked'));
    const onLoadProgress = vi.fn();
    const { container } = render(
      <SmartImage src="/cross-origin.jpg" alt="Fallback" onLoadProgress={onLoadProgress} />
    );

    await flushAsync();

    expect(onLoadProgress).not.toHaveBeenCalled();
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0].src).toBe('/cross-origin.jpg');

    await triggerLoad(0);
    expect(container.querySelector('img')).toHaveAttribute('src', '/cross-origin.jpg');
  });

  it('does not attempt progress tracking when a responsive srcSet is active', async () => {
    const onLoadProgress = vi.fn();
    render(
      <SmartImage
        src="/banner.jpg"
        alt="Responsive"
        responsive
        sizes={{ mobile: 480, desktop: 1200 }}
        onLoadProgress={onLoadProgress}
      />
    );

    await flushAsync();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onLoadProgress).not.toHaveBeenCalled();
  });

  it('does not call onLoadProgress for a cache hit', async () => {
    render(<SmartImage src="/cached.jpg" alt="First" />);
    await triggerLoad(0);

    const onLoadProgress = vi.fn();
    render(<SmartImage src="/cached.jpg" alt="Second" onLoadProgress={onLoadProgress} />);
    await flushAsync();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onLoadProgress).not.toHaveBeenCalled();
  });

  it('generates a responsive srcSet/sizes from breakpoints', () => {
    const { container } = render(
      <SmartImage
        src="/banner.jpg"
        alt="Responsive"
        responsive
        sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
      />
    );
    const img = container.querySelector('img');
    // With no srcSetBuilder, defaults to appending ?w=<width> per breakpoint
    expect(img).toHaveAttribute(
      'srcset',
      '/banner.jpg?w=480 480w, /banner.jpg?w=768 768w, /banner.jpg?w=1200 1200w'
    );
    expect(img).toHaveAttribute(
      'sizes',
      '(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px'
    );
  });

  it('uses & as the query separator when src already has a query string', () => {
    const { container } = render(
      <SmartImage
        src="/banner.jpg?v=2"
        alt="Existing query"
        responsive
        sizes={{ mobile: 480, desktop: 1200 }}
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute(
      'srcset',
      '/banner.jpg?v=2&w=480 480w, /banner.jpg?v=2&w=1200 1200w'
    );
  });

  it('passes through a raw srcSet string with a raw sizes string', () => {
    const { container } = render(
      <SmartImage
        src="/banner.jpg"
        alt="Manual srcSet"
        srcSet="/banner-640.jpg 640w, /banner-1280.jpg 1280w, /banner-1280.jpg 2x"
        sizes="(max-width: 640px) 100vw, 1280px"
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute(
      'srcset',
      '/banner-640.jpg 640w, /banner-1280.jpg 1280w, /banner-1280.jpg 2x'
    );
    expect(img).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 1280px');
  });

  it('does not emit a sizes attribute when there is no srcSet', () => {
    const { container } = render(
      <SmartImage src="/banner.jpg" alt="No srcSet" sizes="(max-width: 640px) 100vw, 1200px" />
    );
    const img = container.querySelector('img');
    expect(img).not.toHaveAttribute('srcset');
    expect(img).not.toHaveAttribute('sizes');
  });

  it('preloads the responsive candidate (single fetch, no bare-src double download)', () => {
    render(
      <SmartImage
        src="/banner.jpg"
        alt="No double fetch"
        responsive
        sizes={{ mobile: 480, desktop: 1200 }}
      />
    );
    // Only one Image() is created, and it carries the srcSet/sizes so the
    // browser fetches the chosen candidate rather than the bare src.
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0].srcset).toBe('/banner.jpg?w=480 480w, /banner.jpg?w=1200 1200w');
    expect(imageInstances[0].sizes).toBe('(max-width: 640px) 480px, 1200px');
  });

  it('viewport strategy renders the mobile image on a mobile screen (ignores DPR, no srcset)', async () => {
    const orig = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: q === '(max-width: 640px)',
      media: q,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    })) as never;
    try {
      const { container } = render(
        <SmartImage
          src="/banner.jpg"
          alt="Viewport mobile"
          responsive
          strategy="viewport"
          sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
        />
      );
      await triggerLoad();
      const img = container.querySelector('img');
      expect(img?.getAttribute('src')).toBe('/banner.jpg?w=480');
      expect(img).not.toHaveAttribute('srcset');
      expect(img).not.toHaveAttribute('sizes');
    } finally {
      window.matchMedia = orig;
    }
  });

  it('viewport strategy picks the desktop image on a wide screen', async () => {
    const orig = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: false, // no max-width query matches → desktop
      media: q,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    })) as never;
    try {
      const { container } = render(
        <SmartImage
          src="/banner.jpg"
          alt="Viewport desktop"
          responsive
          strategy="viewport"
          sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
        />
      );
      await triggerLoad();
      expect(container.querySelector('img')?.getAttribute('src')).toBe('/banner.jpg?w=1200');
    } finally {
      window.matchMedia = orig;
    }
  });

  it('lets a caller-supplied srcSet override responsive generation', () => {
    const { container } = render(
      <SmartImage
        src="/banner.jpg"
        alt="Override"
        responsive
        sizes={{ mobile: 480, desktop: 1200 }}
        srcSet="/custom.jpg 800w"
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('srcset', '/custom.jpg 800w');
  });

  it('uses srcSetBuilder to produce per-width URLs in srcSet', () => {
    const { container } = render(
      <SmartImage
        src="/banner.jpg"
        alt="CDN responsive"
        responsive
        sizes={{ mobile: 480, desktop: 1200 }}
        srcSetBuilder={(src, w) => `${src}?w=${w}`}
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute(
      'srcset',
      '/banner.jpg?w=480 480w, /banner.jpg?w=1200 1200w'
    );
  });

  // ── Priority loading ───────────────────────────────────────────────────
  it('priority sets loading="eager" and fetchpriority="high"', () => {
    const { container } = render(<SmartImage src="/hero.jpg" alt="Hero" priority />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('priority injects a preload link into the document head', () => {
    render(<SmartImage src="/hero.jpg" alt="Hero" priority />);
    const link = document.head.querySelector('link[data-smartimage-preload]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('rel', 'preload');
    expect(link).toHaveAttribute('as', 'image');
    expect(link).toHaveAttribute('href', '/hero.jpg');
    expect(link).toHaveAttribute('fetchpriority', 'high');
  });

  it('priority preload carries imagesrcset/imagesizes for responsive images', () => {
    render(
      <SmartImage
        src="/hero.jpg"
        alt="Hero"
        priority
        responsive
        sizes={{ mobile: 480, desktop: 1200 }}
      />
    );
    const link = document.head.querySelector('link[data-smartimage-preload]');
    expect(link).toHaveAttribute(
      'imagesrcset',
      '/hero.jpg?w=480 480w, /hero.jpg?w=1200 1200w'
    );
    expect(link).toHaveAttribute('imagesizes', '(max-width: 640px) 480px, 1200px');
  });

  it('removes the preload link when the component unmounts', () => {
    const { unmount } = render(<SmartImage src="/hero.jpg" alt="Hero" priority />);
    expect(document.head.querySelector('link[data-smartimage-preload]')).toBeInTheDocument();
    unmount();
    expect(document.head.querySelector('link[data-smartimage-preload]')).not.toBeInTheDocument();
  });

  it('does not inject a preload link without priority', () => {
    render(<SmartImage src="/photo.jpg" alt="Normal" />);
    expect(document.head.querySelector('link[data-smartimage-preload]')).not.toBeInTheDocument();
  });

  // ── Prefetch ─────────────────────────────────────────────────────────────
  it('does not fetch anything for a lazy image without prefetch', () => {
    render(<SmartImage src="/next.jpg" alt="Next" lazy />);
    expect(imageInstances).toHaveLength(0);
  });

  it('prefetch fetches the image in the background even while lazy and not yet visible', () => {
    render(<SmartImage src="/next.jpg" alt="Next" lazy prefetch />);
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0].src).toBe('/next.jpg');
    expect(imageInstances[0].attributes.fetchpriority).toBe('low');
  });

  it('does not force eager loading on the rendered img when prefetching', () => {
    const { container } = render(
      <SmartImage src="/next.jpg" alt="Next" lazy prefetch loading="lazy" />
    );
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
  });

  it('prefetch populates the cache so a later SmartImage for the same src renders already loaded', async () => {
    render(<SmartImage src="/next.jpg" alt="Next" lazy prefetch />);
    await triggerLoad(0);

    const { container } = render(<SmartImage src="/next.jpg" alt="Next again" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/next.jpg');
  });

  it('shows the image once it scrolls into view after prefetch already warmed the cache', async () => {
    const { container } = render(<SmartImage src="/next.jpg" alt="Next" lazy prefetch />);
    // Prefetch's background Image finishes loading before the element is ever visible.
    await triggerLoad(0);

    // Element scrolls into the viewport — isVisible flips true.
    await triggerIntersection();

    expect(container.querySelector('img')).toHaveAttribute('src', '/next.jpg');
  });

  it('also prefetches a distinct zoomSrc when zoom is enabled', () => {
    render(
      <SmartImage src="/thumb.jpg" alt="Product" zoom zoomSrc="/full.jpg" prefetch lazy />
    );
    expect(imageInstances).toHaveLength(2);
    expect(imageInstances[0].src).toBe('/thumb.jpg');
    expect(imageInstances[1].src).toBe('/full.jpg');
  });

  it('ignores zoomSrc for prefetch when zoom is not enabled', () => {
    render(<SmartImage src="/thumb.jpg" alt="Product" zoomSrc="/full.jpg" prefetch lazy />);
    expect(imageInstances).toHaveLength(1);
    expect(imageInstances[0].src).toBe('/thumb.jpg');
  });

  it('skips prefetch when priority is already set', () => {
    render(<SmartImage src="/hero.jpg" alt="Hero" priority prefetch />);
    // priority already loads eagerly via useImageLoader — prefetch would be redundant.
    expect(imageInstances).toHaveLength(1);
  });

  // ── Aspect ratio ───────────────────────────────────────────────────────
  it('applies aspectRatio as an inline style on a plain img', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Ratio" aspectRatio={16 / 9} />
    );
    const img = container.querySelector('img');
    expect(img?.style.aspectRatio).toContain('1.7777777777777777');
  });

  it('applies aspectRatio to the wrapper when overlays are present', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Ratio" skeleton width={400} aspectRatio="16 / 9" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.nodeName).toBe('SPAN');
    expect(wrapper.style.aspectRatio).toBe('16 / 9');
  });

  // ── objectFit / objectPosition ────────────────────────────────────────
  it('leaves objectFit unset on a plain img by default', () => {
    const { container } = render(<SmartImage src="/photo.jpg" alt="Default fit" />);
    expect(container.querySelector('img')?.style.objectFit).toBe('');
  });

  it('applies objectFit and objectPosition to a plain img', () => {
    const { container } = render(
      <SmartImage
        src="/photo.jpg"
        alt="Contain"
        objectFit="contain"
        objectPosition="top"
      />
    );
    const img = container.querySelector('img');
    expect(img?.style.objectFit).toBe('contain');
    expect(img?.style.objectPosition).toBe('top');
  });

  it('defaults objectFit to cover in wrapper mode (skeleton/blur/thumbnail)', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Wrapper default fit" skeleton width={200} height={200} />
    );
    expect(container.querySelector('img')?.style.objectFit).toBe('cover');
  });

  it('overrides the wrapper-mode default with an explicit objectFit', () => {
    const { container } = render(
      <SmartImage
        src="/photo.jpg"
        alt="Wrapper contain"
        skeleton
        width={200}
        height={200}
        objectFit="contain"
        objectPosition="20% 80%"
      />
    );
    const img = container.querySelector('img');
    expect(img?.style.objectFit).toBe('contain');
    expect(img?.style.objectPosition).toBe('20% 80%');
  });

  // ── Zoom / lightbox ────────────────────────────────────────────────────
  it('sets zoom affordances (role, tabindex, cursor) on the image', () => {
    const { container } = render(<SmartImage src="/product.jpg" alt="Product" zoom />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('role', 'button');
    expect(img).toHaveAttribute('tabindex', '0');
    expect(img.style.cursor).toBe('zoom-in');
  });

  it('opens a fullscreen lightbox on click showing the full-resolution src', async () => {
    const { container } = render(<SmartImage src="/product.jpg" alt="Product" zoom />);
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();

    await act(async () => {
      container.querySelector('img')!.click();
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog?.querySelector('img')?.getAttribute('src')).toBe('/product.jpg');
  });

  it('opens the lightbox via the keyboard (Enter)', async () => {
    const { container } = render(<SmartImage src="/product.jpg" alt="Product" zoom />);
    await act(async () => {
      container
        .querySelector('img')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('closes the lightbox on Escape', async () => {
    // animation: 'none' makes the close synchronous (no exit-transition delay).
    const { container } = render(
      <SmartImage src="/product.jpg" alt="Product" zoom zoomOptions={{ animation: 'none' }} />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('closes the lightbox when the backdrop is clicked', async () => {
    const { container } = render(
      <SmartImage src="/product.jpg" alt="Product" zoom zoomOptions={{ animation: 'none' }} />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    await act(async () => {
      dialog.click();
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('shows a separate high-res zoomSrc in the lightbox', async () => {
    const { container } = render(
      <SmartImage src="/thumb.jpg" alt="Product" zoom zoomSrc="/full-4000.jpg" />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    expect(document.querySelector('[role="dialog"] img')?.getAttribute('src')).toBe(
      '/full-4000.jpg'
    );
  });

  it('fires onZoomChange when the lightbox opens and closes', async () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <SmartImage
        src="/product.jpg"
        alt="Product"
        zoom
        zoomOptions={{ animation: 'none' }}
        onZoomChange={onZoomChange}
      />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    expect(onZoomChange).toHaveBeenLastCalledWith(true);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onZoomChange).toHaveBeenLastCalledWith(false);
  });

  it('renders the configured toolbar buttons', async () => {
    const { container } = render(
      <SmartImage
        src="/product.jpg"
        alt="Product"
        zoom
        zoomOptions={{ showToolbar: true, toolbarItems: ['zoomIn', 'zoomOut', 'download'] }}
      />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    const toolbar = document.querySelector('[role="toolbar"]');
    expect(toolbar).toBeInTheDocument();
    expect(toolbar?.querySelectorAll('button')).toHaveLength(3);
    expect(document.querySelector('[aria-label="Zoom in"]')).toBeInTheDocument();
    expect(document.querySelector('[aria-label="Download image"]')).toBeInTheDocument();
    // fullscreen wasn't requested → not rendered
    expect(document.querySelector('[aria-label="Fullscreen"]')).not.toBeInTheDocument();
  });

  it('renders a caption from alt when caption is true', async () => {
    const { container } = render(
      <SmartImage src="/product.jpg" alt="A red bag" zoom zoomOptions={{ caption: true }} />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    expect(document.querySelector('figcaption')?.textContent).toBe('A red bag');
  });

  it('respects closeOnBackdropClick: false', async () => {
    const { container } = render(
      <SmartImage
        src="/product.jpg"
        alt="Product"
        zoom
        zoomOptions={{ animation: 'none', closeOnBackdropClick: false }}
      />
    );
    await act(async () => {
      container.querySelector('img')!.click();
    });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    await act(async () => {
      dialog.click();
    });
    // Backdrop click ignored — dialog stays open.
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('magnifier mode magnifies in place instead of opening a lightbox', () => {
    const { container } = render(
      <SmartImage src="/product.jpg" alt="Product" zoom zoomOptions={{ mode: 'magnifier' }} />
    );
    const img = container.querySelector('img')!;
    // No modal affordances on the image in inline modes.
    expect(img).not.toHaveAttribute('role', 'button');
    img.click();
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('does not add zoom affordances or a lightbox without the zoom prop', () => {
    const { container } = render(<SmartImage src="/product.jpg" alt="Product" />);
    const img = container.querySelector('img')!;
    expect(img).not.toHaveAttribute('role', 'button');
    img.click();
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  // ── onVisible callback ─────────────────────────────────────────────────
  it('calls onVisible once when the image enters the viewport', async () => {
    const onVisible = vi.fn();
    render(<SmartImage src="/banner.jpg" alt="Track" lazy onVisible={onVisible} />);
    expect(onVisible).not.toHaveBeenCalled();

    await triggerIntersection();
    expect(onVisible).toHaveBeenCalledOnce();

    // Should not fire again on subsequent intersections
    await triggerIntersection();
    expect(onVisible).toHaveBeenCalledOnce();
  });

  it('fires onVisible even when the image is not lazy', async () => {
    const onVisible = vi.fn();
    render(<SmartImage src="/banner.jpg" alt="Track" onVisible={onVisible} />);
    await triggerIntersection();
    expect(onVisible).toHaveBeenCalledOnce();
  });

  // ── AVIF / WebP next-gen formats ────────────────────────────────────────
  it('avif probes for a .avif version and uses it on success', async () => {
    const { container } = render(<SmartImage src="/photo.jpg" alt="Avif" avif />);
    expect(imageInstances[0].src).toBe('/photo.avif');

    await triggerLoad(0); // probe succeeds
    expect(imageInstances[1].src).toBe('/photo.avif'); // actual load of the resolved format

    await triggerLoad(1);
    expect(container.querySelector('img')?.src).toContain('/photo.avif');
  });

  it('avif falls back to the original when the .avif probe fails', async () => {
    const { container } = render(<SmartImage src="/photo.jpg" alt="Avif fallback" avif />);
    await triggerError(0); // .avif probe fails

    expect(imageInstances).toHaveLength(2);
    expect(imageInstances[1].src).toBe('/photo.jpg');

    await triggerLoad(1);
    expect(container.querySelector('img')?.src).toContain('/photo.jpg');
  });

  it('with both avif and webp, probes avif first then webp before the original', async () => {
    render(<SmartImage src="/photo.jpg" alt="Both formats" avif webp />);
    expect(imageInstances[0].src).toBe('/photo.avif');

    await triggerError(0); // avif unavailable
    expect(imageInstances).toHaveLength(2);
    expect(imageInstances[1].src).toBe('/photo.webp');

    await triggerLoad(1); // webp available
    expect(imageInstances[2].src).toBe('/photo.webp'); // actual load uses webp, never the original
  });

  it('format="auto" is shorthand for enabling both avif and webp', async () => {
    render(<SmartImage src="/photo.jpg" alt="Auto format" format="auto" />);
    expect(imageInstances[0].src).toBe('/photo.avif');

    await triggerError(0);
    expect(imageInstances[1].src).toBe('/photo.webp');
  });

  // ── Load transition ─────────────────────────────────────────────────────
  it('applies a default opacity crossfade on a plain img with no transition prop', async () => {
    const { container } = render(<SmartImage src="/photo.jpg" alt="Default plain" />);
    const img = container.querySelector('img');
    // Plain <img> path has no wrapper/overlay, so no crossfade is applied by default.
    expect(img?.style.transition).toBe('');
    expect(img?.style.opacity).toBe('');
  });

  it('applies the default opacity crossfade in wrapper mode (skeleton) without a transition prop', async () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Wrapper default" skeleton width={200} height={200} />
    );
    const img = container.querySelector('img');
    expect(img?.style.opacity).toBe('0');
    expect(img?.style.transition).toContain('opacity 0.4s ease');

    await triggerLoad();
    expect(container.querySelector('img')?.style.opacity).toBe('1');
  });

  it('keeps the wrapper (and the same <img> node) mounted across load, so transition can animate', async () => {
    // Regression test: `needsWrapper` must not flip back to a bare <img> once
    // the image finishes loading — that would tear down and recreate the
    // <img> already in its "loaded" style, so the transition never plays.
    const { container } = render(
      <SmartImage
        src="/photo.jpg"
        alt="Skeleton + slide-up"
        skeleton
        width={200}
        height={200}
        transition="slide-up"
        transitionDuration={1000}
      />
    );
    const imgBefore = container.querySelector('img');
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(imgBefore?.style.transform).toBe('translateY(16px)');
    expect(imgBefore?.style.opacity).toBe('0');

    await triggerLoad();

    const imgAfter = container.querySelector('img');
    expect(container.firstChild?.nodeName).toBe('SPAN'); // wrapper persists
    expect(imgAfter).toBe(imgBefore); // same DOM node — never remounted
    expect(imgAfter?.style.transform).toBe('translateY(0)');
    expect(imgAfter?.style.opacity).toBe('1');
  });

  it('fade shorthand applies an opacity transition on a plain img', async () => {
    const { container } = render(<SmartImage src="/photo.jpg" alt="Fade shorthand" fade />);
    const img = container.querySelector('img');
    expect(img?.style.opacity).toBe('0');
    expect(img?.style.transition).toBe('opacity 300ms ease');

    await triggerLoad();
    expect(container.querySelector('img')?.style.opacity).toBe('1');
  });

  it('transition="scale" applies a transform alongside opacity, with a custom duration', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Scale" transition="scale" transitionDuration={500} />
    );
    const img = container.querySelector('img');
    expect(img?.style.opacity).toBe('0');
    expect(img?.style.transform).toBe('scale(1.08)');
    expect(img?.style.transition).toBe('opacity 500ms ease, transform 500ms ease');
  });

  it('transition="reveal" animates clip-path instead of opacity', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Reveal" transition="reveal" />
    );
    const img = container.querySelector('img');
    expect(img?.style.clipPath).toBe('inset(0 100% 0 0)');
    expect(img?.style.transition).toBe('clip-path 300ms ease');
  });

  it('transition="none" disables the animation entirely, including the default crossfade', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="No transition" skeleton width={200} height={200} transition="none" />
    );
    const img = container.querySelector('img');
    expect(img?.style.transition).toBe('');
    expect(img?.style.opacity).toBe('');
  });

  it('ignores transition when a thumbnail is set (src swaps in place)', () => {
    const { container } = render(
      <SmartImage src="/photo.jpg" alt="Thumbnail" thumbnail="/photo-tiny.jpg" transition="scale" />
    );
    const img = container.querySelector('img');
    expect(img?.style.opacity).toBe('1');
    expect(img?.style.transform).toBe('');
  });

  it('exports clearImageCache and invalidateImageCache as callable functions', () => {
    expect(typeof clearImageCache).toBe('function');
    expect(typeof invalidateImageCache).toBe('function');
  });
});
