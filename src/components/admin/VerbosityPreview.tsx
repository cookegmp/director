import { Badge } from '@/components/ui/badge';

const PREVIEW_DATA: Record<number, { label: string; entries: { text: string; type: 'progress' | 'milestone' | 'error' | 'recovery' }[] }> = {
  1: {
    label: 'Minimal — Milestones only',
    entries: [
      { text: 'Project foundation created', type: 'milestone' },
      { text: 'Core interface phase complete', type: 'milestone' },
      { text: 'Encountered an issue — resolved', type: 'recovery' },
      { text: 'Build complete', type: 'milestone' },
    ],
  },
  2: {
    label: 'Brief — Phases and highlights',
    entries: [
      { text: 'Setting up the project foundation', type: 'progress' },
      { text: 'Installing required components', type: 'progress' },
      { text: 'Building the core interface — 4 sections created', type: 'milestone' },
      { text: 'Encountered an issue — working through it', type: 'error' },
      { text: 'Issue resolved, continuing', type: 'recovery' },
      { text: 'Core interface phase complete', type: 'milestone' },
    ],
  },
  3: {
    label: 'Standard — Balanced detail',
    entries: [
      { text: 'Creating the project foundation', type: 'progress' },
      { text: 'Setting up the styling system', type: 'progress' },
      { text: 'Installing required components', type: 'progress' },
      { text: 'Built the main dashboard view', type: 'milestone' },
      { text: 'Built the navigation sidebar', type: 'milestone' },
      { text: 'Encountered an issue with a missing component — trying a different approach', type: 'error' },
      { text: 'Issue resolved, continuing', type: 'recovery' },
      { text: 'All quality checks passed', type: 'milestone' },
    ],
  },
  4: {
    label: 'Detailed — Most actions visible',
    entries: [
      { text: 'Creating the project foundation using React and TypeScript', type: 'progress' },
      { text: 'Setting up Tailwind CSS for the styling system', type: 'progress' },
      { text: 'Installing 12 required components', type: 'progress' },
      { text: 'Built the Dashboard component — priority queue and activity feed', type: 'milestone' },
      { text: 'Built the Sidebar component — navigation with role-aware menu items', type: 'milestone' },
      { text: 'Encountered a dependency conflict with the tooltip component — resolving', type: 'error' },
      { text: 'Resolved by updating the component version', type: 'recovery' },
      { text: 'Running quality checks — 14 of 14 passed', type: 'milestone' },
    ],
  },
  5: {
    label: 'Verbose — Full visibility',
    entries: [
      { text: 'Creating the project at /app/stage-manager using React 18 with TypeScript', type: 'progress' },
      { text: 'Configuring Tailwind CSS v3 with custom color tokens for the design system', type: 'progress' },
      { text: 'Installing lucide-react for icons, zustand for state management', type: 'progress' },
      { text: 'Created Dashboard.tsx (245 lines) — includes priority queue and activity feed', type: 'milestone' },
      { text: 'Created Sidebar.tsx (89 lines) — navigation menu that hides admin link for non-admin roles', type: 'milestone' },
      { text: 'Created ScoreDisplay.tsx (156 lines) — horizontal bar chart showing all score dimensions', type: 'milestone' },
    ],
  },
};

const TYPE_STYLES = {
  progress: 'border-l-primary/40 text-muted-foreground',
  milestone: 'border-l-teal-400/60 text-foreground',
  error: 'border-l-red-400/60 text-red-300',
  recovery: 'border-l-green-400/60 text-green-300',
};

interface VerbosityPreviewProps {
  level: number;
}

function VerbosityPreview({ level }: VerbosityPreviewProps) {
  const data = PREVIEW_DATA[level] ?? PREVIEW_DATA[3];

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Preview</h4>
        <Badge variant="outline" className="text-xs">
          {data.label}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {data.entries.map((entry, i) => (
          <div
            key={`${level}-${i}`}
            className={`border-l-2 pl-3 py-1 text-xs leading-relaxed transition-all animate-in fade-in duration-300 ${TYPE_STYLES[entry.type]}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerbosityPreview;
