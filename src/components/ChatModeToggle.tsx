import type { ChatMode } from '../lib/types';

interface ChatModeToggleProps {
  mode: ChatMode;
  onToggle: () => void;
  disabled?: boolean;
}

export default function ChatModeToggle({ mode, onToggle, disabled }: ChatModeToggleProps) {
  return (
    <div className="flex bg-surface rounded-lg p-0.5 gap-0.5">
      <button
        disabled={disabled}
        onClick={mode !== 'planning' ? onToggle : undefined}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'planning'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text'
        } disabled:opacity-50`}
      >
        Planning
      </button>
      <button
        disabled={disabled}
        onClick={mode !== 'updating' ? onToggle : undefined}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'updating'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text'
        } disabled:opacity-50`}
      >
        Updating
      </button>
    </div>
  );
}
