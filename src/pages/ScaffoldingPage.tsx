import { useState } from 'react';
import {
  Building2,
  Cpu,
  Palette,
  Shield,
  ClipboardCheck,
} from 'lucide-react';
import { useScaffoldingStore } from '@/stores/scaffolding';
import type { ScaffoldingDocType } from '@/types';

const DOC_TYPES: { type: ScaffoldingDocType; label: string; icon: typeof Building2 }[] = [
  { type: 'company-context', label: 'Company Context', icon: Building2 },
  { type: 'technology-preferences', label: 'Technology Preferences', icon: Cpu },
  { type: 'brand-standards', label: 'Brand Standards', icon: Palette },
  { type: 'security-patterns', label: 'Security Patterns', icon: Shield },
  { type: 'quality-standards', label: 'Quality Standards', icon: ClipboardCheck },
];

function ScaffoldingPage() {
  const documents = useScaffoldingStore((s) => s.documents);
  const [selectedType, setSelectedType] = useState<ScaffoldingDocType>('company-context');

  const selectedDoc = documents.find((d) => d.type === selectedType);

  return (
    <div>
      <h1 className="text-2xl font-light text-foreground mb-2">Scaffolding</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Foundation documents from the consulting discovery process. These govern charter generation output.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document type nav */}
        <div className="space-y-1">
          {DOC_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[0.75rem] text-sm text-left transition-colors ${
                selectedType === type
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Document content */}
        <div className="lg:col-span-3 bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          {selectedDoc ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-foreground">{selectedDoc.title}</h2>
                <span className="text-xs text-muted-foreground">
                  Last updated: {new Date(selectedDoc.lastUpdated).toLocaleDateString()}
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                {selectedDoc.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h3 key={i} className="text-foreground font-medium mt-6 mb-2 text-base">
                        {paragraph.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={i} className="space-y-1 my-2">
                        {paragraph.split('\n').map((line, j) => (
                          <li key={j} className="text-foreground/80 font-light text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">-</span>
                            {line.replace('- ', '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-foreground/80 font-light leading-relaxed mb-3">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No scaffolding document loaded for this category.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sample data will populate this on first load.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScaffoldingPage;
