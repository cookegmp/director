import { useEffect, useCallback, useRef } from 'react';
import { Mic } from 'lucide-react';
import useDictation from '@/hooks/useDictation';

interface DictationButtonProps {
  /** Called with final transcript text to append */
  onResult: (text: string) => void;
  /** Called with in-progress text as the user speaks (for live preview in the input) */
  onInterim?: (text: string) => void;
  /** Called when listening state changes — use to snapshot base text */
  onListeningChange?: (isListening: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const HOTKEY_LABEL = navigator.platform.includes('Mac') ? '⌃⇧D' : 'Ctrl+Shift+D';

function DictationButton({ onResult, onInterim, onListeningChange, className = '', disabled = false }: DictationButtonProps) {
  const {
    transcript,
    interimText,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useDictation();

  // Store callbacks in refs so effects don't depend on callback identity.
  // This prevents infinite re-render loops from inline arrow function props.
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const onListeningChangeRef = useRef(onListeningChange);
  onResultRef.current = onResult;
  onInterimRef.current = onInterim;
  onListeningChangeRef.current = onListeningChange;

  const toggle = useCallback(() => {
    if (disabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [disabled, isListening, startListening, stopListening]);

  // Notify parent of listening state changes
  useEffect(() => {
    onListeningChangeRef.current?.(isListening);
  }, [isListening]);

  // Stream interim text to parent so it shows live in the input field
  useEffect(() => {
    onInterimRef.current?.(interimText);
  }, [interimText]);

  // Deliver final transcript to parent
  useEffect(() => {
    if (transcript) {
      onResultRef.current(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Global hotkey: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        title={isListening ? 'Listening... (click or ' + HOTKEY_LABEL + ' to stop)' : 'Dictate (' + HOTKEY_LABEL + ')'}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isListening
            ? 'bg-primary/20 text-primary dictation-pulse'
            : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <Mic className="w-4 h-4" />
      </button>

      {/* Hotkey hint — only when idle */}
      {!isListening && (
        <kbd className="hidden sm:inline text-[10px] text-muted-foreground/50 font-mono">
          {HOTKEY_LABEL}
        </kbd>
      )}
    </div>
  );
}

export default DictationButton;
