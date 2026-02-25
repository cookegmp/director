interface WizardSuggestionTagsProps {
  suggestions: string[];
  onSelect: (tag: string) => void;
  selectedTag?: string | null;
}

function WizardSuggestionTags({
  suggestions,
  onSelect,
  selectedTag,
}: WizardSuggestionTagsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
            selectedTag === tag
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default WizardSuggestionTags;
