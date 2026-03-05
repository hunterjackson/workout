import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';
import { useWorkout } from '../hooks/useWorkout';
import type { ActiveSet } from '../hooks/useWorkout';
import type { LoggedMetrics } from '../lib/exercise-types';
import SetInputRow from '../components/SetInputRow';
import { getColumnHeaders } from '../lib/column-headers';
import BackButton from '../components/BackButton';

export default function WorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plan, routines, getTodaysRoutines } = usePlan(id);
  const workout = useWorkout(id!);
  const [showComplete, setShowComplete] = useState(false);
  const [notes, setNotes] = useState('');

  const todaysRoutines = getTodaysRoutines();

  if (!plan) return <div className="p-4 text-text-muted pt-20 text-center">Loading...</div>;

  // Routine selection screen
  if (!workout.started) {
    return (
      <div className="min-h-full bg-bg p-4 pb-20">
        <div className="flex items-center gap-3 mb-2">
          <BackButton to={`/plan/${id}`} />
          <h1 className="text-2xl font-bold">Start Workout</h1>
        </div>
        <p className="text-text-muted mb-6">Select routines to perform today</p>

        {todaysRoutines.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Today's Schedule</h2>
            <div className="space-y-2">
              {todaysRoutines.map((r) => (
                <button
                  key={r.id}
                  onClick={() => workout.initializeSets([r.id])}
                  className="w-full bg-primary/10 border border-primary/30 rounded-xl p-4 text-left"
                >
                  <div className="font-semibold text-primary">{r.name}</div>
                  {r.notes && <p className="text-xs text-text-muted mt-1">{r.notes}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">All Routines</h2>
        {routines.length === 0 ? (
          <div className="bg-surface rounded-xl p-6 text-center">
            <p className="text-text-muted">No routines yet. Use AI Chat to create some!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {routines.map((r) => (
              <button
                key={r.id}
                onClick={() => workout.initializeSets([r.id])}
                className="w-full bg-surface rounded-xl p-4 text-left"
              >
                <div className="font-semibold">{r.name}</div>
                {r.notes && <p className="text-xs text-text-muted mt-1">{r.notes}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active workout
  const handleComplete = async () => {
    await workout.completeWorkout(notes || undefined);
    navigate(`/plan/${id}/history`);
  };

  // Determine grid columns based on exercise type
  function getGridCols(colCount: number) {
    if (colCount === 1) return 'grid-cols-[auto_1fr_auto]';
    return 'grid-cols-[auto_1fr_1fr_auto]';
  }

  return (
    <div className="min-h-full bg-bg p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => workout.cancelWorkout()}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Workout</h1>
        </div>
        <div className="text-sm text-text-muted">
          {workout.completedCount}/{workout.totalCount} sets
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-surface rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${workout.totalCount > 0 ? (workout.completedCount / workout.totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {Object.entries(workout.exerciseGroups).map(([exerciseId, group]) => {
          const headers = getColumnHeaders(group.exerciseType);
          const gridCols = getGridCols(headers.length);

          return (
            <div key={exerciseId} className="bg-surface rounded-xl p-4">
              <h3 className="font-semibold mb-3">{group.exerciseName}</h3>
              <div className="space-y-2">
                <div className={`grid ${gridCols} gap-2 text-xs text-text-muted px-1`}>
                  <span>Set</span>
                  {headers.map((h) => <span key={h}>{h}</span>)}
                  <span></span>
                </div>
                {group.sets.map((set: ActiveSet) => (
                  <div
                    key={set.setNumber}
                    className={`grid ${gridCols} gap-2 items-center rounded-lg p-2 ${
                      set.completed ? 'bg-success/10' : 'bg-bg/50'
                    }`}
                  >
                    <span className="text-sm text-text-muted w-6 text-center">{set.setNumber}</span>
                    <SetInputRow
                      exerciseType={set.exerciseType}
                      metrics={set.metrics}
                      onMetricsChange={(metrics: LoggedMetrics) =>
                        workout.updateSet(exerciseId, set.setNumber, { metrics })
                      }
                    />
                    <button
                      onClick={() => workout.toggleSet(exerciseId, set.setNumber)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        set.completed ? 'bg-success text-white' : 'bg-surface-light text-text-muted'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete button */}
      <button
        onClick={() => setShowComplete(true)}
        className="w-full mt-6 py-4 rounded-xl bg-success text-white font-semibold text-lg"
      >
        Finish Workout
      </button>

      {/* Complete modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowComplete(false)}>
          <div className="bg-surface w-full rounded-t-2xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Complete Workout?</h2>
            <p className="text-text-muted text-sm mb-4">
              {workout.completedCount} of {workout.totalCount} sets completed
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Workout notes (optional)"
              rows={3}
              className="w-full bg-surface-light rounded-xl px-4 py-3 mb-4 text-sm text-text placeholder:text-text-muted outline-none resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowComplete(false)}
                className="flex-1 py-3 rounded-xl border border-surface-light text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3 rounded-xl bg-success text-white font-medium"
              >
                Save & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
