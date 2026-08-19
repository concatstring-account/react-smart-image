import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { useImageLoader } from './hooks/useImageLoader';
import { useResponsiveWidth } from './hooks/useResponsiveWidth';
import { prefetchImage } from './cache';
import { useSmartImageContext } from './SmartImageProvider';
import { Lightbox } from './Lightbox';
import { ZoomMagnifier } from './ZoomMagnifier';
import type { SmartImageProps, ResponsiveSizes, ZoomToolbarButton, TransitionKind } from './types';

const ZOOM_DEFAULTS = {
  mode: 'lightbox' as const,
  animation: 'fade' as const,
  animationDuration: 300,
  showToolbar: false,
  toolbarItems: ['zoomIn', 'zoomOut', 'reset', 'download', 'fullscreen'] as ZoomToolbarButton[],
  scale: 2,
  magnifierSize: 160,
  backdropColor: 'rgba(0,0,0,0.85)',
  closeOnBackdropClick: true,
  closeOnEsc: true,
  showCloseButton: true,
};

// ── Skeleton animation ─────────────────────────────────────────────────────
let skeletonInjected = false;

function injectSkeletonStyles() {
  if (skeletonInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.dataset.smartimage = '1';
  style.textContent = `@keyframes __si_shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`;
  document.head.appendChild(style);
  skeletonInjected = true;
}

// ── Responsive helpers ─────────────────────────────────────────────────────
// Default: append a `?w=<width>` query param (honored by most image CDNs and
// resize servers). Falls back to `&` when the URL already has a query string.
function defaultSrcSetUrl(src: string, width: number): string {
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}w=${width}`;
}

// Resolve the URL for a single width, using a custom builder when provided.
function resolveUrl(
  src: string,
  width: number,
  builder?: (src: string, width: number) => string
): string {
  return (builder ?? defaultSrcSetUrl)(src, width);
}

function buildSrcSet(
  src: string,
  widths: number[],
  builder?: (src: string, width: number) => string
): string {
  return widths.map((w) => `${resolveUrl(src, w, builder)} ${w}w`).join(', ');
}

// ── Load transition ─────────────────────────────────────────────────────────
// Maps a transition kind to its hidden (not-yet-loaded) → visible (loaded)
// styles. All but `reveal` fade opacity in tandem with the transform/clip so
// the effect reads as a single cohesive motion rather than a hard cut.
function getTransitionStyle(
  kind: TransitionKind,
  isLoaded: boolean,
  duration: number
): React.CSSProperties {
  switch (kind) {
    case 'none':
      return {};
    case 'fade':
      return { transition: `opacity ${duration}ms ease`, opacity: isLoaded ? 1 : 0 };
    case 'flip':
      return {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded
          ? 'perspective(800px) rotateY(0deg)'
          : 'perspective(800px) rotateY(90deg)',
      };
    case 'rotate':
      return {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'rotate(0deg) scale(1)' : 'rotate(-15deg) scale(0.9)',
      };
    case 'grow':
      return {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'scale(1)' : 'scale(0.5)',
      };
    case 'scale':
      return {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'scale(1)' : 'scale(1.08)',
      };
    case 'slide-up':
      return {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(16px)',
      };
    case 'slide-left':
      return {
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateX(0)' : 'translateX(16px)',
      };
    case 'reveal':
      return {
        transition: `clip-path ${duration}ms ease`,
        clipPath: isLoaded ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
      };
  }
}

function buildSizes(breakpoints: ResponsiveSizes): string {
  const parts: string[] = [];
  if (breakpoints.mobile) parts.push(`(max-width: 640px) ${breakpoints.mobile}px`);
  if (breakpoints.tablet) parts.push(`(max-width: 1024px) ${breakpoints.tablet}px`);
  if (breakpoints.desktop) parts.push(`${breakpoints.desktop}px`);
  return parts.join(', ');
}

// ── Component ──────────────────────────────────────────────────────────────
export const SmartImage = forwardRef<HTMLImageElement, SmartImageProps>(
  function SmartImage(rawProps, forwardedRef) {
    const { defaults, presets } = useSmartImageContext();

    // `preset` may come from this element directly, or fall back to a
    // provider-wide default preset (`defaults.preset`).
    const presetName = rawProps.preset ?? defaults.preset;
    const presetConfig = presetName ? presets[presetName] : undefined;

    // A dev-facing warning for a typo'd preset name — logged once per
    // (name, presets map) pair, not on every re-render this component goes
    // through while loading.
    useEffect(() => {
      if (presetName && !presets[presetName]) {
        console.warn(
          `SmartImage: no preset named "${presetName}" was found in the nearest SmartImageProvider's presets.`
        );
      }
    }, [presetName, presets]);

    // Resolve final props: component props > preset > provider defaults.
    const props: SmartImageProps = { ...defaults, ...presetConfig, ...rawProps };
    const {
      src,
      preset: _preset,
      lazy = false,
      priority = false,
      aspectRatio,
      prefetch = false,
      objectFit,
      objectPosition,
      zoom = false,
      zoomSrc,
      zoomOptions,
      onZoomChange,
      onVisible,
      placeholder,
      blurDataURL,
      autoBlur = false,
      blurWidth = 24,
      skeleton = false,
      skeletonColor = '#e5e7eb',
      skeletonHighlightColor = 'rgba(255,255,255,0.55)',
      fallback,
      avif = false,
      webp = false,
      format,
      transition,
      transitionDuration,
      fade = false,
      thumbnail,
      responsive = false,
      strategy = 'srcset',
      sizes: responsiveSizes,
      srcSetBuilder,
      retry = 0,
      retryDelay = 1000,
      onLoadInfo,
      onLoadProgress,
      alt = '',
      width,
      height,
      style,
      className,
      srcSet: propSrcSet,
      onError,
      onLoad,
      onClick,
      onKeyDown,
      loading: loadingProp,
      fetchPriority: fetchPriorityProp,
      ...restImgProps
    } = props;

    // `priority` forces eager loading and high fetch priority; otherwise honor
    // any caller-supplied values.
    const loading = priority ? 'eager' : loadingProp;
    const fetchPriority = priority ? 'high' : fetchPriorityProp;

    // Inject skeleton keyframes on first use
    useEffect(() => {
      if (skeleton) injectSkeletonStyles();
    }, [skeleton]);

    // Lazy loading — observe the wrapper/img element.
    // `priority` always wins: an above-the-fold image is never deferred.
    // `onVisible` reports first viewport entry even when loading isn't gated.
    const { elementRef, isVisible } = useIntersectionObserver(
      lazy && !priority,
      undefined,
      onVisible
    );
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Viewport strategy: pick the breakpoint by media query only (ignoring DPR),
    // so a mobile *screen* always gets the mobile image. Only applies to
    // `responsive` with an object `sizes`.
    const sizesIsObject =
      responsiveSizes != null && typeof responsiveSizes !== 'string';
    const useViewport = responsive && strategy === 'viewport' && sizesIsObject;
    const activeWidth = useResponsiveWidth(
      sizesIsObject ? (responsiveSizes as ResponsiveSizes) : {},
      useViewport
    );

    // The base src to load. In viewport mode, resolve the chosen breakpoint's URL
    // and render it as a single source (no srcSet, so the browser can't upscale
    // by DPR). Otherwise use the original src.
    const effectiveSrc =
      useViewport && activeWidth != null
        ? resolveUrl(src, activeWidth, srcSetBuilder)
        : src;

    // Responsive srcSet / sizes (srcset strategy only).
    // A caller-supplied `srcSet` string always wins; otherwise generate one from
    // breakpoint widths when `responsive` is set with an object `sizes`.
    const computedSrcSet = useViewport
      ? undefined
      : propSrcSet ??
        (responsive && sizesIsObject
          ? buildSrcSet(
              src,
              Object.values(responsiveSizes as ResponsiveSizes).filter(
                (v): v is number => v != null
              ),
              srcSetBuilder
            )
          : undefined);

    // `sizes` may be a raw string (passed through) or an object (built from
    // breakpoints). A raw string is honored even without `responsive`.
    const sizesString = useViewport
      ? undefined
      : typeof responsiveSizes === 'string'
        ? responsiveSizes
        : responsive && responsiveSizes != null
          ? buildSizes(responsiveSizes)
          : undefined;

    // A `sizes` attribute is only meaningful alongside a `srcSet`.
    const computedSizes = computedSrcSet ? sizesString : undefined;

    // Priority preload — inject a <link rel="preload" as="image"> into <head>
    // so the browser can start fetching an above-the-fold image as early as
    // possible (better LCP). Mirrors the rendered <img>'s responsive candidate
    // via imagesrcset/imagesizes so the two share one request.
    useEffect(() => {
      if (!priority || typeof document === 'undefined') return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.setAttribute('href', effectiveSrc);
      if (computedSrcSet) link.setAttribute('imagesrcset', computedSrcSet);
      if (computedSizes) link.setAttribute('imagesizes', computedSizes);
      link.setAttribute('fetchpriority', 'high');
      link.dataset.smartimagePreload = '1';
      document.head.appendChild(link);

      return () => {
        link.remove();
      };
    }, [priority, effectiveSrc, computedSrcSet, computedSizes]);

    // Prefetch — warm the image cache in the background, ahead of this image
    // actually entering the viewport or being opened. Skipped when `priority`
    // already preloads it at high priority. Also prefetches a distinct
    // `zoomSrc`, so opening the zoom view has no visible delay.
    useEffect(() => {
      if (!prefetch || priority) return;
      void prefetchImage(effectiveSrc, { srcSet: computedSrcSet, sizes: computedSizes });
      if (zoom && zoomSrc && zoomSrc !== effectiveSrc) {
        void prefetchImage(zoomSrc);
      }
    }, [prefetch, priority, effectiveSrc, computedSrcSet, computedSizes, zoom, zoomSrc]);

    // `format="auto"` is shorthand for enabling both next-gen formats.
    const effectiveAvif = avif || format === 'auto';
    const effectiveWebp = webp || format === 'auto';

    const { displaySrc, loadState } = useImageLoader({
      src: effectiveSrc,
      avif: effectiveAvif,
      webp: effectiveWebp,
      thumbnail,
      fallback,
      retry,
      retryDelay,
      isVisible,
      onLoadInfo,
      onLoadProgress,
      // Preload the same responsive candidate the rendered <img> will use,
      // so they share one network request instead of double-downloading.
      srcSet: computedSrcSet,
      sizes: computedSizes,
    });

    // Merge forwarded ref with internal ref
    const setRef = (node: HTMLImageElement | null) => {
      imgRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
      }
    };

    // ── Zoom ──────────────────────────────────────────────────────────────
    const [isZoomed, setIsZoomed] = useState(false);
    const zoomOpts = { ...ZOOM_DEFAULTS, ...zoomOptions };
    const zoomMode = zoom ? zoomOpts.mode : undefined;
    // Modal modes open a lightbox; inline modes magnify in place.
    const isModalZoom = zoomMode === 'lightbox' || zoomMode === 'fullscreen';
    const isInlineZoom = zoomMode === 'inline' || zoomMode === 'magnifier';
    // The image shown when zoomed — a dedicated high-res source, else src.
    const effectiveZoomSrc = zoomSrc ?? src;

    const setZoom = (open: boolean) => {
      setIsZoomed(open);
      onZoomChange?.(open);
    };

    const zoomProps: React.ImgHTMLAttributes<HTMLImageElement> = isModalZoom
      ? {
          role: 'button',
          tabIndex: 0,
          'aria-haspopup': 'dialog',
          onClick: (e) => {
            setZoom(true);
            onClick?.(e);
          },
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setZoom(true);
            }
            onKeyDown?.(e);
          },
        }
      : { onClick, onKeyDown };

    const resolvedCaption =
      zoomOpts.caption === true ? alt : typeof zoomOpts.caption === 'string' ? zoomOpts.caption : undefined;

    const lightbox =
      isModalZoom && isZoomed ? (
        <Lightbox
          src={effectiveZoomSrc}
          alt={alt}
          onClose={() => setZoom(false)}
          animation={zoomOpts.animation}
          animationDuration={zoomOpts.animationDuration}
          backdropColor={zoomOpts.backdropColor}
          caption={resolvedCaption}
          showToolbar={zoomOpts.showToolbar}
          toolbarItems={zoomOpts.toolbarItems}
          zoomStep={Math.max(0.1, zoomOpts.scale - 1)}
          closeOnBackdropClick={zoomOpts.closeOnBackdropClick}
          closeOnEsc={zoomOpts.closeOnEsc}
          showCloseButton={zoomOpts.showCloseButton}
          startFullscreen={zoomMode === 'fullscreen'}
          imageClassName={zoomOpts.className}
          imageStyle={zoomOpts.style}
        />
      ) : null;

    const isLoaded = loadState === 'loaded';
    const showSkeleton = skeleton && !isLoaded;
    const showBlur = placeholder === 'blur' && !isLoaded;
    // Based on the *configured* props, not the transient loading state — the
    // wrapper (and the <img> inside it) must stay mounted across the loaded
    // transition, or the <img> gets torn down and recreated already in its
    // final style, defeating `transition` (and the default crossfade).
    const needsWrapper = skeleton || placeholder === 'blur' || thumbnail != null;

    // `fade` is shorthand for `transition="fade"`. Ignored when `thumbnail`
    // is set, since that mode swaps `src` in place rather than revealing the
    // image over a hidden state.
    const effectiveTransition: TransitionKind | undefined =
      thumbnail != null ? undefined : (transition ?? (fade ? 'fade' : undefined));
    const transitionDurationMs = transitionDuration ?? 300;

    // Resolve the blur source: an explicit base64 LQIP wins; otherwise, with
    // `autoBlur`, derive a tiny image URL from `src` (e.g. `?w=24`). Falls back
    // to a solid color when neither is available.
    const blurSrc =
      blurDataURL ?? (autoBlur ? resolveUrl(src, blurWidth, srcSetBuilder) : undefined);

    // ── Plain <img> — no wrapper needed ──────────────────────────────────
    if (!needsWrapper) {
      const plainStyle: React.CSSProperties = {
        ...(aspectRatio != null ? { aspectRatio } : null),
        ...(objectFit != null ? { objectFit } : null),
        ...(objectPosition != null ? { objectPosition } : null),
        ...(isModalZoom ? { cursor: 'zoom-in' } : null),
        ...(effectiveTransition
          ? getTransitionStyle(effectiveTransition, isLoaded, transitionDurationMs)
          : null),
        ...style,
      };
      const img = (
        <img
          ref={(node) => {
            (elementRef as React.MutableRefObject<Element | null>).current = node;
            setRef(node);
          }}
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          srcSet={computedSrcSet}
          sizes={computedSizes}
          loading={loading}
          fetchPriority={fetchPriority}
          style={plainStyle}
          className={isInlineZoom ? undefined : className}
          onLoad={onLoad}
          onError={onError}
          {...restImgProps}
          {...zoomProps}
        />
      );
      if (isInlineZoom) {
        return (
          <ZoomMagnifier
            src={effectiveZoomSrc}
            mode={zoomMode as 'inline' | 'magnifier'}
            scale={zoomOpts.scale}
            magnifierSize={zoomOpts.magnifierSize}
            className={className}
          >
            {img}
          </ZoomMagnifier>
        );
      }
      return (
        <>
          {img}
          {lightbox}
        </>
      );
    }

    // ── Wrapper with overlays ─────────────────────────────────────────────
    const wrapperStyle: React.CSSProperties = {
      display: 'inline-block',
      position: 'relative',
      overflow: 'hidden',
      width:
        width != null
          ? typeof width === 'number'
            ? `${width}px`
            : width
          : undefined,
      height:
        height != null
          ? typeof height === 'number'
            ? `${height}px`
            : height
          : undefined,
      // Reserve space before load to prevent layout shift. When set, the height
      // can be derived from the width, so an explicit height isn't required.
      aspectRatio: aspectRatio != null ? aspectRatio : undefined,
    };

    const imgStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: objectFit ?? 'cover',
      objectPosition,
      cursor: isModalZoom ? 'zoom-in' : undefined,
      // Show thumbnail from the start (src swaps in place — no reveal to animate).
      // Otherwise use the requested transition, or the default opacity crossfade.
      ...(thumbnail != null
        ? { opacity: 1 }
        : effectiveTransition
          ? getTransitionStyle(effectiveTransition, isLoaded, transitionDurationMs)
          : { transition: 'opacity 0.4s ease', opacity: isLoaded ? 1 : 0 }),
      ...style,
    };

    const wrapper = (
      <span
        ref={(node) => {
          (elementRef as React.MutableRefObject<Element | null>).current = node;
        }}
        style={wrapperStyle}
        className={isInlineZoom ? undefined : className}
        aria-label={alt || undefined}
        role={alt ? 'img' : undefined}
      >
        {/* Blur placeholder */}
        {showBlur && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: blurSrc ? `url(${blurSrc})` : undefined,
              backgroundColor: blurSrc ? undefined : '#d1d5db',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: blurSrc ? 'blur(20px)' : undefined,
              transform: blurSrc ? 'scale(1.1)' : undefined,
              transition: 'opacity 0.4s ease',
            }}
          />
        )}

        {/* Skeleton shimmer */}
        {showSkeleton && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: skeletonColor,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent 0%, ${skeletonHighlightColor} 50%, transparent 100%)`,
                animation: '__si_shimmer 1.6s ease-in-out infinite',
              }}
            />
          </span>
        )}

        {/* The actual image */}
        <img
          ref={setRef}
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          srcSet={computedSrcSet}
          sizes={computedSizes}
          loading={loading}
          fetchPriority={fetchPriority}
          style={imgStyle}
          onLoad={onLoad}
          onError={onError}
          {...restImgProps}
          {...zoomProps}
        />
      </span>
    );

    if (isInlineZoom) {
      return (
        <ZoomMagnifier
          src={effectiveZoomSrc}
          mode={zoomMode as 'inline' | 'magnifier'}
          scale={zoomOpts.scale}
          magnifierSize={zoomOpts.magnifierSize}
          className={className}
        >
          {wrapper}
        </ZoomMagnifier>
      );
    }

    return (
      <>
        {wrapper}
        {lightbox}
      </>
    );
  }
);

SmartImage.displayName = 'SmartImage';
