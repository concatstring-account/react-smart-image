import React, { createContext, useContext, useMemo } from 'react';
import type { SmartImageProps } from './types';

/**
 * Default prop values applied to every `SmartImage` under a `SmartImageProvider`.
 * `src` is excluded — it always identifies the specific image being rendered.
 */
export type SmartImageDefaults = Partial<Omit<SmartImageProps, 'src'>>;

/**
 * A single named preset's prop configuration. Excludes `src` (image-specific)
 * and `preset` (a preset can't reference another preset).
 */
export type SmartImagePresetConfig = Partial<Omit<SmartImageProps, 'src' | 'preset'>>;

/** A map of preset name → prop configuration, as built by `createImagePresets`. */
export type SmartImagePresetMap = Record<string, SmartImagePresetConfig>;

/**
 * Defines a named set of reusable `SmartImage` configurations — e.g. a `hero`
 * preset for above-the-fold banners, a `product` preset for zoomable product
 * shots, an `avatar` preset for small profile pictures. Each application can
 * define whichever preset names and shapes it needs; nothing here is fixed.
 *
 * This is a typed identity helper — it returns `presets` unchanged, but keeps
 * the literal preset names so `keyof typeof imagePresets` gives you a union
 * of valid names (handy for typing a wrapper component's own `preset` prop).
 *
 * Pass the result to `SmartImageProvider`'s `presets` prop, then select one
 * per image with `<SmartImage preset="hero" src="..." />`.
 */
export function createImagePresets<T extends SmartImagePresetMap>(presets: T): T {
  return presets;
}

interface SmartImageContextValue {
  defaults: SmartImageDefaults;
  presets: SmartImagePresetMap;
}

const EMPTY_CONTEXT: SmartImageContextValue = { defaults: {}, presets: {} };

const SmartImageContext = createContext<SmartImageContextValue>(EMPTY_CONTEXT);

export interface SmartImageProviderProps {
  /** Default props applied to every `SmartImage` rendered underneath. */
  defaults?: SmartImageDefaults;
  /** Named preset configurations, selected per-image via the `preset` prop. */
  presets?: SmartImagePresetMap;
  children?: React.ReactNode;
}

/**
 * Applies shared defaults and/or named presets to every `SmartImage` rendered
 * under it, so application-wide behavior (placeholder style, responsive
 * strategy, retry policy, transitions, etc.) doesn't need to be repeated on
 * each image. For a given `SmartImage`, the final props are resolved as:
 *
 *   component props  >  preset config  >  provider defaults  >  library defaults
 *
 * i.e. a prop set directly on the element always wins, then its `preset` (if
 * any), then these `defaults` fill in anything still unset. Nesting providers
 * replaces both `defaults` and `presets` entirely for that subtree (not
 * cumulative across nested providers).
 */
export function SmartImageProvider({
  defaults = EMPTY_CONTEXT.defaults,
  presets = EMPTY_CONTEXT.presets,
  children,
}: SmartImageProviderProps) {
  const value = useMemo(() => ({ defaults, presets }), [defaults, presets]);
  return <SmartImageContext.Provider value={value}>{children}</SmartImageContext.Provider>;
}

export function useSmartImageContext(): SmartImageContextValue {
  return useContext(SmartImageContext);
}
