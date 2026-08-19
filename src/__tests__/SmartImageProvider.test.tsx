import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SmartImage } from '../SmartImage';
import { SmartImageProvider, createImagePresets } from '../SmartImageProvider';
import { clearImageCache } from '../cache';

// jsdom doesn't load images; a controllable stub is enough for these tests
// since none of them need to trigger a real load/error.
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  srcset = '';
  sizes = '';
}

class MockIntersectionObserver {
  observe() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('Image', MockImage);
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

beforeEach(() => {
  clearImageCache();
});

describe('SmartImageProvider', () => {
  it('applies defaults from the provider when a prop is not set on SmartImage', () => {
    const { container } = render(
      <SmartImageProvider defaults={{ skeleton: true }}>
        <SmartImage src="/photo.jpg" alt="Product" width={200} height={200} />
      </SmartImageProvider>
    );
    // skeleton renders a <span> wrapper with a shimmer overlay.
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(container.querySelector('[style*="__si_shimmer"]')).toBeInTheDocument();
  });

  it('lets an explicit prop on SmartImage override the provider default', () => {
    const { container } = render(
      <SmartImageProvider defaults={{ skeleton: true }}>
        <SmartImage src="/photo.jpg" alt="Product" width={200} height={200} skeleton={false} />
      </SmartImageProvider>
    );
    expect(container.querySelector('[style*="__si_shimmer"]')).not.toBeInTheDocument();
  });

  it('applies multiple defaults at once (transition + responsive)', () => {
    const { container } = render(
      <SmartImageProvider
        defaults={{ transition: 'scale', responsive: true, sizes: { mobile: 400, desktop: 800 } }}
      >
        <SmartImage src="/banner.jpg" alt="Banner" />
      </SmartImageProvider>
    );
    const img = container.querySelector('img');
    expect(img?.style.transform).toBe('scale(1.08)');
    expect(img).toHaveAttribute(
      'srcset',
      '/banner.jpg?w=400 400w, /banner.jpg?w=800 800w'
    );
  });

  it('renders without a provider using the component built-in defaults', () => {
    const { container } = render(<SmartImage src="/photo.jpg" alt="Product" />);
    expect(container.querySelector('[style*="__si_shimmer"]')).not.toBeInTheDocument();
  });

  it('a nested provider replaces the outer defaults rather than merging with them', () => {
    const { container } = render(
      <SmartImageProvider defaults={{ fade: true }}>
        <SmartImageProvider defaults={{}}>
          <SmartImage src="/photo.jpg" alt="Product" />
        </SmartImageProvider>
      </SmartImageProvider>
    );
    const img = container.querySelector('img');
    // Inner provider's (empty) defaults win entirely — the outer `fade` default
    // does not leak through, so no transition styling is applied.
    expect(img?.style.opacity).toBe('');
    expect(img?.style.transition).toBe('');
  });

  // ── Presets ──────────────────────────────────────────────────────────────
  const imagePresets = createImagePresets({
    hero: { priority: true, transition: 'fade' },
    product: { zoom: true, transition: 'scale' },
  });

  it('applies a preset\'s props when preset is set', () => {
    const { container } = render(
      <SmartImageProvider presets={imagePresets}>
        <SmartImage preset="hero" src="/hero.jpg" alt="Hero" />
      </SmartImageProvider>
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'eager'); // from `priority: true`
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img?.style.opacity).toBe('0'); // from `transition: 'fade'`, default 300ms duration
    expect(img?.style.transition).toBe('opacity 300ms ease');
  });

  it('lets an explicit prop override the preset it came from', () => {
    const { container } = render(
      <SmartImageProvider presets={imagePresets}>
        <SmartImage preset="hero" src="/hero.jpg" alt="Hero" transition="scale" />
      </SmartImageProvider>
    );
    const img = container.querySelector('img');
    expect(img?.style.transform).toBe('scale(1.08)'); // explicit prop wins over the preset's `fade`
  });

  it('layers preset over provider defaults — preset wins, defaults fill in the rest', () => {
    const { container } = render(
      <SmartImageProvider defaults={{ skeleton: true, transition: 'fade' }} presets={imagePresets}>
        <SmartImage preset="product" src="/shoe.jpg" alt="Shoe" width={200} height={200} />
      </SmartImageProvider>
    );
    const img = container.querySelector('img');
    // `product` preset's `transition: 'scale'` wins over the provider's `transition: 'fade'`.
    expect(img?.style.transform).toBe('scale(1.08)');
    // `zoom: true` from the preset — role="button" affordance from the lightbox default mode.
    expect(img).toHaveAttribute('role', 'button');
    // `skeleton: true` only came from provider defaults (not in the preset) — still applies.
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('warns and falls back gracefully when preset name is not found', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <SmartImageProvider presets={imagePresets}>
        <SmartImage preset="does-not-exist" src="/photo.jpg" alt="Product" />
      </SmartImageProvider>
    );
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('does-not-exist');
    expect(container.querySelector('img')).toBeInTheDocument();
    warnSpy.mockRestore();
  });

  it('defaults.preset sets an app-wide default preset, overridden by an explicit preset prop', () => {
    const { container, rerender } = render(
      <SmartImageProvider defaults={{ preset: 'hero' }} presets={imagePresets}>
        <SmartImage src="/a.jpg" alt="A" />
      </SmartImageProvider>
    );
    expect(container.querySelector('img')?.style.opacity).toBe('0'); // hero's fade

    rerender(
      <SmartImageProvider defaults={{ preset: 'hero' }} presets={imagePresets}>
        <SmartImage src="/a.jpg" alt="A" preset="product" />
      </SmartImageProvider>
    );
    expect(container.querySelector('img')?.style.transform).toBe('scale(1.08)'); // product wins
  });
});
