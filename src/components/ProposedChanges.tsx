import { useState } from 'react';
import type { ProposedToolCall } from '../lib/types';

interface ProposedChangesProps {
  changes: ProposedToolCall[];
  onApprove: () => void;
  onReject: (feedback: string) => void;
}

function toolIcon(name: string): string {
  if (name.startsWith('create') || name.startsWith('add')) return '+';
  if (name.startsWith('update')) return '~';
  if (name.startsWith('delete')) return '-';
  return '?';
}

function iconColor(name: string): string {
  if (name.startsWith('create') || name.startsWith('add')) return 'text-success';
  if (name.startsWith('update')) return 'text-warning';
  if (name.startsWith('delete')) return 'text-danger';
  return 'text-text-muted';
}

export default function ProposedChanges({ changes, onApprove, onReject }: ProposedChangesProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  return (
    <div className="mx-3 mb-2">
      <div className="bg-surface border border-primary/30 rounded-xl p-3">
        <p className="text-xs font-semibold text-primary mb-2">Proposed Changes</p>
        <div className="space-y-1 mb-3">
          {changes.map((change) => (
            <div key={change.id} className="flex items-center gap-2 text-xs">
              <span className={`font-mono font-bold ${iconColor(change.name)}`}>
                {toolIcon(change.name)}
              </span>
              <span className="text-text">{change.description}</span>
            </div>
          ))}
        </div>

        {showFeedback ? (
          <div className="space-y-2">
            <textarea
              className="w-full bg-bg border border-border rounded-lg p-2 text-xs text-text placeholder-text-muted resize-none"
              rows={2}
              placeholder="What would you change? (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onReject(feedback)}
                className="flex-1 bg-primary text-white text-xs font-medium py-2 rounded-lg"
              >
                Send Feedback
              </button>
              <button
                onClick={() => onReject('')}
                className="flex-1 bg-surface-light text-text-muted text-xs font-medium py-2 rounded-lg"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="flex-1 bg-primary text-white text-xs font-medium py-2 rounded-lg"
            >
              Apply Changes
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex-1 bg-surface-light text-text-muted text-xs font-medium py-2 rounded-lg"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
