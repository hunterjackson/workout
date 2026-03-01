import type { MutationResult } from '../lib/tool-handler';

interface MutationToastProps {
  mutations: MutationResult[];
  onDismiss: () => void;
}

export default function MutationToast({ mutations, onDismiss }: MutationToastProps) {
  if (mutations.length === 0) return null;

  return (
    <div className="mx-3 mb-2">
      <div className="bg-success/10 border border-success/20 rounded-xl p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {mutations.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={m.success ? 'text-success' : 'text-danger'}>
                  {m.success ? '✓' : '✗'}
                </span>
                <span className="text-text">{m.description}</span>
              </div>
            ))}
          </div>
          <button onClick={onDismiss} className="text-text-muted ml-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
