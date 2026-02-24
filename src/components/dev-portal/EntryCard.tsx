import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Activity, CheckCircle, AlertCircle, RefreshCw, CheckCircle2, Send } from 'lucide-react';
import type { TranslatedEntry, TranslatedEntryType } from '@/types';

const TYPE_ICONS: Record<TranslatedEntryType, typeof Activity> = {
  progress: Activity,
  milestone: CheckCircle,
  error: AlertCircle,
  recovery: RefreshCw,
  complete: CheckCircle2,
};

const TYPE_COLORS: Record<TranslatedEntryType, string> = {
  progress: 'text-muted-foreground',
  milestone: 'text-green-400',
  error: 'text-red-400',
  recovery: 'text-amber-400',
  complete: 'text-green-400',
};

interface EntryCardProps {
  entries: TranslatedEntry[];
  onEntryClick?: (rawLineIndex: number) => void;
  onSendMessage?: (message: string) => void;
}

const DOT_WINDOW_SIZE = 30;

function EntryCard({ entries, onEntryClick, onSendMessage }: EntryCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userNavigated, setUserNavigated] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-advance to latest entry when new entries arrive (unless user navigated away)
  useEffect(() => {
    if (entries.length === 0) return;
    if (!userNavigated) {
      setCurrentIndex(entries.length - 1);
    }
  }, [entries.length, userNavigated]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      // If user navigated to the latest entry, resume auto-advance
      if (index === entries.length - 1) {
        setUserNavigated(false);
      } else {
        setUserNavigated(true);
      }
    },
    [entries.length]
  );

  const goBack = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const goForward = useCallback(() => {
    if (currentIndex < entries.length - 1) goTo(currentIndex + 1);
  }, [currentIndex, entries.length, goTo]);

  // Keyboard navigation (disabled when chat input is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatInputRef.current === document.activeElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward]);

  const handleSendMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed || !onSendMessage) return;
    onSendMessage(trimmed);
    setChatMessage('');
  }, [chatMessage, onSendMessage]);

  // Sliding window for dots when entries > DOT_WINDOW_SIZE
  const dotRange = useMemo(() => {
    const total = entries.length;
    if (total <= DOT_WINDOW_SIZE) {
      return { start: 0, end: total };
    }
    const half = Math.floor(DOT_WINDOW_SIZE / 2);
    let start = currentIndex - half;
    let end = currentIndex + half;
    if (start < 0) {
      start = 0;
      end = DOT_WINDOW_SIZE;
    }
    if (end > total) {
      end = total;
      start = total - DOT_WINDOW_SIZE;
    }
    return { start, end };
  }, [entries.length, currentIndex]);

  const entry = entries[currentIndex];

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Waiting for build output...</p>
        </div>
        {onSendMessage && (
          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <input
                ref={chatInputRef}
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Send a message to the agent..."
                className="flex-1 bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const Icon = entry ? TYPE_ICONS[entry.type] : Activity;
  const iconColor = entry ? TYPE_COLORS[entry.type] : 'text-muted-foreground';
  const isError = entry?.type === 'error';
  const showFadeLeft = entries.length > DOT_WINDOW_SIZE && dotRange.start > 0;
  const showFadeRight = entries.length > DOT_WINDOW_SIZE && dotRange.end < entries.length;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
      {/* Dot navigation + arrows */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {/* Back arrow */}
        {currentIndex > 0 ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Dots */}
        <div className="flex items-center gap-1.5 relative">
          {showFadeLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />
          )}
          {Array.from({ length: dotRange.end - dotRange.start }, (_, di) => {
            const i = dotRange.start + di;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentIndex
                    ? 'bg-primary'
                    : i === currentIndex
                      ? 'bg-primary ring-2 ring-primary/30'
                      : 'bg-muted'
                }`}
                aria-label={`Entry ${i + 1}`}
              />
            );
          })}
          {showFadeRight && (
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {/* Forward arrow */}
        {currentIndex < entries.length - 1 ? (
          <button
            onClick={goForward}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-4" />
        )}
      </div>

      {/* Current entry display */}
      {entry && (
        <div
          className={`${
            isError ? 'bg-red-500/10 rounded-[1rem] p-4 border-l-2 border-red-500' : ''
          } ${onEntryClick ? 'cursor-pointer' : ''}`}
          onClick={() => onEntryClick?.(entry.rawLineIndex)}
        >
          {/* Phase label */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {entry.phase}
          </p>

          {/* Type icon */}
          <div className="mb-3">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>

          {/* Summary */}
          <p className="text-xl sm:text-2xl font-light text-foreground leading-relaxed">
            {entry.summary}
          </p>

          {/* Timestamp */}
          <p className="text-sm text-muted-foreground mt-3">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Entry counter */}
      <div className="mt-6 text-center">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {entries.length}
        </span>
      </div>

      {/* Chat input */}
      {onSendMessage && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              ref={chatInputRef}
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Send a message to the agent..."
              className="flex-1 bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntryCard;
