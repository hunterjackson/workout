import { useParams } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';
import { db } from '../lib/db';
import RoutineCard from '../components/RoutineCard';
import BackButton from '../components/BackButton';

const deleteRoutine = async (routineId: string) => {
  await db.exercises.where('routineId').equals(routineId).delete();
  await db.routines.delete(routineId);
};

const deleteExercise = async (exerciseId: string) => {
  await db.exercises.delete(exerciseId);
};

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku' },
  { value: 'claude-opus-4-20250514', label: 'Claude Opus' },
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PlanDetailPage() {
  const { id } = useParams();
  const { plan, routines, getRoutineExercises } = usePlan(id);

  if (!plan) {
    return (
      <div className="p-4 text-center text-text-muted pt-20">
        Loading plan...
      </div>
    );
  }

  // Build weekly schedule view
  const scheduleByDay = dayNames.map((dayName, dayIndex) => ({
    dayName,
    dayIndex,
    routines: routines.filter((r) => r.schedule.includes(dayIndex)),
  }));

  return (
    <div className="min-h-full bg-bg p-4 pb-20">
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-0.5">
          <BackButton />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          {plan.goal && <p className="text-text-muted mt-1">{plan.goal}</p>}
        </div>
      </div>

      {/* Model selector */}
      <div className="bg-surface rounded-xl p-4 mb-6">
        <label htmlFor="model-select" className="text-sm font-semibold text-text-muted uppercase tracking-wide">
          AI Model
        </label>
        <select
          id="model-select"
          value={plan.model || 'claude-sonnet-4-20250514'}
          onChange={(e) => db.plans.update(plan.id, { model: e.target.value, updatedAt: Date.now() })}
          className="w-full mt-2 bg-bg rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Weekly schedule overview */}
      <div className="bg-surface rounded-xl p-4 mb-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Weekly Schedule</h2>
        <div className="space-y-2">
          {scheduleByDay.map(({ dayName, dayIndex, routines: dayRoutines }) => (
            <div key={dayIndex} className="flex items-center gap-3">
              <span className={`text-sm w-12 ${dayRoutines.length > 0 ? 'text-text font-medium' : 'text-text-muted'}`}>
                {dayName.slice(0, 3)}
              </span>
              {dayRoutines.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {dayRoutines.map((r) => (
                    <span key={r.id} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {r.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-text-muted">Rest</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Routines */}
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Routines</h2>
      {routines.length === 0 ? (
        <div className="bg-surface rounded-xl p-6 text-center">
          <p className="text-text-muted mb-2">No routines yet</p>
          <p className="text-sm text-text-muted">Go to the Chat tab and ask AI to create a workout plan!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              exercises={getRoutineExercises(routine.id)}
              onDelete={() => deleteRoutine(routine.id)}
              onDeleteExercise={(exerciseId) => deleteExercise(exerciseId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
