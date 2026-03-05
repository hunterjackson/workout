import { db } from './db';

export async function serializePlan(planId: string) {
  const plan = await db.plans.get(planId);
  if (!plan) return null;

  const routines = await db.routines.where('planId').equals(planId).sortBy('order');
  const routineIds = routines.map((r) => r.id);
  const allExercises = routineIds.length > 0
    ? await db.exercises.where('routineId').anyOf(routineIds).sortBy('order')
    : [];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    plan: { id: plan.id, name: plan.name, goal: plan.goal, context: plan.context },
    routines: routines.map((r) => ({
      id: r.id,
      name: r.name,
      scheduledDays: r.schedule.filter((d) => d >= 0 && d <= 6).map((d) => dayNames[d]),
      notes: r.notes,
      exercises: allExercises
        .filter((e) => e.routineId === r.id)
        .map((e) => ({
          id: e.id,
          name: e.name,
          sets: e.sets,
          exerciseType: e.exerciseType,
          metrics: e.metrics,
          restSeconds: e.restSeconds,
          notes: e.notes,
          videoUrl: e.videoUrl,
        })),
    })),
  };
}
