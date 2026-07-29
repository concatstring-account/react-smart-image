<div align="center">

# 🚀 React Smart Image

A drop-in replacement for the native `<img>` element with **lazy loading, responsive images, blur placeholders, skeleton loaders, AVIF/WebP detection, click-to-zoom, and automatic retry** built in — delivering better performance, UX, and DX with zero runtime dependencies.

**Lazy Loading • Responsive Images • Blur Placeholder • Skeleton Loader • Image Zoom • Retry Logic • AVIF/WebP • Core Web Vitals • TypeScript**

<br/>

[![npm version](https://img.shields.io/npm/v/@concatstring/react-smart-image.svg)](https://www.npmjs.com/package/@concatstring/react-smart-image)
[![npm downloads](https://img.shields.io/npm/dm/@concatstring/react-smart-image.svg)](https://www.npmjs.com/package/@concatstring/react-smart-image)
[![License](https://img.shields.io/npm/l/@concatstring/react-smart-image.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success)](#)
[![SSR Friendly](https://img.shields.io/badge/SSR-Friendly-blue)](#)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@concatstring/react-smart-image)](https://bundlephobia.com/package/@concatstring/react-smart-image)

### ⚡ Built for Performance • Accessibility • Developer Experience

🌐 **Live Demo:** https://react-smart-image.netlify.app

</div>

# 🚀 Why React Smart Image?

Modern React applications often require multiple libraries just to build a complete image experience.

One library for lazy loading.

Another for blur placeholders.

Another for responsive images.

Another for zoom.

Another for retry logic.

Managing all of these increases dependencies, bundle size, and maintenance.

**React Smart Image solves this by combining everything into one lightweight, production-ready component.**

Simply install one package and start building.

<a id="installation"></a>

# Installation

```bash
npm install @concatstring/react-smart-image
```

or

```bash
yarn add @concatstring/react-smart-image
```

or

```bash
pnpm add @concatstring/react-smart-image
```

### Peer Dependencies

```bash
react >= 18
react-dom >= 18
```

<a id="quick-start"></a>

# Quick Start

Using React Smart Image is as simple as replacing your existing `<img>`.

```jsx
import { SmartImage } from "@concatstring/react-smart-image";

export default function App() {
  return (
    <SmartImage
      src="/photo.jpg"
      alt="Beautiful landscape"
      width={800}
      height={600}
    />
  );
}
```

That's it.

No configuration.

No provider required.

Works exactly like a normal image.

## One Component. Everything Built In.

Enable multiple powerful features with simple props.

```jsx
<SmartImage
  src="/product.jpg"
  alt="Product"
  lazy
  responsive
  skeleton
  placeholder="blur"
  format="auto"
  zoom
  retry={2}
  fallback="/images/placeholder.png"
/>
```

Instead of combining multiple image libraries, React Smart Image provides everything in one component.

# ✨ Features

## 🚀 Performance

![Lazy Loading](https://img.shields.io/badge/Lazy_Loading-✓-success)
![LCP Optimized](https://img.shields.io/badge/LCP-Optimized-blue)
![Responsive Images](https://img.shields.io/badge/Responsive-Images-success)
![CLS Prevention](https://img.shields.io/badge/CLS-Prevention-success)
![AVIF/WebP Auto](https://img.shields.io/badge/AVIF/WebP-Auto-orange)

- ✅ Lazy Loading
- ✅ Priority Loading
- ✅ Responsive Images
- ✅ Aspect Ratio
- ✅ Image Preloading
- ✅ AVIF & WebP Detection
- ✅ Progressive Thumbnail Loading

## 🎨 User Experience

![Blur Placeholder](https://img.shields.io/badge/Blur-Placeholder-purple)
![Skeleton Loader](https://img.shields.io/badge/Skeleton-Loader-blueviolet)
![Image Zoom](https://img.shields.io/badge/Image-Zoom-red)
![Magnifier Lens](https://img.shields.io/badge/Magnifier-Lens-orange)

- ✅ Blur Placeholder
- ✅ Skeleton Loader
- ✅ Smooth Image Transitions
- ✅ Click to Zoom
- ✅ Magnifier Lens
- ✅ Fullscreen Viewer

## 🛡 Reliability

![Retry Automatic](https://img.shields.io/badge/Retry-Automatic-success)
![Fallback Supported](https://img.shields.io/badge/Fallback-Supported-blue)
![Image Cache](https://img.shields.io/badge/Image-Cache-orange)

- ✅ Automatic Retry
- ✅ Exponential Backoff
- ✅ Error Fallback Images
- ✅ Image Cache Utilities

## ⚛️ Developer Experience

![TypeScript First](https://img.shields.io/badge/TypeScript-First-blue)
![SSR Friendly](https://img.shields.io/badge/SSR-Friendly-success)
![SmartImageProvider Built-In](https://img.shields.io/badge/SmartImageProvider-Built--In-purple)
![Image Presets](https://img.shields.io/badge/Image-Presets-orange)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen)

- ✅ Drop-in `<img>` Replacement
- ✅ Zero Runtime Dependencies
- ✅ TypeScript First
- ✅ SmartImageProvider
- ✅ Image Presets
- ✅ Responsive URL Builder
- ✅ Analytics Callbacks
- ✅ SSR Friendly

## 🏆 Feature Comparison

| Feature | HTML `<img>` | Next.js Image | React Smart Image |
|----------|-------------|---------------|-------------------|
| Lazy Loading | ✅ | ✅ | ✅ |
| Responsive Images | ❌ | ✅ | ✅ |
| Blur Placeholder | ❌ | ✅ | ✅ |
| Skeleton Loader | ❌ | ❌ | ✅ |
| Retry Failed Images | ❌ | ❌ | ✅ |
| Error Fallback | ❌ | ❌ | ✅ |
| Zoom Viewer | ❌ | ❌ | ✅ |
| Magnifier Lens | ❌ | ❌ | ✅ |
| Image Presets | ❌ | ❌ | ✅ |
| Global Provider | ❌ | ❌ | ✅ |
| AVIF/WebP Auto Detection | ❌ | ❌ | ✅ |
| Progressive Thumbnail | ❌ | ❌ | ✅ |
| TypeScript | ❌ | ✅ | ✅ |
| Framework Independent | ✅ | ❌ | ✅ |

## Choose the Right Feature

| Your Goal | Feature |
|------------|----------|
| Improve LCP | `priority` |
| Improve CLS | `aspectRatio` |
| Faster Loading | `responsive` |
| Better UX | `placeholder="blur"` |
| Loading Animation | `skeleton` |
| Product Gallery | `zoom` |
| Magnifying Glass | `magnifier` |
| Broken Image | `fallback` |
| Retry Failed Images | `retry` |
| Modern Formats | `format="auto"` |

# Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Lazy Loading](#lazy-loading)
- [Priority Loading](#priority-loading-lcp)
- [Aspect Ratio](#aspect-ratio-prevent-cls)
- [Skeleton Loader](#skeleton-loader)
- [Blur Placeholder](#blur-placeholder-lqip)
- [Image Transition](#load-transitions)
- [Responsive Images](#responsive-images)
- [AVIF & WebP](#modern-image-formats)
- [Thumbnail Loading](#progressive-thumbnail-loading)
- [Zoom](#image-zoom)
- [Retry & Fallback](#retry-failed-images)
- [SmartImageProvider](#smartimageprovider)
- [Image Presets](#image-presets)
- [Performance Tips](#performance-tips)
- [TypeScript](#typescript)
- [API Reference](#api-reference)
- [FAQ](#faq)
- [License](#license)

# Core Features

<a id="lazy-loading"></a>

## Lazy Loading

Load images only when they're about to enter the viewport, reducing initial page load time and bandwidth usage.

Perfect for:

- Blog posts
- Product listings
- Galleries
- Long pages

```jsx
<SmartImage
  src="/gallery.jpg"
  alt="Gallery Image"
  width={800}
  height={500}
  lazy
/>
```

### How it works

- Uses Intersection Observer
- Starts loading 100px before entering the viewport
- Automatically disabled when `priority` is enabled

> 💡 Use `lazy` for every image that is **below the fold**.

<a id="priority-loading-lcp"></a>

## Priority Loading (LCP)

Priority images are loaded immediately with the highest browser priority.

Ideal for:

- Hero banners
- Landing page images
- First visible product image
- Largest Contentful Paint (LCP)

```jsx
<SmartImage
  src="/hero.jpg"
  alt="Hero"
  width={1600}
  height={700}
  priority
/>
```

When enabled, React Smart Image automatically:

- disables lazy loading
- sets `loading="eager"`
- sets `fetchpriority="high"`
- injects `<link rel="preload">`

Combine it with `responsive` — the preload link mirrors the rendered image via `imagesrcset`/`imagesizes`, so the browser preloads the exact candidate it will display (one request, not two):

```jsx
<SmartImage
  src="/hero.jpg"
  alt="Hero"
  priority
  responsive
  sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
/>
```

```html
<link
  rel="preload"
  as="image"
  href="/hero.jpg"
  imagesrcset="/hero.jpg?w=480 480w, /hero.jpg?w=768 768w, /hero.jpg?w=1200 1200w"
  imagesizes="(max-width:640px)480px,(max-width:1024px)768px,1200px"
  fetchpriority="high"
/>
```

> ⚠️ Only use `priority` for one or two images per page.

<a id="aspect-ratio-prevent-cls"></a>

## Aspect Ratio (Prevent CLS)

Reserve image space before it loads to eliminate layout shifts and improve Core Web Vitals.

```jsx
<SmartImage src="/banner.jpg" alt="Banner" aspectRatio={16 / 9} />
```

Or:

```jsx
<SmartImage src="/banner.jpg" alt="Banner" width={1200} aspectRatio="16 / 9" />
```

Supported values:

```jsx
aspectRatio={16 / 9}
aspectRatio={4 / 3}
aspectRatio={1}
aspectRatio="21 / 9"
```

`aspectRatio` accepts a `number | string`, passed straight to the CSS [`aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio) property. `{16 / 9}` isn't special syntax — it's plain JS division evaluated before the prop reaches CSS (`16 / 9` → `1.777…`), just a readable way to write "1.777" while keeping the 16:9 intent obvious.

> With the **number** form `{16 / 9}` JavaScript does the division; with the **string** form `"16 / 9"` the `/` stays literal inside the quotes. Both end up as valid CSS.

> 💡 Using `aspectRatio` means you usually don't need to specify `height`.

<a id="skeleton-loader"></a>

## Skeleton Loader

Display an animated loading placeholder while the image downloads.

> ℹ️ Requires `width` and `height` (or `aspectRatio`) so the placeholder has the right dimensions.

```jsx
<SmartImage src="/avatar.jpg" alt="Avatar" width={120} height={120} skeleton />
```

Customize the appearance:

```jsx
<SmartImage
  src="/avatar.jpg"
  alt="Avatar"
  width={120}
  height={120}
  skeleton
  skeletonColor="#1F2937"
  skeletonHighlightColor="rgba(255,255,255,.12)"
/>
```

Perfect for:

- User profiles
- Product cards
- Dashboards
- Social feeds

<a id="blur-placeholder-lqip"></a>

## Blur Placeholder (LQIP)

Display a tiny blurred preview until the full image loads.

> ℹ️ Requires `width` and `height` (or `aspectRatio`) so the placeholder has the right dimensions.

```jsx
<SmartImage
  src="/mountain.jpg"
  alt="Mountain"
  width={1200}
  height={700}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

Benefits

- Better perceived performance
- Smooth image loading
- Professional appearance

> 💡 `skeleton` and `placeholder="blur"` can be combined — both layers render, with the skeleton on top.

### Auto Blur

Don't want to generate Base64 placeholders? Enable automatic blur generation.

```jsx
<SmartImage
  src="/mountain.jpg"
  alt="Mountain"
  width={1200}
  height={700}
  placeholder="blur"
  autoBlur
/>
```

Customize preview size:

```jsx
<SmartImage autoBlur blurWidth={32} />
```

> ℹ️ Requires an image server or CDN capable of resizing images.

Examples:

- Cloudinary
- ImageKit
- Imgix
- CloudFront
- Thumbor

<a id="load-transitions"></a>

## Load Transitions

By default, `skeleton`/`placeholder="blur"` reveal the final image with a simple opacity crossfade — a plain `<SmartImage>` with neither set gets no fade at all unless you add `transition` or `fade`. `thumbnail` mode is different: the image swaps `src` in place with no fade to animate, so `transition`/`fade` are ignored there.

```jsx
<SmartImage src="/photo.jpg" alt="Photo" skeleton transition="scale" />
```

Available animations:

- fade
- scale
- grow
- rotate
- flip
- slide-up
- slide-left
- reveal
- none

Control animation duration:

```jsx
<SmartImage transition="fade" transitionDuration={500} />
```

Simple shorthand:

```jsx
<SmartImage src="/photo.jpg" fade />
```

> ⚠️ `transition` is ignored when `thumbnail` is set, since that mode swaps `src` in place rather than revealing over a hidden state.

<a id="progressive-thumbnail-loading"></a>

## Progressive Thumbnail Loading

Show a lightweight thumbnail instantly while the high-resolution image loads in the background.

```jsx
<SmartImage
  src="/photo-large.jpg"
  thumbnail="/photo-thumb.jpg"
  width={1200}
  height={800}
/>
```

Perfect for:

- Photography websites
- Product galleries
- Portfolio pages

<a id="modern-image-formats"></a>

## Modern Image Formats

Automatically serve AVIF or WebP when available.

```jsx
<SmartImage src="/banner.jpg" avif webp />
```

Or simply:

```jsx
<SmartImage src="/banner.jpg" format="auto" />
```

Loading order:

```
banner.avif → banner.webp → banner.jpg
```

Supported source formats:

- JPG
- JPEG
- PNG
- GIF
- BMP
- TIFF

<a id="retry-failed-images"></a>

## Retry Failed Images

Automatically retry failed image requests.

```jsx
<SmartImage src="/cdn-image.jpg" retry={3} retryDelay={500} />
```

Retry timing:

```
Attempt 1 → 500ms
Attempt 2 → 1000ms
Attempt 3 → 2000ms
```

Uses exponential backoff to reduce unnecessary network traffic.

### Error Fallback

Display a replacement image when all retries fail.

```jsx
<SmartImage src="/missing-image.jpg" fallback="/images/no-image.png" />
```

Combine with retry:

```jsx
<SmartImage
  src="/cdn-image.jpg"
  retry={2}
  retryDelay={1000}
  fallback="/images/no-image.png"
/>
```

This provides the best user experience for unreliable networks.

## Combine Multiple Features

React Smart Image is designed so features work together seamlessly.

```jsx
<SmartImage
  src="/product.jpg"
  alt="Product"
  width={600}
  height={600}
  lazy
  responsive
  placeholder="blur"
  skeleton
  transition="fade"
  format="auto"
  retry={2}
  fallback="/images/placeholder.png"
/>
```

One component. Everything built in. No additional image libraries required.

<a id="responsive-images"></a>

## Responsive Images

Serve the right image for every screen size to improve loading performance and reduce bandwidth usage.

React Smart Image supports **two responsive strategies**:

- **srcSet** (default)
- **viewport**

### Strategy 1 — srcSet (Recommended)

Let the browser automatically choose the best image based on:

- Screen size
- Device Pixel Ratio (DPR)
- Browser capabilities

```jsx
<SmartImage
  src="/banner.jpg"
  alt="Banner"
  responsive
  sizes={{ mobile: 480, tablet: 768, desktop: 1400 }}
/>
```

Generated HTML:

```html
<img
  srcset="/banner.jpg?w=480 480w, /banner.jpg?w=768 768w, /banner.jpg?w=1400 1400w"
  sizes="(max-width:640px)480px,(max-width:1024px)768px,1400px"
/>
```

#### Best For

- Marketing websites
- Blogs
- Landing pages
- Ecommerce
- Most applications

### Strategy 2 — Viewport

Always load the image matching the viewport width.

```jsx
<SmartImage
  src="/banner.jpg"
  responsive
  strategy="viewport"
  sizes={{ mobile: 480, tablet: 768, desktop: 1400 }}
/>
```

Unlike `srcSet`, viewport ignores DPR. A mobile device always receives the mobile image.

Breakpoints: `mobile` ≤ 640px, `tablet` ≤ 1024px, `desktop` above. Updates live on resize.

#### Best For

- Saving bandwidth
- Internal dashboards
- Admin panels
- Mobile-first applications

### Strategy Comparison

| Feature | srcSet | viewport |
|----------|---------|----------|
| Browser chooses image | ✅ | ❌ |
| DPR Aware | ✅ | ❌ |
| Lowest bandwidth | ❌ | ✅ |
| Highest image quality | ✅ | ✅ |
| Recommended | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### Custom Image URLs

Different CDNs generate resized images differently. By default React Smart Image generates:

```text
/photo.jpg?w=480
```

If your CDN uses another format, provide a custom URL builder.

```jsx
<SmartImage
  src="/photo.jpg"
  responsive
  sizes={{ mobile: 480, tablet: 768, desktop: 1200 }}
  srcSetBuilder={(src, width) => src.replace(/(\.\w+)$/, `-${width}$1`)}
/>
```

Generated:

```text
/photo-480.jpg
/photo-768.jpg
/photo-1200.jpg
```

> ⚠️ `srcSetBuilder` should be a pure function — it's called once per breakpoint width (and again at `blurWidth` when `autoBlur` is on), and may re-run on every resize.

### CDN Examples

**Cloudinary**

```jsx
srcSetBuilder={(src, width) => `https://res.cloudinary.com/demo/image/upload/w_${width}${src}`}
```

**ImageKit**

```jsx
srcSetBuilder={(src, width) => `${src}?tr=w-${width}`}
```

**Imgix**

```jsx
srcSetBuilder={(src, width) => `${src}?w=${width}`}
```

**AWS CloudFront**

```jsx
srcSetBuilder={(src, width) => `${src}?width=${width}`}
```

**Bunny CDN**

```jsx
srcSetBuilder={(src, width) => `${src}?width=${width}`}
```

<a id="image-zoom"></a>

## Image Zoom

Enable beautiful image zoom with a single prop.

```jsx
<SmartImage src="/shoe.jpg" alt="Running Shoe" zoom />
```

By default, clicking the image opens a fullscreen lightbox.

### Zoom Modes

React Smart Image supports four zoom experiences.

| Mode | Description |
|------|-------------|
| lightbox | Fullscreen modal |
| inline | Zoom inside image |
| magnifier | Magnifying lens |
| fullscreen | Browser Fullscreen API |

### Lightbox

Perfect for galleries.

```jsx
<SmartImage src="/product.jpg" zoom />
```

### Inline Zoom

Magnify the image without opening a popup.

```jsx
<SmartImage
  src="/product.jpg"
  zoom
  zoomOptions={{ mode: "inline", scale: 2 }}
/>
```

### Magnifier Lens

Ideal for ecommerce product images.

```jsx
<SmartImage
  src="/product.jpg"
  zoom
  zoomOptions={{ mode: "magnifier", scale: 3, magnifierSize: 180 }}
/>
```

### Fullscreen

Use the browser Fullscreen API.

```jsx
<SmartImage src="/photo.jpg" zoom zoomOptions={{ mode: "fullscreen" }} />
```

> ⚠️ iOS Safari doesn't support the Fullscreen API on non-`<video>` elements. There, the lightbox still opens normally, but it silently stays windowed instead of entering true fullscreen.

### Custom High Resolution Image

Display a different image when zooming.

```jsx
<SmartImage src="/thumb.jpg" zoom zoomSrc="/original-4000px.jpg" />
```

Perfect for ecommerce product images.

### Zoom Toolbar

Enable built-in controls.

```jsx
<SmartImage
  zoom
  zoomOptions={{
    showToolbar: true,
    toolbarItems: ["zoomIn", "zoomOut", "reset", "download", "fullscreen"],
  }}
/>
```

> ⚠️ The `download` button uses the `download` attribute, which forces a save only for same-origin images (or cross-origin images served with the right CORS headers). Otherwise the browser may just open the image in a new tab instead.

### Zoom Animation

Choose the animation style.

```jsx
zoomOptions={{ animation: "scale" }}
```

Available:

- fade
- scale
- zoom
- slide
- none

Control animation duration:

```jsx
zoomOptions={{ animation: "scale", animationDuration: 500 }}
```

### Zoom Caption

Show a caption beneath the zoomed image.

```jsx
<SmartImage src="/product.jpg" zoom zoomOptions={{ caption: true }} />
```

`caption:true` uses the image's `alt` text automatically, or pass a custom string:

```jsx
zoomOptions={{ caption: "Available in 4 colors" }}
```

### Zoom Backdrop & Close Behavior

Customize the lightbox backdrop color and how it can be closed.

```jsx
zoomOptions={{
  backdropColor: "rgba(0,0,0,0.95)",
  closeOnBackdropClick: false,
  closeOnEsc: false,
  showCloseButton: false,
}}
```

| Option | Default |
|--------|---------|
| backdropColor | rgba(0,0,0,0.85) |
| closeOnBackdropClick | true |
| closeOnEsc | true |
| showCloseButton | true |

### Customizing the Zoomed Image

Apply a class name or inline style to the zoomed `<img>` inside the lightbox.

```jsx
zoomOptions={{ className: "my-zoomed-image", style: { borderRadius: 8 } }}
```

### Zoom Accessibility

The lightbox is fully keyboard accessible.

- **Open** — click the image, or focus it and press **Enter** / **Space**
- **Close** — press **Escape**, click the **×** button, or click the backdrop (clicking the image itself keeps it open)

It renders through a React portal into `<body>` (so it escapes any `overflow: hidden` / `transform` ancestors), locks background scroll while open, moves focus to the close button, and exposes `role="dialog"` + `aria-modal`.

<a id="smartimageprovider"></a>

## SmartImageProvider

Avoid repeating the same props everywhere. Wrap your application once.

```jsx
import { SmartImageProvider } from "@concatstring/react-smart-image";

function App() {
  return (
    <SmartImageProvider
      defaults={{
        responsive: true,
        retry: 2,
        placeholder: "blur",
        transition: "fade",
      }}
    >
      <AppRoutes />
    </SmartImageProvider>
  );
}
```

Every SmartImage automatically inherits these defaults. Individual component props always override provider defaults.

The merge is shallow and applies at the top level only — an object prop like `zoomOptions` set on the image replaces the provider's `zoomOptions` entirely rather than merging field-by-field. Nesting `SmartImageProvider`s is supported, but the closest provider's `defaults` (and `presets`) replace the outer one's rather than merging with it.

You can also set a default preset for every image, so `preset` doesn't need to be repeated on each one:

```jsx
<SmartImageProvider defaults={{ preset: "product" }} presets={presets}>
  <AppRoutes />
</SmartImageProvider>
```

An explicit `preset` prop on a `SmartImage` always overrides this default.

<a id="smartimageprovider-props"></a>

### SmartImageProvider Props

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| defaults | SmartImageDefaults | {} | Default SmartImage props; may include `preset` for an app-wide default |
| presets | SmartImagePresetMap | {} | Image preset collection |
| children | ReactNode | — | React children |

<a id="image-presets"></a>

## Image Presets

Presets let you define reusable image configurations. Instead of repeating props across your application, define them once.

```jsx
import { createImagePresets } from "@concatstring/react-smart-image";

const presets = createImagePresets({
  hero: { priority: true, responsive: true, transition: "fade" },
  product: { zoom: true, responsive: true, placeholder: "blur" },
  avatar: { width: 60, height: 60, skeleton: true },
});
```

Use a preset:

```jsx
<SmartImage preset="hero" src="/hero.jpg" alt="Hero" />
<SmartImage preset="product" src="/shoe.jpg" alt="Running Shoe" />
<SmartImage preset="avatar" src="/user.jpg" alt="User" />
```

Presets dramatically reduce repetitive code.

> 💡 `keyof typeof presets` gives you a typed union of preset names (e.g. `'hero' | 'product' | 'avatar'`) — handy for typing a `preset` prop on your own wrapper component.

> ⚠️ An unrecognized `preset` name logs a console warning and falls back to just the provider defaults + component props, rather than throwing.

### Provider + Presets

They work together.

```jsx
<SmartImageProvider defaults={{ retry: 2 }} presets={presets}>
  <App />
</SmartImageProvider>
```

Resolution order:

```
Component Props → Preset → Provider Defaults → Library Defaults
```

The closest value always wins.

### Common Recipes

**Hero Banner**

```jsx
<SmartImage preset="hero" src="/hero.jpg" alt="Hero" />
```

**Product Card**

```jsx
<SmartImage preset="product" src="/shoe.jpg" alt="Running Shoe" />
```

**User Avatar**

```jsx
<SmartImage preset="avatar" src="/avatar.jpg" alt="User" />
```

**Blog Thumbnail**

```jsx
<SmartImage src="/blog.jpg" responsive lazy placeholder="blur" />
```

**Gallery Image**

```jsx
<SmartImage src="/gallery.jpg" zoom responsive skeleton transition="fade" />
```

### Which Features Should I Use?

| Scenario | Recommended Features |
|-----------|----------------------|
| Hero Banner | priority + responsive |
| Product Gallery | zoom + responsive + placeholder |
| User Avatar | skeleton |
| Dashboard | lazy |
| Ecommerce | responsive + zoom + retry |
| Blog | lazy + blur |
| Portfolio | thumbnail + zoom |
| Marketing Page | priority + aspectRatio |
| Slow Network | autoBlur + retry |
| CDN Images | responsive + srcSetBuilder |

<a id="performance-tips"></a>

## Performance Tips

✅ Use `priority` only for above-the-fold images.

✅ Use `lazy` for all remaining images.

✅ Enable `responsive` whenever possible.

✅ Use `aspectRatio` to prevent layout shift.

✅ Prefer `format="auto"` for modern image formats.

✅ Combine `placeholder="blur"` with `responsive` for the best perceived performance.

✅ Use presets to keep image configuration consistent across your application.

# Callbacks

React Smart Image provides lifecycle callbacks for analytics, monitoring, and custom business logic.

## onVisible

Triggered **once** when the image enters the viewport.

Perfect for:

- Impression tracking
- Analytics
- Marketing events
- Lazy business logic

```jsx
<SmartImage
  src="/banner.jpg"
  alt="Summer Sale"
  lazy
  onVisible={() => analytics.track("banner_impression")}
/>
```

**Notes**

- Fires only once.
- Works with or without `lazy`.
- Uses the same Intersection Observer as lazy loading.

## onLoadInfo

Get detailed information after an image successfully loads.

```jsx
<SmartImage
  src="/photo.jpg"
  onLoadInfo={(info) => {
    console.log(info.loadTime, info.width, info.height, info.fromCache);
  }}
/>
```

### LoadInfo

```ts
interface LoadInfo {
  loadTime: number;
  width: number;
  height: number;
  fromCache: boolean;
}
```

Useful for:

- Performance monitoring
- Logging
- Analytics
- Debugging

## onZoomChange

Know when the zoom viewer opens or closes.

> ⚠️ Only fires for `lightbox`/`fullscreen` modes. Hovering to trigger `inline`/`magnifier` zoom doesn't call `onZoomChange`.

```jsx
<SmartImage zoom onZoomChange={(open) => console.log(open)} />
```

Perfect for:

- Analytics
- Pause videos
- Stop autoplay
- Track product interactions

# Cache Utilities

React Smart Image includes an in-memory cache to avoid unnecessary image processing.

## Clear Cache

```tsx
import { clearImageCache } from "@concatstring/react-smart-image";

clearImageCache();
```

Removes every cached image.

## Invalidate One Image

```tsx
import { invalidateImageCache } from "@concatstring/react-smart-image";

invalidateImageCache("/uploads/avatar.jpg");
```

Useful after:

- Uploading a new profile picture
- Replacing an image
- CDN cache refresh

<a id="typescript"></a>

# TypeScript

All public types are exported.

```tsx
import type {
  SmartImageProps,
  LoadInfo,
  ResponsiveSizes,
  ZoomOptions,
  ZoomMode,
  ZoomAnimation,
  ZoomToolbarButton,
  TransitionKind,
  SmartImageDefaults,
  SmartImageProviderProps,
  SmartImagePresetConfig,
  SmartImagePresetMap,
} from "@concatstring/react-smart-image";
```

No additional packages required.

## How Wrapper Rendering Works

`SmartImage` renders a bare `<img>` whenever possible.

A `<span>` wrapper is added — for the component's entire lifetime, not just while loading — whenever one of these props is set:

- `skeleton`
- `placeholder="blur"`
- `thumbnail`

The wrapper stays mounted after the image finishes loading, so the same `<img>` node persists across the loading → loaded transition. This is required for `transition` (and the default crossfade) to animate correctly.

> ⚠️ In wrapper mode, `className` is applied to the `<span>`, not the inner `<img>`.

<a id="api-reference"></a>

# API Reference

## SmartImage

### Core Props

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| src | string | — | Image source URL |
| alt | string | "" | Accessible alternative text |
| width | number \| string | — | Width |
| height | number \| string | — | Height |
| preset | string | — | Apply preset configuration |

All standard `<img>` HTML attributes (`className`, `style`, `onClick`, `onLoad`, `onError`, `loading`, etc.) are forwarded to the underlying `<img>` element. `ref` is also forwarded via `forwardRef`.

### Loading

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| lazy | boolean | false | Delay loading until the image enters the viewport. Ignored when `priority` is set |
| priority | boolean | false | Load with maximum priority — disables `lazy`, sets `loading="eager"` + `fetchpriority="high"`, injects `<link rel="preload">` |
| aspectRatio | number \| string | — | Reserve layout space before load via CSS `aspect-ratio`. Prevents layout shift (improves CLS) |

### Placeholder

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| skeleton | boolean | false | Requires `width` and `height` |
| placeholder | "blur" | — | Requires `width` and `height` |
| blurDataURL | string | — | Base64 LQIP source |
| autoBlur | boolean | false | Derives the blur preview from a tiny version of `src` |
| blurWidth | number | 24 | Width (px) of the auto-blur preview |
| thumbnail | string | — | Low-quality image shown while the full image loads |

### Transition

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| transition | fade, scale, grow, rotate, flip, slide-up, slide-left, reveal, none | opacity crossfade in `skeleton`/`blur` mode, otherwise none | Ignored when `thumbnail` is set |
| transitionDuration | number | 300 | Duration (ms) of the transition |
| fade | boolean | false | Shorthand for `transition="fade"` |

### Responsive

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| responsive | boolean | false | Enable auto-generated `srcSet`/`sizes` |
| strategy | srcset \| viewport | srcset | `srcset` lets the browser pick (DPR-aware); `viewport` picks by media query only and ignores DPR |
| sizes | ResponsiveSizes \| string | — | Breakpoint widths, or a raw `sizes` string passed through as-is |
| srcSetBuilder | Function | `` `${src}?w=${width}` `` | Maps `src` + a breakpoint width to a URL. Reused by `autoBlur` |

```ts
interface ResponsiveSizes {
  mobile?: number;   // used for max-width: 640px
  tablet?: number;   // used for max-width: 1024px
  desktop?: number;  // default (no media query)
}
```

### Modern Formats

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| avif | boolean | false | Try a `.avif` version of `src` first (checked before `webp`) |
| webp | boolean | false | Try a `.webp` version of `src`; falls back to the original on failure |
| format | auto | — | Shorthand for enabling both `avif` and `webp` |

### Retry

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| retry | number | 0 | Number of times to retry a failed load |
| retryDelay | number | 1000 | Base delay (ms) between retries. Each retry doubles the delay (exponential backoff) |
| fallback | string | — | URL to display when the image fails to load after all retries |

### Zoom

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| zoom | boolean | false | Enable zoom. Clicking opens a lightbox by default; configure via `zoomOptions` |
| zoomSrc | string | `src` | Separate (usually higher-res) image shown when zoomed |
| zoomOptions | ZoomOptions | — | Zoom configuration — see below |
| onZoomChange | Function | — | Called when the zoom lightbox opens (`true`) or closes (`false`). Only fires for `lightbox`/`fullscreen` modes |

### ZoomOptions

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| mode | lightbox, inline, magnifier, fullscreen | lightbox | Trigger/presentation — `lightbox`/`fullscreen` open a popup; `inline`/`magnifier` magnify in place |
| animation | fade, scale, zoom, slide, none | fade | Lightbox open/close animation |
| animationDuration | number | 300 | Animation duration in ms |
| showToolbar | boolean | false | Show the lightbox toolbar |
| toolbarItems | ZoomToolbarButton[] | zoomIn, zoomOut, reset, download, fullscreen | Buttons to show, in order |
| scale | number | 2 | Magnification for `inline`/`magnifier` and toolbar zoom steps |
| magnifierSize | number | 160 | Lens diameter (px) in `magnifier` mode |
| backdropColor | string | rgba(0,0,0,0.85) | Lightbox backdrop color |
| caption | boolean \| string | — | Caption under the zoomed image (`true` = use `alt`) |
| closeOnBackdropClick | boolean | true | Close on backdrop click |
| closeOnEsc | boolean | true | Close on Escape |
| showCloseButton | boolean | true | Show the × close button |
| className | string | — | Applied to the zoomed `<img>` |
| style | CSSProperties | — | Applied to the zoomed `<img>` |

### Callbacks

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| onVisible | Function | — | Fires once when image enters viewport |
| onLoadInfo | Function | — | Returns load statistics |
| onZoomChange | Function | — | Zoom open / close callback. Only fires for `lightbox`/`fullscreen` modes |

## SmartImageProvider (Props Reference)

Full usage and prop table: see [SmartImageProvider](#smartimageprovider) above.

## createImagePresets

Create reusable image configurations.

```tsx
const presets = createImagePresets({
  hero: { priority: true },
});
```

Returns a fully typed preset object.

# Browser Support

| Browser | Supported |
|----------|-----------|
| Chrome | ✅ |
| Edge | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Mobile Chrome | ✅ |
| Mobile Safari | ✅* |

\* `zoomOptions={{ mode: "fullscreen" }}` doesn't enter true fullscreen on iOS Safari — see [Fullscreen](#image-zoom).

<a id="faq"></a>

# FAQ

<details>
<summary><strong>Can I replace <code>&lt;img&gt;</code> directly?</strong></summary>
Yes. React Smart Image is designed as a drop-in replacement.
</details>

<details>
<summary><strong>Does it support SSR?</strong></summary>
Yes. Compatible with SSR frameworks including:

- Next.js
- Remix
- Gatsby
- Astro
- React Router SSR
</details>

<details>
<summary><strong>Does it work with Vite?</strong></summary>
Yes. No configuration required.
</details>

<details>
<summary><strong>Does it support React 19?</strong></summary>
Yes. Supports React 18 and newer.
</details>

<details>
<summary><strong>Can I use Cloudinary?</strong></summary>
Yes. Use `srcSetBuilder`.
</details>

<details>
<summary><strong>Can I use AWS CloudFront?</strong></summary>
Yes. Use `srcSetBuilder`.
</details>

<details>
<summary><strong>Does it support ImageKit?</strong></summary>
Yes.
</details>

<details>
<summary><strong>Does it support Imgix?</strong></summary>
Yes.
</details>

<details>
<summary><strong>Can I disable animations?</strong></summary>
Yes.

```jsx
transition="none"
```
</details>

<details>
<summary><strong>Can I use only Zoom?</strong></summary>
Yes. Every feature is completely independent.
</details>

<details>
<summary><strong>Can I combine multiple features?</strong></summary>
Absolutely.

```jsx
<SmartImage
  responsive
  zoom
  lazy
  retry={2}
  placeholder="blur"
  format="auto"
/>
```
</details>

# Contributing

Contributions are welcome!

If you find a bug, have a feature request, or would like to improve the documentation, please open an issue or submit a pull request.

GitHub Issues

https://github.com/concatstring-account/react-smart-image/issues

# Changelog

See GitHub Releases for the latest updates.

<a id="license"></a>

# License

MIT © Concatstring Labs

# Links

### 🌐 Live Demo

https://react-smart-image.netlify.app

### 📖 Learn more

https://labs.concatstring.com/products/react-smart-image

### 📦 npm

https://www.npmjs.com/package/@concatstring/react-smart-image

### ⭐ GitHub

https://github.com/concatstring-account/react-smart-image

# Thank You ❤️

If React Smart Image helps your project, please consider:

⭐ Starring the GitHub repository

📦 Sharing the package

🐛 Reporting bugs

💡 Suggesting new features

Your support helps make the library even better for the React community.
