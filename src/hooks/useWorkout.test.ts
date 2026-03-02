import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { db } from '../lib/db';
import { resetDb, makePlan, makeRoutine, makeExercise } from '../test/helpers';
import { useWorkout } from './useWorkout';

describe('useWorkout', () => {
  let planId: string;
  let routineId: string;

  beforeEach(async () => {
    await resetDb();

    const plan = makePlan();
    await db.plans.add(plan);
    planId = plan.id;

    const routine = makeRoutine(planId, { name: 'Push Day' });
    await db.routines.add(routine);
    routineId = routine.id;

    const exercise = makeExercise(routineId, {
      name: 'Bench Press',
      sets: 3,
      reps: '10',
      weight: 135,
    });
    await db.exercises.add(exercise);
  });

  it('should record startedAt as the time the workout began, not completion time', async () => {
    // Bug: startedAt is set to Date.now() inside completeWorkout(),
    // meaning it records completion time instead of when the workout started.

    const { result } = renderHook(() => useWorkout(planId));

    const timeBeforeStart = Date.now();

    await act(async () => {
      await result.current.initializeSets([routineId]);
    });

    const timeAfterStart = Date.now();

    // Toggle a set so we have completed data
    act(() => {
      const firstSet = result.current.sets[0];
      result.current.toggleSet(firstSet.exerciseId, firstSet.setNumber);
    });

    await act(async () => {
      await result.current.completeWorkout('Great workout');
    });

    // Verify the saved workout
    const workouts = await db.workouts.toArray();
    expect(workouts).toHaveLength(1);

    const workout = workouts[0];

    // startedAt should reflect when workout STARTED (near timeBeforeStart/timeAfterStart),
    // not when it was completed. The key check: startedAt should be captured
    // during initializeSets, so it should be <= timeAfterStart.
    expect(workout.startedAt).toBeGreaterThanOrEqual(timeBeforeStart);
    expect(workout.startedAt).toBeLessThanOrEqual(timeAfterStart);
  });
});
