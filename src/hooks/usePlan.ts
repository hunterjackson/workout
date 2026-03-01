import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function usePlan(planId: string | undefined) {
  const plan = useLiveQuery(
    () => (planId ? db.plans.get(planId) : undefined),
    [planId]
  );

  const routines = useLiveQuery(
    () => (planId ? db.routines.where('planId').equals(planId).sortBy('order') : []),
    [planId]
  );

  const exercises = useLiveQuery(async () => {
    if (!routines || routines.length === 0) return [];
    const routineIds = routines.map((r) => r.id);
    return db.exercises.where('routineId').anyOf(routineIds).sortBy('order');
  }, [routines]);

  const getRoutineExercises = (routineId: string) =>
    exercises?.filter((e) => e.routineId === routineId) ?? [];

  const getTodaysRoutines = () => {
    const today = new Date().getDay();
    return routines?.filter((r) => r.schedule.includes(today)) ?? [];
  };

  return { plan, routines: routines ?? [], exercises: exercises ?? [], getRoutineExercises, getTodaysRoutines };
}

export function usePlans() {
  return useLiveQuery(() => db.plans.orderBy('updatedAt').reverse().toArray()) ?? [];
}
