import type React from 'react';

export interface ResponsiveSizes {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

/** How the zoom is triggered / presented. */
export type ZoomMode = 'lightbox' | 'inline' | 'magnifier' | 'fullscreen';

/** Open/close animation for the zoom lightbox. */
export type ZoomAnimation = 'fade' | 'scale' | 'zoom' | 'slide' | 'none';

/** Toolbar buttons available in the zoom lightbox. */
export type ZoomToolbarButton = 'zoomIn' | 'zoomOut' | 'reset' | 'download' | 'fullscreen';

/** Transition style applied to the image as it finishes loading. */
export type TransitionKind =
  | 'none'
  | 'fade'
  | 'flip'
  | 'rotate'
  | 'grow'
  | 'scale'
  | 'slide-up'
  | 'slide-left'
  | 'reveal';

export interface ZoomOptions {
  /**
   * How zoom is triggered/displayed:
   * - `'lightbox'` (default): click opens a lightbox popup
   * - `'fullscreen'`: like `'lightbox'`, but also enters the browser Fullscreen API
   * - `'inline'`: magnify in place while hovering (no modal)
   * - `'magnifier'`: a magnifier lens follows the cursor over the image (no modal)
   */
  mode?: ZoomMode;
  /** Open/close animation for the lightbox (`click`/`fullscreen` modes). Default `'fade'`. */
  animation?: ZoomAnimation;
  /** Animation duration in milliseconds. Default `300`. */
  animationDuration?: number;
  /** Show the lightbox toolbar (zoom in/out, reset, download, fullscreen). Default `false`. */
  showToolbar?: boolean;
  /**
   * Which toolbar buttons to show, in order, when `showToolbar` is set.
   * Defaults to all: `['zoomIn', 'zoomOut', 'reset', 'download', 'fullscreen']`.
   */
  toolbarItems?: ZoomToolbarButton[];
  /** Magnification factor for `inline`/`magnifier` modes and toolbar zoom steps. Default `2`. */
  scale?: number;
  /** Diameter (px) of the magnifier lens in `magnifier` mode. Default `160`. */
  magnifierSize?: number;
  /** Backdrop color behind the zoomed image. Defaults to `'rgba(0,0,0,0.85)'`. */
  backdropColor?: string;
  /**
   * Show a caption beneath the zoomed image. `true` uses the image's `alt`
   * text; pass a string for a custom caption. Defaults to no caption.
   */
  caption?: boolean | string;
  /** Close the lightbox when the backdrop is clicked. Defaults to `true`. */
  closeOnBackdropClick?: boolean;
  /** Close the lightbox when the Escape key is pressed. Defaults to `true`. */
  closeOnEsc?: boolean;
  /** Show the × close button. Defaults to `true`. */
  showCloseButton?: boolean;
  /** Class name applied to the zoomed `<img>` inside the lightbox. */
  className?: string;
  /** Inline style merged onto the zoomed `<img>` inside the lightbox. */
  style?: React.CSSProperties;
}

export interface LoadProgressInfo {
  /** Bytes received so far. */
  loaded: number;
  /**
   * Total bytes to download, read from the response's `Content-Length`
   * header. `undefined` when the server doesn't send one (e.g. a compressed
   * or chunked response) — progress is then indeterminate; render a spinner
   * rather than a percentage.
   */
  total: number | undefined;
  /** `Math.round((loaded / total) * 100)`, or `undefined` when `total` is unknown. */
  progress: number | undefined;
}

export interface LoadInfo {
  /** Time in milliseconds from load start to completion */
  loadTime: number;
  /** Natural pixel width of the loaded image */
  width: number;
  /** Natural pixel height of the loaded image */
  height: number;
  /** Whether the result was served from the internal cache */
  fromCache: boolean;
}

export interface SmartImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'placeholder' | 'sizes'> {
  /** Image source URL (required) */
  src: string;
  /**
   * Name of a preset registered via the nearest `SmartImageProvider`'s
   * `presets` map (built with `createImagePresets`). Applies that preset's
   * props, layered between the provider's `defaults` and any prop set
   * directly here — an explicit prop on this element always wins over the
   * preset, and the preset always wins over `defaults`.
   */
  preset?: string;
  /** Delay loading until the image enters the viewport */
  lazy?: boolean;
  /**
   * Load this image with maximum priority — for above-the-fold / LCP images
   * such as hero banners. Sets `loading="eager"` and `fetchpriority="high"`,
   * disables lazy loading, and injects a `<link rel="preload" as="image">`
   * (with responsive `imagesrcset`/`imagesizes` when applicable) into the
   * document head so the browser starts fetching it as early as possible.
   */
  priority?: boolean;
  /**
   * Reserve layout space before the image loads using CSS `aspect-ratio`,
   * eliminating layout shift (improves CLS). Accepts a number computed as
   * `width / height` (e.g. `16 / 9`) or a raw CSS string (e.g. `"16 / 9"`).
   */
  aspectRatio?: number | string;
  /**
   * Fetch this image in the background — ahead of it entering the viewport
   * or being opened — so it's already cached when it's actually needed.
   * Unlike `priority`, it doesn't force this image to render eagerly; it
   * only warms the cache at low fetch priority. Ideal for the next item in a
   * gallery/carousel, or images a navigation is likely to reveal next. When
   * `zoom` is set with a distinct `zoomSrc`, that high-res source is
   * prefetched too, so opening the zoom view has no visible delay. Ignored
   * when `priority` is set (already preloaded at high priority).
   */
  prefetch?: boolean;
  /**
   * How the image fills its `width`/`height` (or `aspectRatio`) box, same
   * values as CSS `object-fit`. In wrapper mode (`skeleton`, `placeholder`,
   * or `thumbnail`) this defaults to `'cover'`; on a plain `<img>` it's left
   * to the browser default (`'fill'`) unless set.
   */
  objectFit?: React.CSSProperties['objectFit'];
  /**
   * Which part of the image stays visible when `objectFit` crops it, same
   * values as CSS `object-position` (e.g. `'top'`, `'center 20%'`). Only
   * meaningful alongside `objectFit="cover"` or `"none"`.
   */
  objectPosition?: React.CSSProperties['objectPosition'];
  /**
   * Enable zoom. By default (`zoom` alone) clicking the image opens a fullscreen
   * lightbox preview. Configure the behavior with `zoomOptions` — mode
   * (lightbox/inline/magnifier/fullscreen), animation, toolbar, and more.
   */
  zoom?: boolean;
  /**
   * A separate (typically higher-resolution) image URL to show when zoomed,
   * while the inline `<img>` keeps using `src`. Ideal for thumbnails that open
   * to full-detail images. Falls back to `src` when omitted.
   */
  zoomSrc?: string;
  /** Fine-grained zoom configuration (mode, animation, toolbar, appearance). */
  zoomOptions?: ZoomOptions;
  /** Called when the zoom lightbox opens (`true`) or closes (`false`). */
  onZoomChange?: (isOpen: boolean) => void;
  /**
   * Called once, the first time the image scrolls into the viewport. Useful for
   * impression / analytics tracking. Fires whether or not `lazy` is set (uses
   * the same 100 px pre-load margin).
   */
  onVisible?: () => void;
  /** Show a blurred version of blurDataURL while the image loads */
  placeholder?: 'blur';
  /** Base64 data URL for the blur placeholder (small LQIP image) */
  blurDataURL?: string;
  /**
   * Auto-generate the blur preview by requesting a tiny version of `src` (via the
   * same URL builder as `responsive`, e.g. `?w=24`) instead of passing `blurDataURL`
   * manually. Requires a host that resizes by URL. Ignored when `blurDataURL` is set.
   */
  autoBlur?: boolean;
  /** Width (px) of the tiny image fetched for `autoBlur`. Defaults to 24. */
  blurWidth?: number;
  /** Show an animated shimmer skeleton while loading */
  skeleton?: boolean;
  /** Base background color of the skeleton placeholder (any CSS color). Defaults to '#e5e7eb' */
  skeletonColor?: string;
  /** Color of the moving shimmer highlight (any CSS color). Defaults to 'rgba(255,255,255,0.55)' */
  skeletonHighlightColor?: string;
  /** URL to show when the image fails to load after all retries */
  fallback?: string;
  /** Try loading an .avif version of the image before webp/the original. Checked first. */
  avif?: boolean;
  /** Try loading a .webp version of the image before falling back to the original */
  webp?: boolean;
  /**
   * Shorthand for enabling both `avif` and `webp` — probes in the order
   * `.avif` → `.webp` → original. Equivalent to setting both props to `true`.
   */
  format?: 'auto';
  /** Low-quality thumbnail URL to display while the full image loads */
  thumbnail?: string;
  /** Enable responsive srcSet and sizes generation */
  responsive?: boolean;
  /**
   * How `responsive` selects the image:
   * - `'srcset'` (default): emits `srcSet`/`sizes` and lets the browser pick —
   *   honors device pixel ratio (a 2× phone may load a larger file for sharpness).
   * - `'viewport'`: picks the breakpoint by media query only (ignoring DPR) and
   *   renders a single `src`, so a mobile *screen* always gets the mobile image.
   */
  strategy?: 'srcset' | 'viewport';
  /**
   * Either an object of pixel widths per breakpoint (used with `responsive` to
   * generate `srcSet`/`sizes`), or a raw `sizes` string passed straight to the
   * `<img>` — useful when you already supply a `srcSet` string yourself
   * (e.g. `sizes="(max-width: 640px) 480px, 1200px"`).
   */
  sizes?: ResponsiveSizes | string;
  /**
   * Maps the base `src` and a breakpoint width to the actual URL for that width.
   * Defaults to appending a `?w=<width>` query param (honored by most image CDNs).
   * Override for filename-pattern hosts, e.g. `(src, w) => src.replace(/(\.\w+)$/, \`-${w}$1\`)`.
   */
  srcSetBuilder?: (src: string, width: number) => string;
  /**
   * Transition style applied to the image as it finishes loading — replaces
   * the default skeleton/blur crossfade with a configurable animation.
   * `'none'` disables the animation entirely. Ignored when `thumbnail` is
   * set, since the image swaps `src` in place rather than revealing over an
   * overlay. Defaults to a plain opacity crossfade when unset.
   */
  transition?: TransitionKind;
  /** Duration (ms) of the `transition` animation. Defaults to `300`. */
  transitionDuration?: number;
  /** Shorthand for `transition="fade"`. */
  fade?: boolean;
  /** Number of times to retry a failed load (uses exponential backoff) */
  retry?: number;
  /** Base delay in ms between retries */
  retryDelay?: number;
  /** Called once the image has finished loading (or failed) */
  onLoadInfo?: (info: LoadInfo) => void;
  /**
   * Reports byte-level download progress while the image loads — useful for
   * a custom progress bar on large images. Requires the `fetch`/`ReadableStream`
   * APIs and a same-origin (or CORS-enabled) `src`; falls back to a normal
   * load with no progress events when either is unavailable (e.g. a
   * cross-origin image without CORS headers) — the image still loads either
   * way. Not supported together with `responsive`, since the browser (not
   * this library) chooses which candidate URL to fetch. Never called for a
   * cache hit, since there's no network transfer to report on. `total` and
   * `progress` are `undefined` when the server omits `Content-Length`.
   */
  onLoadProgress?: (info: LoadProgressInfo) => void;
}
