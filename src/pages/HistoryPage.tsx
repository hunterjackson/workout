import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export default function HistoryPage() {
  const { id } = useParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const workouts = useLiveQuery(
    () => id ? db.workouts.where('planId').equals(id).reverse().sortBy('completedAt') : [],
    [id]
  );

  const workoutSets = useLiveQuery(async () => {
    if (!workouts || workouts.length === 0) return [];
    const wIds = workouts.map((w) => w.id);
    return db.workoutSets.where('workoutId').anyOf(wIds).toArray();
  }, [workouts]);

  const routines = useLiveQuery(
    () => id ? db.routines.where('planId').equals(id).toArray() : [],
    [id]
  );

  if (!workouts) return <div className="p-4 text-text-muted pt-20 text-center">Loading...</div>;

  const getRoutineName = (routineId: string) =>
    routines?.find((r) => r.id === routineId)?.name || 'Unknown routine';

  const getWorkoutSets = (workoutId: string) =>
    workoutSets?.filter((s) => s.workoutId === workoutId) || [];

  return (
    <div className="min-h-full bg-bg p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">History</h1>

      {workouts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-lg font-semibold mb-2">No workouts yet</h2>
          <p className="text-text-muted text-sm">Complete a workout to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const sets = getWorkoutSets(workout.id);
            const totalSets = sets.length;
            const totalVolume = sets.reduce((sum, s) => sum + (s.weight || 0) * s.reps, 0);
            const isExpanded = expandedId === workout.id;

            // Group sets by exercise
            const exerciseGroups: Record<string, { name: string; sets: typeof sets }> = {};
            for (const set of sets) {
              if (!exerciseGroups[set.exerciseId]) {
                exerciseGroups[set.exerciseId] = { name: set.exerciseName, sets: [] };
              }
              exerciseGroups[set.exerciseId].sets.push(set);
            }

            return (
              <div key={workout.id} className="bg-surface rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {new Date(workout.date).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-text-muted mt-0.5">
                        {workout.routineIds.map(getRoutineName).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-text-muted">{totalSets} sets</div>
                      {totalVolume > 0 && (
                        <div className="text-xs text-text-muted">{totalVolume.toLocaleString()} vol</div>
                      )}
                    </div>
                  </div>
                  {workout.notes && (
                    <p className="text-xs text-text-muted mt-2 italic">"{workout.notes}"</p>
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {Object.entries(exerciseGroups).map(([exId, group]) => (
                      <div key={exId}>
                        <h4 className="text-sm font-medium mb-1">{group.name}</h4>
                        <div className="space-y-1">
                          {group.sets.map((set) => (
                            <div key={set.id} className="flex items-center gap-3 text-xs text-text-muted bg-bg/50 rounded-lg px-3 py-1.5">
                              <span>Set {set.setNumber}</span>
                              <span>{set.reps} reps</span>
                              {set.weight && <span>{set.weight} {localStorage.getItem('preferred_unit') || 'lbs'}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
