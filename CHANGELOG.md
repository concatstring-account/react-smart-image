# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-07-29

### Added

- **Modern image formats (AVIF)** — new `avif` prop probes for an `.avif` version of the image before `webp`/the original. New `format="auto"` shorthand enables both `avif` and `webp` in one go, probing in order `.avif` → `.webp` → original.
- **Configurable load transitions** — new `transition` prop replaces the fixed opacity crossfade with a choice of 9 animation kinds: `'none'`, `'fade'`, `'flip'`, `'rotate'`, `'grow'`, `'scale'`, `'slide-up'`, `'slide-left'`, `'reveal'`. New `transitionDuration` prop (default `300`ms) and `fade` shorthand (equivalent to `transition="fade"`). Ignored when `thumbnail` is set, since that mode swaps `src` in place rather than revealing over a hidden state. New exported `TransitionKind` type.
- **`SmartImageProvider`** — wrap your app once and every `SmartImage` underneath inherits shared default props (`defaults`) via `useSmartImageContext()`, so app-wide behavior (`responsive`, `retry`, `placeholder`, `transition`, etc.) doesn't need to be repeated on every image. A prop set directly on a `SmartImage` always overrides the provider's defaults. Nesting providers replaces `defaults`/`presets` entirely for that subtree (not cumulative).
- **Image presets** — `createImagePresets()` defines named, reusable prop configurations (e.g. `hero`, `product`, `avatar`) registered on the provider via a new `presets` prop and applied per-image with `<SmartImage preset="hero" src="..." />`.
  - Final prop resolution order: **component props > `preset` config > provider `defaults` > library defaults**.
  - An unrecognized `preset` name logs a console warning (once) and falls back to just the provider defaults + component props, rather than throwing.
  - New exported types: `SmartImagePresetConfig`, `SmartImagePresetMap`.
  - New `preset` prop on `SmartImage` / `SmartImageProps`.
- **`LICENSE`** file added (MIT).

### Fixed

- **`onLoadInfo` cache reporting** — previously, if an image was already loaded and cached, `onLoadInfo` never fired at all on a subsequent render. It now fires with `fromCache: true` and an accurate (near-instant) `loadTime`, so callers relying on `onLoadInfo` for analytics see every load, including cache hits.

> Note: skeleton loaders and basic `webp` detection are **not** new in this release — both shipped back in v1.0.0. This release adds `avif` alongside them and lets you fully customize the loading-to-loaded *transition*, not the skeleton itself.

## [2.0.0] - 2026-07-09

### Added

- **Priority loading (LCP)** — new `priority` prop. Sets `loading="eager"` and `fetchpriority="high"`, disables lazy loading, and injects a `<link rel="preload" as="image">` (with responsive `imagesrcset`/`imagesizes` when applicable) into the document `<head>` so above-the-fold hero images start fetching as early as possible.
- **Aspect ratio (CLS prevention)** — new `aspectRatio` prop. Reserves layout space before the image loads via CSS `aspect-ratio`. Accepts a number (`width / height`, e.g. `16 / 9`) or a raw CSS string (e.g. `"16 / 9"`).
- **Click-to-zoom** — new `zoom`, `zoomSrc`, `zoomOptions`, and `onZoomChange` props, backed by two new components: `Lightbox` and `ZoomMagnifier`.
  - Four zoom modes via `zoomOptions.mode`: `'lightbox'` (default, click opens a modal), `'fullscreen'` (lightbox + Fullscreen API), `'inline'` (in-place magnify on hover), `'magnifier'` (cursor-following lens).
  - Configurable open/close `animation` (`fade` / `scale` / `zoom` / `slide` / `none`) and `animationDuration`.
  - Optional toolbar (`showToolbar`, `toolbarItems`) with zoom in/out, reset, download, and fullscreen actions.
  - Configurable `scale`, `magnifierSize`, `backdropColor`, `caption`, `closeOnBackdropClick`, `closeOnEsc`, `showCloseButton`, plus `className`/`style` for the zoomed image.
  - `zoomSrc` lets a thumbnail open to a separate, higher-resolution image while the inline `<img>` keeps using `src`.
- **`onVisible` callback** — fires once, the first time the image scrolls into the viewport (100px pre-load margin), independent of `lazy`. Useful for impression/analytics tracking.
- New exported types: `ZoomMode`, `ZoomAnimation`, `ZoomToolbarButton`, `ZoomOptions`.

### Removed

- **`densities` prop** removed from the responsive `srcset` API (previously controlled which pixel-density candidates — e.g. `[1, 2]` — were generated per breakpoint).

### Changed

- Expanded test coverage in `src/__tests__/SmartImage.test.tsx` for the new priority, aspect-ratio, zoom, and visibility behaviors.
- `useIntersectionObserver` hook updated to support the new `onVisible` visibility tracking.
- README significantly expanded with documentation for all new features.
- Package description and `package.json` metadata updated to reflect the broader feature set.
