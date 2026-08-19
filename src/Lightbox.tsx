import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';
import type { ZoomAnimation, ZoomToolbarButton } from './types';

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  animation: ZoomAnimation;
  animationDuration: number;
  backdropColor: string;
  caption?: string;
  showToolbar: boolean;
  toolbarItems: ZoomToolbarButton[];
  zoomStep: number;
  closeOnBackdropClick: boolean;
  closeOnEsc: boolean;
  showCloseButton: boolean;
  startFullscreen: boolean;
  imageClassName?: string;
  imageStyle?: React.CSSProperties;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

// Entrance/exit transform for each animation style, keyed by whether the
// dialog is in its "resting" (entered) state or the enter/exit edge state.
function motionTransform(animation: ZoomAnimation, resting: boolean): string {
  if (resting) return 'none';
  switch (animation) {
    case 'scale':
      return 'scale(0.9)';
    case 'zoom':
      return 'scale(0.5)';
    case 'slide':
      return 'translateY(24px)';
    default:
      return 'none';
  }
}

export function Lightbox({
  src,
  alt,
  onClose,
  animation,
  animationDuration,
  backdropColor,
  caption,
  showToolbar,
  toolbarItems,
  zoomStep,
  closeOnBackdropClick,
  closeOnEsc,
  showCloseButton,
  startFullscreen,
  imageClassName,
  imageStyle,
}: LightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);

  // `resting` drives the enter/exit transition; starts false so the first paint
  // is the "from" state, then flips to true on mount to animate in.
  const [resting, setResting] = useState(animation === 'none');
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animated close: play the exit transition, then unmount via onClose.
  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (animation === 'none') {
      onClose();
      return;
    }
    setResting(false);
    window.setTimeout(onClose, animationDuration);
  }, [animation, animationDuration, onClose]);

  useEffect(() => {
    // Trigger the enter transition on the frame after mount.
    const id = window.setTimeout(() => setResting(true), 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) handleClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();
    if (!closeButtonRef.current) containerRef.current?.focus();

    const onFsChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onFsChange);

    if (startFullscreen && containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {});
    }

    return () => {
      window.clearTimeout(id);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.body.style.overflow = prevOverflow;
      if (document.fullscreenElement === containerRef.current) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [closeOnEsc, handleClose, startFullscreen]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const handleDownload = useCallback(() => {
    const a = document.createElement('a');
    a.href = src;
    a.download = src.split('/').pop()?.split(/[?#]/)[0] || 'image';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [src]);

  const runToolbarAction = (button: ZoomToolbarButton) => {
    switch (button) {
      case 'zoomIn':
        setScale((s) => Math.min(MAX_SCALE, +(s + zoomStep).toFixed(2)));
        break;
      case 'zoomOut':
        setScale((s) => Math.max(MIN_SCALE, +(s - zoomStep).toFixed(2)));
        break;
      case 'reset':
        setScale(1);
        break;
      case 'download':
        handleDownload();
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
    }
  };

  if (typeof document === 'undefined') return null;

  const transition = animation === 'none' ? undefined : `all ${animationDuration}ms ease`;
  const backdropOpacity = resting ? 1 : 0;

  const glyph: Record<ZoomToolbarButton, string> = {
    zoomIn: '+',
    zoomOut: '−',
    reset: '⟳',
    download: '↓',
    fullscreen: isFullscreen ? '⤢' : '⛶',
  };
  const label: Record<ZoomToolbarButton, string> = {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Reset zoom',
    download: 'Download image',
    fullscreen: isFullscreen ? 'Exit fullscreen' : 'Fullscreen',
  };

  const toolbarButtonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    lineHeight: 1,
    color: '#fff',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    cursor: 'pointer',
  };

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image preview'}
      tabIndex={-1}
      onClick={closeOnBackdropClick ? handleClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: backdropColor,
        opacity: backdropOpacity,
        transition,
        cursor: closeOnBackdropClick ? 'zoom-out' : 'default',
      }}
    >
      {showToolbar && toolbarItems.length > 0 && (
        <div
          role="toolbar"
          aria-label="Image controls"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            display: 'flex',
            gap: 8,
            padding: 8,
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 12,
          }}
        >
          {toolbarItems.map((button) => (
            <button
              key={button}
              type="button"
              aria-label={label[button]}
              title={label[button]}
              onClick={() => runToolbarAction(button)}
              style={toolbarButtonStyle}
            >
              {glyph[button]}
            </button>
          ))}
        </div>
      )}

      {showCloseButton && (
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            lineHeight: 1,
            color: '#fff',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      )}

      <figure
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          maxWidth: '100%',
          maxHeight: '100%',
          opacity: resting ? 1 : 0,
          transform: motionTransform(animation, resting),
          transition,
        }}
      >
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          style={{
            maxWidth: '90vw',
            maxHeight: caption ? '80vh' : '90vh',
            objectFit: 'contain',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: `transform ${animationDuration}ms ease`,
            cursor: 'default',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            ...imageStyle,
          }}
        />
        {caption && (
          <figcaption
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 14,
              textAlign: 'center',
              maxWidth: '90vw',
            }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </div>,
    document.body
  );
}
