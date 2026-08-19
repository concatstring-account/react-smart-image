import { useRef, useState } from 'react';
import type React from 'react';

interface ZoomMagnifierProps {
  /** Image URL used for the magnified view (usually zoomSrc ?? src). */
  src: string;
  mode: 'inline' | 'magnifier';
  scale: number;
  magnifierSize: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

interface Pos {
  x: number;
  y: number;
  w: number;
  h: number;
}

// In-place magnifier for `inline` and `magnifier` zoom modes (no modal):
// - inline:    scales the wrapped image in place, origin tracking the cursor
// - magnifier: a magnifier lens follows the cursor, showing a zoomed region
export function ZoomMagnifier({
  src,
  mode,
  scale,
  magnifierSize,
  className,
  style,
  children,
}: ZoomMagnifierProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0, w: 0, h: 0 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setPos({ x, y, w: rect.width, h: rect.height });
  };

  const pctX = pos.w ? (pos.x / pos.w) * 100 : 50;
  const pctY = pos.h ? (pos.y / pos.h) * 100 : 50;

  // hover: scale the inner content, transform-origin at the cursor.
  const innerStyle: React.CSSProperties =
    mode === 'inline'
      ? {
          display: 'block',
          transition: 'transform 0.15s ease',
          transform: active ? `scale(${scale})` : 'scale(1)',
          transformOrigin: `${pctX}% ${pctY}%`,
        }
      : { display: 'block' };

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={onMouseMove}
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        cursor: mode === 'magnifier' ? 'crosshair' : 'zoom-in',
        ...style,
      }}
    >
      <span style={innerStyle}>{children}</span>

      {mode === 'magnifier' && active && pos.w > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            width: magnifierSize,
            height: magnifierSize,
            left: pos.x - magnifierSize / 2,
            top: pos.y - magnifierSize / 2,
            border: '2px solid rgba(255,255,255,0.8)',
            borderRadius: '50%',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.4)',
            backgroundColor: '#fff',
            // Quote the URL so data URIs / URLs with special chars parse in CSS.
            backgroundImage: `url("${src}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${pos.w * scale}px ${pos.h * scale}px`,
            backgroundPosition: `${-(pos.x * scale - magnifierSize / 2)}px ${-(
              pos.y * scale -
              magnifierSize / 2
            )}px`,
          }}
        />
      )}
    </span>
  );
}
