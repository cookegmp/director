// ============================================================================
// Issue Reporter — Duplicate Check Section
// ============================================================================
// Collapsible section showing potential duplicate issues identified by AI.
// ============================================================================

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Link2 } from 'lucide-react';
import type { PotentialDuplicate } from '../types';

interface DuplicateCheckProps {
  duplicates: PotentialDuplicate[];
  onLinkDuplicate: (issueId: string) => void;
  linkedDuplicateId: string | null;
}

function DuplicateCheck({ duplicates, onLinkDuplicate, linkedDuplicateId }: DuplicateCheckProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (duplicates.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-500/10 transition-colors"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-300 flex-1 text-left">
          {duplicates.length} potential duplicate{duplicates.length > 1 ? 's' : ''} found
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-400" />
        )}
      </button>

      {/* Duplicate list */}
      {isExpanded && (
        <div className="border-t border-amber-500/20 divide-y divide-amber-500/10">
          {duplicates.map((dup) => {
            const isLinked = linkedDuplicateId === dup.issueId;

            return (
              <div key={dup.issueId} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{dup.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dup.similarity_reason}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      ID: {dup.issueId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  {isLinked ? (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Linked as duplicate
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => onLinkDuplicate(dup.issueId)}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" />
                        This is the same issue
                      </button>
                      <span className="text-xs text-muted-foreground/40">|</span>
                      <span className="text-xs text-muted-foreground">
                        This is different (proceed with new report)
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DuplicateCheck;
