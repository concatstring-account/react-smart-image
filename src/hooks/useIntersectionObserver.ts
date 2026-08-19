import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverResult {
  elementRef: React.RefObject<Element | null>;
  isVisible: boolean;
}

export function useIntersectionObserver(
  enabled: boolean,
  options: IntersectionObserverInit = {},
  onVisible?: () => void
): UseIntersectionObserverResult {
  const elementRef = useRef<Element | null>(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  // Fire onVisible at most once; keep the callback in a ref so an inline arrow
  // doesn't retrigger the observer effect on every render.
  const hasFiredRef = useRef(false);
  const onVisibleRef = useRef(onVisible);
  useEffect(() => {
    onVisibleRef.current = onVisible;
  });

  useEffect(() => {
    // We need an observer when either loading is still gated on visibility
    // (lazy, not yet visible) or a first-visibility report is still pending.
    const needGate = enabled && !isVisible;
    const needReport = !!onVisibleRef.current && !hasFiredRef.current;
    if (!needGate && !needReport) return;

    const fireVisible = () => {
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        onVisibleRef.current?.();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      fireVisible();
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          fireVisible();
          observer.disconnect();
        }
      },
      { rootMargin: '100px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, isVisible, options]);

  return { elementRef, isVisible };
}
