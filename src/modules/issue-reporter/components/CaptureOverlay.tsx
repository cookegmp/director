// ============================================================================
// Issue Reporter — Capture Overlay
// ============================================================================
// Full-screen html2canvas capture with region selection.
// Transitions to annotation canvas after crop.
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { capturePageAsCanvas, cropCanvas, canvasToBase64 } from '../lib/screenshot-utils';
import AnnotationCanvas from './AnnotationCanvas';

interface CaptureOverlayProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function CaptureOverlay({ onCapture, onCancel }: CaptureOverlayProps) {
  const [stage, setStage] = useState<'capturing' | 'selecting' | 'annotating'>('capturing');
  const [pageCanvas, setPageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [croppedBase64, setCroppedBase64] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Step 1: Capture the page
  useEffect(() => {
    let cancelled = false;

    const capture = async () => {
      try {
        const canvas = await capturePageAsCanvas();
        if (!cancelled) {
          setPageCanvas(canvas);
          setStage('selecting');
        }
      } catch {
        // Fall back to file upload
        onCancel();
      }
    };

    capture();
    return () => { cancelled = true; };
  }, [onCancel]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (stage !== 'selecting') return;
    setIsSelecting(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setSelection(null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [stage]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isSelecting || !startPoint) return;

      const x = Math.min(startPoint.x, e.clientX);
      const y = Math.min(startPoint.y, e.clientY);
      const width = Math.abs(e.clientX - startPoint.x);
      const height = Math.abs(e.clientY - startPoint.y);

      setSelection({ x, y, width, height });
    },
    [isSelecting, startPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (!isSelecting || !selection || !pageCanvas) return;
    setIsSelecting(false);

    // Minimum selection size
    if (selection.width < 20 || selection.height < 20) {
      setSelection(null);
      return;
    }

    const cropped = cropCanvas(pageCanvas, selection);
    const base64 = canvasToBase64(cropped);
    setCroppedBase64(base64);
    setStage('annotating');
  }, [isSelecting, selection, pageCanvas]);

  const handleAnnotationComplete = (annotatedBase64: string) => {
    onCapture(annotatedBase64);
  };

  // Stage: Capturing page
  if (stage === 'capturing') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/80">Capturing page...</p>
        </div>
      </div>
    );
  }

  // Stage: Annotating
  if (stage === 'annotating' && croppedBase64) {
    return (
      <AnnotationCanvas
        imageBase64={croppedBase64}
        onComplete={handleAnnotationComplete}
        onCancel={onCancel}
      />
    );
  }

  // Stage: Selecting region
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 cursor-crosshair"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Dimmed background with page screenshot */}
      {pageCanvas && (
        <img
          src={canvasToBase64(pageCanvas)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
          draggable={false}
        />
      )}

      {/* Selection rectangle */}
      {selection && (
        <>
          {/* Clear area within selection */}
          {pageCanvas && (
            <div
              className="absolute border-2 border-primary overflow-hidden"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
              }}
            >
              <img
                src={canvasToBase64(pageCanvas)}
                alt=""
                className="absolute"
                style={{
                  left: -selection.x,
                  top: -selection.y,
                  width: window.innerWidth,
                  height: window.innerHeight,
                }}
                draggable={false}
              />
            </div>
          )}

          {/* Selection dimensions */}
          <div
            className="absolute text-xs text-primary bg-black/60 px-2 py-0.5 rounded pointer-events-none"
            style={{
              left: selection.x,
              top: selection.y + selection.height + 4,
            }}
          >
            {Math.round(selection.width)} x {Math.round(selection.height)}
          </div>
        </>
      )}

      {/* Instructions & cancel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-sm rounded-full px-5 py-2.5 pointer-events-auto">
        <p className="text-sm text-white/90">Click and drag to select a region</p>
        <button
          onClick={onCancel}
          className="p-1 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CaptureOverlay;
