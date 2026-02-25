import { useEffect, useRef } from 'react';

interface WizardInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

function WizardInput({
  value,
  onChange,
  placeholder,
  onSubmit,
  disabled = false,
  autoFocus = true,
}: WizardInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-grow
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={3}
      disabled={disabled}
      className="w-full bg-transparent border-b-2 border-border focus:border-primary text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-3 disabled:opacity-50"
    />
  );
}

export default WizardInput;
