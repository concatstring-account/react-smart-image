# react-smart-image

A drop-in replacement for `<img>` with lazy loading, WebP auto-detection, blur/LQIP placeholders, skeleton loaders, responsive images, priority/LCP preloading, aspect-ratio (prevents layout shift/CLS), click-to-zoom lightbox & magnifier, and retry logic — zero runtime dependencies, TypeScript-first.

**[🔗 Live Demo](https://react-smart-image.netlify.app/)**

## Installation

```bash
npm install @concatstring/react-smart-image
# or
yarn add @concatstring/react-smart-image
# or
pnpm add @concatstring/react-smart-image
```

**Peer dependencies:** React ≥ 18.0.0

---

## Quick Start

```tsx
import { SmartImage } from '@concatstring/react-smart-image';

// Drop-in replacement — works exactly like <img>
<SmartImage src="/photo.jpg" alt="A photo" width={800} height={600} />
```

---

## Examples

### Lazy Loading

Images only load when they scroll into the viewport (100 px before the edge).

```tsx
<SmartImage
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  lazy
/>
```

---

### Priority Loading (above-the-fold / LCP)

Load a hero or banner image with **maximum priority**. `priority` disables lazy
loading, sets `loading="eager"` and `fetchpriority="high"`, and injects a
`<link rel="preload" as="image">` into the document `<head>` so the browser
starts fetching it as early as possible — before it even reaches the `<img>` in
the markup.

```tsx
<SmartImage
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  priority
/>
```

Combine it with `responsive` — the preload link mirrors the rendered `<img>`
via `imagesrcset`/`imagesizes`, so the browser preloads the exact candidate it
will display (one request, not two):

```tsx
<SmartImage
  src="/hero.jpg"
  alt="Hero banner"
  priority
  responsive
  sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
/>
```

```html
<!-- injected into <head> -->
<link
  rel="preload"
  as="image"
  href="/hero.jpg"
  imagesrcset="/hero.jpg?w=480 480w, /hero.jpg?w=768 768w, /hero.jpg?w=1200 1200w"
  imagesizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
  fetchpriority="high"
/>
```

> Use `priority` **only** for the one or two images visible on first paint (hero
> banners, LCP images). Preloading everything competes for bandwidth and hurts
> performance. For everything below the fold, prefer `lazy`.

---

### Aspect Ratio (prevent layout shift)

Reserve the image's layout space **before it loads** using CSS `aspect-ratio`,
so surrounding content doesn't jump when the image arrives — improving your
Cumulative Layout Shift (CLS) score. Pass a number (`width / height`) or a raw
CSS string.

```tsx
{/* 16:9 — height is derived from the rendered width automatically */}
<SmartImage
  src="/photo.jpg"
  alt="Landscape"
  aspectRatio={16 / 9}
/>

{/* String form, and pinning the width */}
<SmartImage
  src="/photo.jpg"
  alt="Landscape"
  width={800}
  aspectRatio="16 / 9"
/>
```

With `aspectRatio` you no longer need to hard-code both `width` **and** `height`
to avoid layout shift — the box holds its shape from the first render.

#### Accepted values

`aspectRatio` takes a `number | string` and is passed straight to the CSS
[`aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
property. `16 / 9` isn't special syntax — it's plain JS arithmetic React
evaluates before the prop is passed (`16 / 9` → `1.777…`), a readable way to
write "1.777" while keeping the 16:9 intent obvious.

| Form | Example | Result |
|------|---------|--------|
| Ratio expression *(recommended)* | `aspectRatio={16 / 9}` | `1.777…` — width ÷ height |
| | `aspectRatio={4 / 3}` | `1.333…` |
| | `aspectRatio={1 / 1}` | `1` (square) |
| | `aspectRatio={9 / 16}` | `0.5625` (portrait) |
| | `aspectRatio={21 / 9}` | `2.333…` (ultrawide) |
| Plain number | `aspectRatio={1.7778}` | same as `16 / 9` |

> With the **number** form `{16 / 9}` JavaScript does the division; with the
> **string** form `"16 / 9"` the `/` stays literal inside the quotes. Both end
> up as valid CSS.

Given a width (explicit or from the layout), the browser derives the height from
the ratio **before the image loads**, so you usually don't need to set `height`
at all.

---

### Skeleton Loader

Shows an animated shimmer while the image loads. Requires `width` and `height` so the placeholder has the right dimensions.

```tsx
<SmartImage
  src="/avatar.jpg"
  alt="User avatar"
  width={80}
  height={80}
  skeleton
/>
```

The skeleton colors are configurable for dark themes or brand styling — pass any CSS color:

```tsx
<SmartImage
  src="/avatar.jpg"
  alt="User avatar"
  width={80}
  height={80}
  skeleton
  skeletonColor="#1f2937"
  skeletonHighlightColor="rgba(255,255,255,0.12)"
/>
```

---

### Blur Placeholder (LQIP)

Show a blurred low-quality preview while the full image loads. Pass a tiny base64-encoded version of the image as `blurDataURL`.

```tsx
<SmartImage
  src="/landscape.jpg"
  alt="Mountain landscape"
  width={1200}
  height={800}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgAB..." // tiny LQIP
/>
```

**Auto blur (no manual base64).** If your images are served by a CDN/host that resizes
via the URL (e.g. CloudFront, Cloudinary, imgix), use `autoBlur` to derive the preview
from a tiny version of `src` automatically — no `blurDataURL` needed:

```tsx
<SmartImage
  src="/landscape.jpg"
  alt="Mountain landscape"
  width={1200}
  height={800}
  placeholder="blur"
  autoBlur          // fetches /landscape.jpg?w=24 and blurs it
  blurWidth={24}    // optional — tiny preview width (default 24)
/>
```

`autoBlur` reuses `srcSetBuilder` if provided, so it matches your host's URL shape.
Requires a host that resizes by URL; on a non-resizing host it would fetch the full
image, so prefer `blurDataURL` there. If neither `blurDataURL` nor `autoBlur` is set,
a solid gray block is shown instead.

---

### Error Fallback

Show a fallback image when the original fails to load (after all retries).

```tsx
<SmartImage
  src="/might-fail.jpg"
  alt="Product photo"
  width={400}
  height={400}
  fallback="/images/placeholder.png"
/>
```

---

### Retry on Failure

Automatically retry failed loads with exponential backoff (`retryDelay * 2^attempt` ms).

```tsx
<SmartImage
  src="/flaky-cdn.jpg"
  alt="CDN image"
  width={400}
  height={300}
  retry={3}
  retryDelay={500}
  fallback="/images/placeholder.png"
/>
```

---

### WebP Auto-Detection

Attempt to load a `.webp` version of the image first. If it fails, the component falls back to the original source automatically.

```tsx
// Tries /photo.webp first, falls back to /photo.jpg on failure
<SmartImage
  src="/photo.jpg"
  alt="Product"
  width={600}
  height={400}
  webp
/>
```

Supported source formats for WebP conversion: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`.

---

### Thumbnail / Progressive Loading

Display a low-quality thumbnail immediately while the full-resolution image loads in the background.

```tsx
<SmartImage
  src="/high-res.jpg"
  alt="Gallery image"
  width={1200}
  height={900}
  thumbnail="/low-res-thumb.jpg"
/>
```

---

### Responsive Images

Serve a size-appropriate image per viewport. There are two ways to do it — pick one:

#### Option A — Generate from breakpoints

Pass `responsive` with a `sizes` object. Each breakpoint width is appended to `src` as
`?w=<width>` (the convention used by image CDNs like Cloudinary, imgix, and Next.js):

```tsx
<SmartImage
  src="/banner.jpg"
  alt="Banner"
  responsive
  sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
/>
```

```html
<!-- generated -->
<img
  srcset="/banner.jpg?w=480 480w, /banner.jpg?w=768 768w, /banner.jpg?w=1200 1200w"
  sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
/>
```

> **Heads up — device pixel ratio.** With `srcSet`, the browser multiplies the slot
> width by the screen's DPR. On a 2× phone a 480px slot needs 960px, so it may load
> the 1200w file for sharpness. That's correct behavior. If you want a mobile *screen*
> to always load the mobile image regardless of DPR, use the `viewport` strategy below.

#### Strategy: `viewport` — always match the screen, ignore DPR

Add `strategy="viewport"` to pick the breakpoint by media query only and render a single
`src` (no `srcSet`). A mobile screen then always loads the mobile image — smallest bytes,
no DPR upscaling:

```tsx
<SmartImage
  src="/banner.jpg"
  alt="Banner"
  responsive
  strategy="viewport"
  sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
/>
```

| Screen | `srcset` strategy (default) | `viewport` strategy |
|--------|-----------------------------|---------------------|
| Mobile @1× | 480w | **480w** |
| Mobile @2× | 1200w (DPR-aware) | **480w** (always mobile) |
| Desktop | 1200w | 1200w |

Breakpoints: `mobile` ≤ 640px, `tablet` ≤ 1024px, `desktop` above. Updates live on resize.

#### Custom URL shape — `srcSetBuilder`

By default every responsive width is requested as `src?w=<width>` (the convention used
by Cloudinary, imgix, CloudFront, Next.js, and most resize servers). That query-param
shape doesn't fit every host — some encode the size in the **path** or **filename**
(`/photo-480.jpg`, `/w_480/photo.jpg`). Pass `srcSetBuilder` to map a base `src` and a
width to whatever URL your host expects:

```tsx
<SmartImage
  src="/photo.jpg"
  alt="Banner"
  responsive
  sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
  // Filename-pattern host: /photo.jpg → /photo-480.jpg
  srcSetBuilder={(src, width) => src.replace(/(\.\w+)$/, `-${width}$1`)}
/>
```

```html
<!-- generated -->
<img
  srcset="/photo-480.jpg 480w, /photo-768.jpg 768w, /photo-1200.jpg 1200w"
  sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
/>
```

**When to use it**

- Your host puts the size in the path/filename instead of a `?w=` query param.
- Your CDN uses a different param name or transform syntax (e.g. imgix `?w=`, Cloudinary
  `/w_480/`, Thumbor `/480x0/`).
- You want a single place that controls the resized-URL shape — it's reused by the
  `srcset` strategy, the `viewport` strategy, **and** `autoBlur`, so the tiny blur
  preview and the responsive candidates all match your host.

**When you don't need it**

- Your host already accepts `?w=<width>` (most CDNs do) — the built-in default works,
  leave `srcSetBuilder` off.

> The signature is `(src: string, width: number) => string`. It's called once per
> breakpoint width (and once at `blurWidth` when `autoBlur` is on). Keep it pure — it
> may run on every resize.

### Click-to-Zoom (Lightbox)

Add `zoom` to make the image open a fullscreen lightbox preview when clicked —
ideal for product photos, portfolios, and galleries. No extra markup or CSS
required.

```tsx
<SmartImage
  src="/product.jpg"
  alt="Product photo"
  width={400}
  height={400}
  zoom
/>
```

The lightbox is fully keyboard accessible and dismissable:

- **Open** — click the image, or focus it and press **Enter** / **Space**
- **Close** — press **Escape**, click the **×** button, or click the backdrop
  (clicking the image itself keeps it open)

It renders through a React portal into `<body>` (so it escapes any
`overflow: hidden`/`transform` ancestors), locks background scroll while open,
moves focus to the close button, and exposes `role="dialog"` + `aria-modal`.

#### `zoomOptions` — everything in one prop

Configure the whole experience through a single `zoomOptions` object:

```tsx
<SmartImage
  src="/thumb.jpg"
  alt="Product photo"
  zoom
  zoomSrc="/full-4000px.jpg"     // separate high-res image for the zoomed view
  onZoomChange={(open) => console.log(open ? 'opened' : 'closed')}
  zoomOptions={{
    mode: 'magnifier',           // 'lightbox' | 'inline' | 'magnifier' | 'fullscreen'
    animation: 'scale',          // 'fade' | 'scale' | 'zoom' | 'slide' | 'none'
    animationDuration: 300,
    scale: 2.5,                  // magnification (inline/magnifier + toolbar steps)
    magnifierSize: 180,          // lens diameter in px (magnifier mode)
    showToolbar: true,
    toolbarItems: ['zoomIn', 'zoomOut', 'reset', 'download', 'fullscreen'],
    caption: true,               // show `alt` as a caption (or pass a string)
    backdropColor: 'rgba(0,0,0,0.9)',
    closeOnBackdropClick: true,
    closeOnEsc: true,
    showCloseButton: true,
  }}
/>
```

**Modes**

| Mode | Behavior |
|------|----------|
| `lightbox` *(default)* | Click opens a lightbox popup. |
| `fullscreen` | Like `lightbox`, but also enters the browser **Fullscreen API**. |
| `inline` | Magnifies the image **in place** while hovering (no modal). |
| `magnifier` | A **magnifier lens** follows the cursor over the image (no modal). |

**Animations** (lightbox modes): `fade`, `scale`, `zoom`, `slide`, `none` — with `animationDuration` (ms).

**Toolbar** (lightbox modes): set `showToolbar` and pick buttons via `toolbarItems` — `zoomIn`, `zoomOut`, `reset`, `download`, `fullscreen`. Zoom steps are derived from `scale`.

**High-res source:** `zoomSrc` shows a different (usually larger) image when zoomed while the inline `<img>` keeps using `src`. **Callback:** `onZoomChange(isOpen)` fires on open/close (analytics, pausing background media).

> `inline` and `magnifier` magnify in place, so the lightbox-only options (animation,
> toolbar, caption, close controls) don't apply to them.

---

### Visibility Callback

Get notified the first time an image scrolls into the viewport — perfect for
impression tracking, analytics, and marketing events. Works with or without
`lazy` and fires only once.

```tsx
<SmartImage
  src="/banner.jpg"
  alt="Promo banner"
  lazy
  onVisible={() => {
    analytics.track('banner_impression', { id: 'summer-sale' });
  }}
/>
```

Uses the same 100 px pre-load margin as lazy loading, so it fires just before
the image edge reaches the viewport.

---

### Load Info Callback

Get timing, dimensions, and cache-hit data once the image finishes loading.

```tsx
<SmartImage
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  onLoadInfo={({ loadTime, width, height, fromCache }) => {
    console.log(`Loaded in ${loadTime}ms — ${width}×${height} (cache: ${fromCache})`);
  }}
/>
```

---

### Combining Features

```tsx
<SmartImage
  src="/product.jpg"
  alt="Product photo"
  width={600}
  height={600}
  lazy
  skeleton
  webp
  fallback="/images/placeholder.png"
  retry={2}
  retryDelay={1000}
  onLoadInfo={({ loadTime }) => console.log(`Loaded in ${loadTime}ms`)}
/>
```

---

## Prop Reference

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | **Required.** Image source URL. |
| `alt` | `string` | `""` | Alt text for accessibility. |
| `width` | `number \| string` | — | Width of the image or wrapper. |
| `height` | `number \| string` | — | Height of the image or wrapper. |

All standard `<img>` HTML attributes (`className`, `style`, `onClick`, `onLoad`, `onError`, `loading`, etc.) are forwarded to the underlying `<img>` element. `ref` is also forwarded via `forwardRef`.

---

### Loading & Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lazy` | `boolean` | `false` | Delay loading until the image enters the viewport (100 px margin). Ignored when `priority` is set. |
| `priority` | `boolean` | `false` | Load with maximum priority for above-the-fold/LCP images: disables lazy loading, sets `loading="eager"` + `fetchpriority="high"`, and injects a `<link rel="preload" as="image">` (responsive-aware) into `<head>`. |
| `aspectRatio` | `number \| string` | — | Reserve layout space before load via CSS `aspect-ratio` (a number as `width / height`, e.g. `16 / 9`, or a raw string like `"16 / 9"`). Prevents layout shift (improves CLS). |
| `zoom` | `boolean` | `false` | Enable zoom. By default clicking opens a fullscreen lightbox; configure via `zoomOptions`. Keyboard accessible. |
| `zoomSrc` | `string` | `src` | Separate (usually higher-res) image shown when zoomed, while the inline `<img>` keeps using `src`. |
| `zoomOptions` | `ZoomOptions` | — | Zoom configuration — see below. |
| `onZoomChange` | `(isOpen: boolean) => void` | — | Called when the zoom lightbox opens (`true`) or closes (`false`). |

**`ZoomOptions`**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | `'lightbox' \| 'inline' \| 'magnifier' \| 'fullscreen'` | `'lightbox'` | Trigger/presentation. `lightbox`/`fullscreen` open a popup; `inline`/`magnifier` magnify in place. |
| `animation` | `'fade' \| 'scale' \| 'zoom' \| 'slide' \| 'none'` | `'fade'` | Lightbox open/close animation. |
| `animationDuration` | `number` | `300` | Animation duration in ms. |
| `showToolbar` | `boolean` | `false` | Show the lightbox toolbar. |
| `toolbarItems` | `ZoomToolbarButton[]` | all | Buttons to show, in order: `zoomIn`, `zoomOut`, `reset`, `download`, `fullscreen`. |
| `scale` | `number` | `2` | Magnification for `inline`/`magnifier` and toolbar zoom steps. |
| `magnifierSize` | `number` | `160` | Lens diameter (px) in `magnifier` mode. |
| `backdropColor` | `string` | `'rgba(0,0,0,0.85)'` | Lightbox backdrop color. |
| `caption` | `boolean \| string` | — | Caption under the zoomed image (`true` = use `alt`). |
| `closeOnBackdropClick` | `boolean` | `true` | Close on backdrop click. |
| `closeOnEsc` | `boolean` | `true` | Close on Escape. |
| `showCloseButton` | `boolean` | `true` | Show the × close button. |
| `className` / `style` | `string` / `CSSProperties` | — | Applied to the zoomed `<img>`. |

---

### Placeholders

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skeleton` | `boolean` | `false` | Show an animated shimmer skeleton while loading. |
| `skeletonColor` | `string` | `"#e5e7eb"` | Base background color of the skeleton (any CSS color). |
| `skeletonHighlightColor` | `string` | `"rgba(255,255,255,0.55)"` | Color of the moving shimmer highlight (any CSS color). |
| `placeholder` | `"blur"` | — | Show a blurred preview while loading. Requires `width` and `height`. |
| `blurDataURL` | `string` | — | Base64 data URL of a tiny (e.g. 10×10 px) version of the image used as the blur source. |
| `autoBlur` | `boolean` | `false` | Derive the blur preview from a tiny version of `src` (via the URL builder) instead of passing `blurDataURL`. Needs a host that resizes by URL. |
| `blurWidth` | `number` | `24` | Width (px) of the tiny image fetched for `autoBlur`. |
| `thumbnail` | `string` | — | URL of a low-quality image shown immediately while the full image loads. |

> `skeleton` and `placeholder="blur"` can be used independently. When combined, both layers are rendered but the skeleton takes visual priority.

---

### WebP

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `webp` | `boolean` | `false` | Try a `.webp` version of `src` first; fall back to the original on failure. |

---

### Error Handling & Retry

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fallback` | `string` | — | URL to display when the image fails to load after all retries. |
| `retry` | `number` | `0` | Number of times to retry a failed load. |
| `retryDelay` | `number` | `1000` | Base delay (ms) between retries. Each retry doubles the delay (exponential backoff). |

---

### Responsive Images

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `responsive` | `boolean` | `false` | Enable auto-generated `srcSet` and `sizes` attributes. |
| `strategy` | `"srcset" \| "viewport"` | `"srcset"` | `"srcset"` lets the browser pick (DPR-aware). `"viewport"` picks by media query only and renders a single `src` — a mobile screen always gets the mobile image. |
| `sizes` | `ResponsiveSizes \| string` | — | Object of pixel widths per breakpoint (builds `srcSet`/`sizes`), **or** a raw `sizes` string passed straight through when you supply your own `srcSet`. |
| `srcSetBuilder` | `(src: string, width: number) => string` | `` `${src}?w=${width}` `` | Maps the base `src` and a breakpoint width to the URL for that width. Override for hosts that encode size in the path/filename. Reused by the `srcset` and `viewport` strategies and by `autoBlur`. |

```ts
interface ResponsiveSizes {
  mobile?: number;   // used for max-width: 640px
  tablet?: number;   // used for max-width: 1024px
  desktop?: number;  // default (no media query)
}
```

---

### Callbacks

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLoadInfo` | `(info: LoadInfo) => void` | — | Called once after a successful load with performance and dimension data. |
| `onVisible` | `() => void` | — | Called once the first time the image scrolls into the viewport (100 px margin). Fires with or without `lazy`. Useful for impression/analytics tracking. |

```ts
interface LoadInfo {
  loadTime: number;   // ms from load start to completion
  width: number;      // naturalWidth of the loaded image
  height: number;     // naturalHeight of the loaded image
  fromCache: boolean; // true if the result was served from internal cache
}
```

---

## Cache Utilities

The component keeps an in-memory cache of load results to avoid re-fetching images within the same session.

```tsx
import { clearImageCache, invalidateImageCache } from '@concatstring/react-smart-image';

// Clear all cached entries
clearImageCache();

// Invalidate a single image (e.g. after an upload that replaces the file)
invalidateImageCache('/uploads/avatar.jpg');
```

---

## TypeScript

All types are exported from the package root:

```ts
import type {
  SmartImageProps,
  LoadInfo,
  ResponsiveSizes,
  ZoomOptions,
  ZoomMode,
  ZoomAnimation,
  ZoomToolbarButton,
} from '@concatstring/react-smart-image';
```

---

## How Wrapper Rendering Works

`SmartImage` renders a bare `<img>` whenever possible. A `<span>` wrapper is only added when one of these props requires overlay layers:

- `skeleton`
- `placeholder="blur"`
- `thumbnail`

In wrapper mode the `className` is applied to the `<span>`, not the inner `<img>`.

---

## Reporting Issues

Found a bug or have a feature request? Please open an issue:

👉 https://github.com/concatstring-account/react-smart-image/issues

---

## License

MIT
