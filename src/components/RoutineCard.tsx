import { useState } from 'react';
import type { Exercise, Routine } from '../lib/types';
import ExerciseItem from './ExerciseItem';
import ScheduleBadges from './ScheduleBadges';

export default function RoutineCard({ routine, exercises }: { routine: Routine; exercises: Exercise[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{routine.name}</h3>
            <div className="mt-1">
              <ScheduleBadges schedule={routine.schedule} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{exercises.length} exercises</span>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {routine.notes && (
          <p className="text-xs text-text-muted mt-1">{routine.notes}</p>
        )}
      </button>
      {expanded && exercises.length > 0 && (
        <div className="px-4 pb-4 space-y-1.5">
          {exercises.map((ex) => (
            <ExerciseItem key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
      {expanded && exercises.length === 0 && (
        <div className="px-4 pb-4 text-sm text-text-muted">
          No exercises yet. Use AI Chat to add some!
        </div>
      )}
    </div>
  );
}
