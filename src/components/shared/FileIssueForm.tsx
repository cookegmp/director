import { useState, useRef } from 'react';
import { useIssuesStore } from '@/stores/issues';
import { useChartersStore } from '@/stores/charters';
import { useActivityStore } from '@/stores/activity';
import GradientButton from '@/components/shared/GradientButton';
import DictationButton from '@/components/DictationButton';
import { generateId } from '@/lib/utils';
import type { IssueType, IssueSeverity } from '@/types';

interface FileIssueFormProps {
  projectId?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

function FileIssueForm({ projectId, onSubmitted, onCancel }: FileIssueFormProps) {
  const addIssue = useIssuesStore((s) => s.addIssue);
  const charters = useChartersStore((s) => s.charters);
  const addActivity = useActivityStore((s) => s.addActivity);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<IssueType>('bug');
  const [formSeverity, setFormSeverity] = useState<IssueSeverity>('medium');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const descBaseRef = useRef('');

  const handleSubmit = () => {
    if (!formTitle.trim()) return;
    const now = new Date().toISOString();
    const issueId = generateId();
    addIssue({
      id: issueId,
      type: formType,
      title: formTitle,
      description: formDescription,
      severity: formSeverity,
      status: 'open',
      projectId: projectId ?? (formProjectId || null),
      createdAt: now,
      updatedAt: now,
      comments: [],
    });
    addActivity({
      id: generateId(),
      type: 'issue-filed',
      entityId: issueId,
      entityType: 'issue',
      summary: `New ${formType === 'bug' ? 'bug report' : 'feature request'}: "${formTitle}"`,
      createdAt: now,
    });
    setFormTitle('');
    setFormDescription('');
    setFormProjectId('');
    onSubmitted?.();
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 space-y-4">
      <h2 className="text-lg font-light text-foreground">New Issue</h2>
      <input
        type="text"
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        placeholder="Issue title..."
        className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground/40 focus:outline-none py-2"
      />
      <div className="flex gap-3">
        <select
          value={formType}
          onChange={(e) => setFormType(e.target.value as IssueType)}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1 flex-1"
        >
          <option value="bug">Bug</option>
          <option value="feature-request">Feature Request</option>
        </select>
        <select
          value={formSeverity}
          onChange={(e) => setFormSeverity(e.target.value as IssueSeverity)}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1 flex-1"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      {!projectId && charters.length > 0 && (
        <select
          value={formProjectId}
          onChange={(e) => setFormProjectId(e.target.value)}
          className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1"
        >
          <option value="">No project linked</option>
          {charters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      )}
      <div className="relative">
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Describe the issue..."
          rows={4}
          className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none py-2 pr-12"
        />
        <div className="absolute right-0 bottom-3">
          <DictationButton
            onResult={(text) => {
              const committed = descBaseRef.current + text;
              descBaseRef.current = committed;
              setFormDescription(committed);
            }}
            onInterim={(text) => {
              if (text) setFormDescription(descBaseRef.current + text);
            }}
            onListeningChange={(listening) => {
              if (listening) descBaseRef.current = formDescription;
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <GradientButton onClick={handleSubmit} disabled={!formTitle.trim()}>
          Submit
        </GradientButton>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default FileIssueForm;
