import type { ProposedToolCall } from '../lib/types';

interface ProposedChangesProps {
  changes: ProposedToolCall[];
  onApprove: () => void;
  onReject: () => void;
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
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 bg-primary text-white text-xs font-medium py-2 rounded-lg"
          >
            Apply Changes
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-surface-light text-text-muted text-xs font-medium py-2 rounded-lg"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
