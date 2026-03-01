import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { type ReactElement } from 'react';
import { db } from '../lib/db';
import type { Plan, Routine, Exercise, Workout, WorkoutSet, ChatMessage } from '../lib/types';
import { nanoid } from 'nanoid';

// Wrap components with MemoryRouter for testing
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: RenderOptions & MemoryRouterProps = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
    options
  );
}

// Reset Dexie between tests
export async function resetDb() {
  await db.plans.clear();
  await db.routines.clear();
  await db.exercises.clear();
  await db.workouts.clear();
  await db.workoutSets.clear();
  await db.chatMessages.clear();
}

// Factory helpers
export function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: nanoid(),
    name: 'Test Plan',
    goal: 'Get stronger',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function makeRoutine(planId: string, overrides: Partial<Routine> = {}): Routine {
  return {
    id: nanoid(),
    planId,
    name: 'Push Day',
    schedule: [1, 3, 5],
    notes: 'Focus on chest and shoulders',
    order: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

export function makeExercise(routineId: string, overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: nanoid(),
    routineId,
    name: 'Bench Press',
    sets: 4,
    reps: '8-10',
    weight: 135,
    unit: 'lbs',
    restSeconds: 90,
    notes: 'Control the eccentric',
    order: 0,
    ...overrides,
  };
}

export function makeWorkout(planId: string, routineIds: string[], overrides: Partial<Workout> = {}): Workout {
  return {
    id: nanoid(),
    planId,
    date: new Date().toISOString().split('T')[0],
    routineIds,
    startedAt: Date.now() - 3600000,
    completedAt: Date.now(),
    ...overrides,
  };
}

export function makeWorkoutSet(workoutId: string, exerciseId: string, overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: nanoid(),
    workoutId,
    exerciseId,
    exerciseName: 'Bench Press',
    setNumber: 1,
    reps: 10,
    weight: 135,
    completed: true,
    ...overrides,
  };
}

export function makeChatMessage(planId: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: nanoid(),
    planId,
    role: 'user',
    content: 'Build me a workout plan',
    createdAt: Date.now(),
    ...overrides,
  };
}

// Seed a full plan with routines and exercises
export async function seedPlan() {
  const plan = makePlan();
  await db.plans.add(plan);

  const routine1 = makeRoutine(plan.id, { name: 'Push Day', schedule: [1, 3], order: 0 });
  const routine2 = makeRoutine(plan.id, { name: 'Pull Day', schedule: [2, 4], order: 1 });
  await db.routines.bulkAdd([routine1, routine2]);

  const ex1 = makeExercise(routine1.id, { name: 'Bench Press', order: 0 });
  const ex2 = makeExercise(routine1.id, { name: 'Overhead Press', weight: 95, order: 1 });
  const ex3 = makeExercise(routine2.id, { name: 'Barbell Row', weight: 155, order: 0 });
  await db.exercises.bulkAdd([ex1, ex2, ex3]);

  return { plan, routines: [routine1, routine2], exercises: [ex1, ex2, ex3] };
}
