import { describe, it, expect, beforeEach } from 'vitest';
import { db, WorkoutDB } from './db';
import { resetDb, makePlan, makeRoutine, makeExercise, makeWorkout, makeWorkoutSet, makeChatMessage } from '../test/helpers';

describe('WorkoutDB', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('should be an instance of WorkoutDB', () => {
    expect(db).toBeInstanceOf(WorkoutDB);
  });

  it('should have all required tables', () => {
    expect(db.plans).toBeDefined();
    expect(db.routines).toBeDefined();
    expect(db.exercises).toBeDefined();
    expect(db.workouts).toBeDefined();
    expect(db.workoutSets).toBeDefined();
    expect(db.chatMessages).toBeDefined();
  });

  describe('plans table', () => {
    it('should CRUD a plan', async () => {
      const plan = makePlan({ name: 'Strength Program' });
      await db.plans.add(plan);

      const retrieved = await db.plans.get(plan.id);
      expect(retrieved).toEqual(plan);

      await db.plans.update(plan.id, { name: 'Updated' });
      const updated = await db.plans.get(plan.id);
      expect(updated?.name).toBe('Updated');

      await db.plans.delete(plan.id);
      const deleted = await db.plans.get(plan.id);
      expect(deleted).toBeUndefined();
    });

    it('should store and retrieve a plan with a model field', async () => {
      const plan = makePlan({ name: 'AI Plan', model: 'claude-haiku-4-5' });
      await db.plans.add(plan);

      const retrieved = await db.plans.get(plan.id);
      expect(retrieved?.model).toBe('claude-haiku-4-5');
    });

    it('should default model to undefined when not set', async () => {
      const plan = makePlan({ name: 'No Model' });
      await db.plans.add(plan);

      const retrieved = await db.plans.get(plan.id);
      expect(retrieved?.model).toBeUndefined();
    });

    it('should query plans by createdAt index', async () => {
      const p1 = makePlan({ name: 'First', createdAt: 1000 });
      const p2 = makePlan({ name: 'Second', createdAt: 2000 });
      await db.plans.bulkAdd([p1, p2]);

      const sorted = await db.plans.orderBy('createdAt').toArray();
      expect(sorted[0].name).toBe('First');
      expect(sorted[1].name).toBe('Second');
    });
  });

  describe('routines table', () => {
    it('should query routines by planId', async () => {
      const plan = makePlan();
      await db.plans.add(plan);
      const r1 = makeRoutine(plan.id, { name: 'Push', order: 0 });
      const r2 = makeRoutine(plan.id, { name: 'Pull', order: 1 });
      const r3 = makeRoutine('other-plan', { name: 'Legs', order: 0 });
      await db.routines.bulkAdd([r1, r2, r3]);

      const planRoutines = await db.routines.where('planId').equals(plan.id).sortBy('order');
      expect(planRoutines).toHaveLength(2);
      expect(planRoutines[0].name).toBe('Push');
      expect(planRoutines[1].name).toBe('Pull');
    });
  });

  describe('exercises table', () => {
    it('should query exercises by routineId and order', async () => {
      const plan = makePlan();
      await db.plans.add(plan);
      const routine = makeRoutine(plan.id);
      await db.routines.add(routine);

      const ex1 = makeExercise(routine.id, { name: 'Bench', order: 0 });
      const ex2 = makeExercise(routine.id, { name: 'Flyes', order: 1 });
      await db.exercises.bulkAdd([ex1, ex2]);

      const exercises = await db.exercises.where('routineId').equals(routine.id).sortBy('order');
      expect(exercises).toHaveLength(2);
      expect(exercises[0].name).toBe('Bench');
      expect(exercises[1].name).toBe('Flyes');
    });

    it('should support anyOf for multiple routineIds', async () => {
      const r1 = makeRoutine('plan-1', { name: 'A' });
      const r2 = makeRoutine('plan-1', { name: 'B' });
      await db.routines.bulkAdd([r1, r2]);

      const ex1 = makeExercise(r1.id, { name: 'Ex1' });
      const ex2 = makeExercise(r2.id, { name: 'Ex2' });
      await db.exercises.bulkAdd([ex1, ex2]);

      const all = await db.exercises.where('routineId').anyOf([r1.id, r2.id]).toArray();
      expect(all).toHaveLength(2);
    });
  });

  describe('workouts table', () => {
    it('should store and query workouts by planId', async () => {
      const plan = makePlan();
      await db.plans.add(plan);
      const w = makeWorkout(plan.id, ['r1']);
      await db.workouts.add(w);

      const results = await db.workouts.where('planId').equals(plan.id).toArray();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(w.id);
    });
  });

  describe('workoutSets table', () => {
    it('should store and query sets by workoutId', async () => {
      const ws1 = makeWorkoutSet('w1', 'e1', { setNumber: 1 });
      const ws2 = makeWorkoutSet('w1', 'e1', { setNumber: 2 });
      const ws3 = makeWorkoutSet('w2', 'e1', { setNumber: 1 });
      await db.workoutSets.bulkAdd([ws1, ws2, ws3]);

      const sets = await db.workoutSets.where('workoutId').equals('w1').toArray();
      expect(sets).toHaveLength(2);
    });
  });

  describe('chatMessages table', () => {
    it('should store and query messages by planId sorted by createdAt', async () => {
      const m1 = makeChatMessage('p1', { content: 'First', createdAt: 1000 });
      const m2 = makeChatMessage('p1', { content: 'Second', createdAt: 2000 });
      const m3 = makeChatMessage('p2', { content: 'Other plan', createdAt: 1500 });
      await db.chatMessages.bulkAdd([m1, m2, m3]);

      const msgs = await db.chatMessages.where('planId').equals('p1').sortBy('createdAt');
      expect(msgs).toHaveLength(2);
      expect(msgs[0].content).toBe('First');
      expect(msgs[1].content).toBe('Second');
    });
  });
});
