// ============================================================================
// Issue Reporter — Screenshot Section
// ============================================================================
// Capture/upload controls and thumbnail preview on the review card.
// ============================================================================

import { useRef, useState } from 'react';
import { Camera, Upload, X, Maximize2 } from 'lucide-react';
import { useIssueReporterStore } from '../stores/issue-reporter';
import { fileToBase64 } from '../lib/screenshot-utils';
import CaptureOverlay from './CaptureOverlay';

function ScreenshotSection() {
  const { screenshot, setScreenshot } = useIssueReporterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setScreenshot(base64);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptureComplete = (base64: string) => {
    setScreenshot(base64);
    setShowCapture(false);
  };

  return (
    <>
      <div>
        <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-3">
          Screenshot (optional)
        </label>

        {screenshot ? (
          <div className="relative group">
            <img
              src={screenshot}
              alt="Attached screenshot"
              className="max-h-48 rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowLightbox(true)}
            />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowLightbox(true)}
                className="p-1.5 bg-black/60 rounded-md text-white/80 hover:text-white transition-colors"
                title="View full size"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScreenshot(null)}
                className="p-1.5 bg-black/60 rounded-md text-white/80 hover:text-red-400 transition-colors"
                title="Remove screenshot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCapture(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Capture Screenshot
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Capture overlay */}
      {showCapture && (
        <CaptureOverlay
          onCapture={handleCaptureComplete}
          onCancel={() => setShowCapture(false)}
        />
      )}

      {/* Lightbox */}
      {showLightbox && screenshot && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={screenshot}
            alt="Screenshot full size"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default ScreenshotSection;
