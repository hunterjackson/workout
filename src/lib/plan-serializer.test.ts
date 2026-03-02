import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { serializePlan } from './plan-serializer';
import { resetDb, makePlan, makeRoutine, makeExercise } from '../test/helpers';

describe('serializePlan', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('should return null for non-existent plan', async () => {
    const result = await serializePlan('nonexistent');
    expect(result).toBeNull();
  });

  it('should serialize an empty plan', async () => {
    const plan = makePlan({ name: 'Empty Plan', goal: 'Test' });
    await db.plans.add(plan);

    const result = await serializePlan(plan.id);
    expect(result).toEqual({
      plan: { id: plan.id, name: 'Empty Plan', goal: 'Test' },
      routines: [],
    });
  });

  it('should serialize plan with routines and exercises', async () => {
    const plan = makePlan({ name: 'Full Plan' });
    await db.plans.add(plan);

    const routine = makeRoutine(plan.id, {
      name: 'Push Day',
      schedule: [1, 3, 5], // Mon, Wed, Fri
      notes: 'Go hard',
      order: 0,
    });
    await db.routines.add(routine);

    const ex1 = makeExercise(routine.id, {
      name: 'Bench Press',
      sets: 4,
      reps: '8-10',
      weight: 135,
      unit: 'lbs',
      restSeconds: 90,
      notes: 'Arch your back',
      videoUrl: 'https://youtube.com/watch?v=abc',
      order: 0,
    });
    const ex2 = makeExercise(routine.id, {
      name: 'Pushups',
      sets: 3,
      reps: 'AMRAP',
      unit: 'bodyweight',
      order: 1,
    });
    await db.exercises.bulkAdd([ex1, ex2]);

    const result = await serializePlan(plan.id);

    expect(result!.plan.name).toBe('Full Plan');
    expect(result!.routines).toHaveLength(1);
    expect(result!.routines[0].name).toBe('Push Day');
    expect(result!.routines[0].scheduledDays).toEqual(['Monday', 'Wednesday', 'Friday']);
    expect(result!.routines[0].notes).toBe('Go hard');
    expect(result!.routines[0].exercises).toHaveLength(2);
    expect(result!.routines[0].exercises[0].name).toBe('Bench Press');
    expect(result!.routines[0].exercises[0].weight).toBe(135);
    expect(result!.routines[0].exercises[1].name).toBe('Pushups');
  });

  it('should serialize multiple routines in order', async () => {
    const plan = makePlan();
    await db.plans.add(plan);

    const r1 = makeRoutine(plan.id, { name: 'Push', order: 0 });
    const r2 = makeRoutine(plan.id, { name: 'Pull', order: 1 });
    const r3 = makeRoutine(plan.id, { name: 'Legs', order: 2 });
    await db.routines.bulkAdd([r3, r1, r2]); // Intentionally out of order

    const result = await serializePlan(plan.id);

    expect(result!.routines.map((r) => r.name)).toEqual(['Push', 'Pull', 'Legs']);
  });

  it('should map schedule numbers to day names', async () => {
    const plan = makePlan();
    await db.plans.add(plan);

    const routine = makeRoutine(plan.id, { schedule: [0, 1, 2, 3, 4, 5, 6] });
    await db.routines.add(routine);

    const result = await serializePlan(plan.id);
    expect(result!.routines[0].scheduledDays).toEqual([
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ]);
  });

  it('should assign exercises to correct routines', async () => {
    const plan = makePlan();
    await db.plans.add(plan);

    const r1 = makeRoutine(plan.id, { name: 'Push', order: 0 });
    const r2 = makeRoutine(plan.id, { name: 'Pull', order: 1 });
    await db.routines.bulkAdd([r1, r2]);

    const ex1 = makeExercise(r1.id, { name: 'Bench', order: 0 });
    const ex2 = makeExercise(r2.id, { name: 'Row', order: 0 });
    await db.exercises.bulkAdd([ex1, ex2]);

    const result = await serializePlan(plan.id);

    expect(result!.routines[0].exercises).toHaveLength(1);
    expect(result!.routines[0].exercises[0].name).toBe('Bench');
    expect(result!.routines[1].exercises).toHaveLength(1);
    expect(result!.routines[1].exercises[0].name).toBe('Row');
  });

  it('should filter out invalid schedule day numbers', async () => {
    // Bug: out-of-range day values (e.g., 7, -1) produce undefined in scheduledDays
    const plan = makePlan();
    await db.plans.add(plan);

    const routine = makeRoutine(plan.id, { schedule: [0, 7, -1, 3] });
    await db.routines.add(routine);

    const result = await serializePlan(plan.id);
    // Should only include valid day names, filtering out undefined
    const days = result!.routines[0].scheduledDays;
    expect(days).not.toContain(undefined);
    expect(days).toContain('Sunday');
    expect(days).toContain('Wednesday');
    expect(days).toHaveLength(2);
  });

  it('should not include internal fields (routineId, order) in exercise output', async () => {
    const plan = makePlan();
    await db.plans.add(plan);
    const routine = makeRoutine(plan.id);
    await db.routines.add(routine);
    const exercise = makeExercise(routine.id);
    await db.exercises.add(exercise);

    const result = await serializePlan(plan.id);
    const serializedEx = result!.routines[0].exercises[0];

    // These internal fields should NOT be in the serialized output
    expect(serializedEx).not.toHaveProperty('routineId');
    expect(serializedEx).not.toHaveProperty('order');
    // These SHOULD be present
    expect(serializedEx).toHaveProperty('id');
    expect(serializedEx).toHaveProperty('name');
    expect(serializedEx).toHaveProperty('sets');
    expect(serializedEx).toHaveProperty('reps');
  });
});
