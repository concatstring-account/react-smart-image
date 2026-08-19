import { useEffect, useState } from 'react';
import type { ResponsiveSizes } from '../types';

const MOBILE_QUERY = '(max-width: 640px)';
const TABLET_QUERY = '(max-width: 1024px)';

// Pick the breakpoint width for the current viewport — by media query only,
// ignoring device pixel ratio. This is what guarantees a mobile *screen* gets
// the mobile image regardless of DPR.
function pickWidth(sizes: ResponsiveSizes): number | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    // SSR / no matchMedia — default to the largest to avoid an under-sized flash.
    return sizes.desktop ?? sizes.tablet ?? sizes.mobile;
  }
  if (window.matchMedia(MOBILE_QUERY).matches) {
    return sizes.mobile ?? sizes.tablet ?? sizes.desktop;
  }
  if (window.matchMedia(TABLET_QUERY).matches) {
    return sizes.tablet ?? sizes.desktop ?? sizes.mobile;
  }
  return sizes.desktop ?? sizes.tablet ?? sizes.mobile;
}

/**
 * Returns the active breakpoint width for the current viewport, updating on
 * resize/orientation changes. Returns `undefined` when disabled.
 */
export function useResponsiveWidth(
  sizes: ResponsiveSizes,
  enabled: boolean
): number | undefined {
  const [width, setWidth] = useState<number | undefined>(() =>
    enabled ? pickWidth(sizes) : undefined
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const update = () => setWidth(pickWidth(sizes));
    update();
    const mqls = [window.matchMedia(MOBILE_QUERY), window.matchMedia(TABLET_QUERY)];
    mqls.forEach((m) => m.addEventListener('change', update));
    return () => mqls.forEach((m) => m.removeEventListener('change', update));
  }, [enabled, sizes.mobile, sizes.tablet, sizes.desktop]);

  return width;
}
